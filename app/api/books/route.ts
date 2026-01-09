/**
 * =============================================================================
 * API: /api/books - Zarządzanie katalogiem książek
 * =============================================================================
 * 
 * GET  /api/books - Lista wszystkich książek (publiczny)
 * POST /api/books - Dodaj nową książkę (ADMIN/LIBRARIAN)
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserSessionSSR } from "@/lib/auth/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";

/**
 * Handler GET - Pobieranie listy wszystkich książek
 * 
 * Parametry query:
 * - available=true: Tylko książki z dostępnymi egzemplarzami
 * 
 * @returns {Promise<NextResponse>} Odpowiedź JSON z tablicą książek
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyAvailable = searchParams.get("available") === "true";

    let whereClause = "k.IsDeleted = 0";
    if (onlyAvailable) {
      whereClause += " AND k.DostepneEgzemplarze > 0";
    }

    // === SEKCJA: Zapytanie do bazy danych ===
    // Pobieramy książki z zagregowanymi autorami, gatunkami, informacją o dostępności i średnią oceną
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        k.KsiazkaId AS id,
        k.Tytul AS title,
        k.OkladkaUrl AS coverUrl,
        COALESCE(GROUP_CONCAT(DISTINCT a.ImieNazwisko SEPARATOR ', '), 'Brak autora') AS authors,
        (k.DostepneEgzemplarze > 0) AS available,
        k.DostepneEgzemplarze AS availableCopies,
        COALESCE((
          SELECT AVG(r.Ocena) 
          FROM recenzje r 
          WHERE r.KsiazkaId = k.KsiazkaId 
          AND r.Status = 'Zatwierdzona' 
          AND r.IsDeleted = 0
        ), 0) AS averageRating,
        (
          SELECT COUNT(*) 
          FROM recenzje r 
          WHERE r.KsiazkaId = k.KsiazkaId 
          AND r.Status = 'Zatwierdzona' 
          AND r.IsDeleted = 0
        ) AS reviewCount,
        (
          SELECT GROUP_CONCAT(DISTINCT g.Nazwa SEPARATOR ', ')
          FROM ksiazki_gatunki kg
          JOIN gatunki g ON g.GatunekId = kg.GatunekId
          WHERE kg.KsiazkaId = k.KsiazkaId AND g.IsDeleted = 0
        ) AS genres
      FROM Ksiazki k
      LEFT JOIN KsiazkiAutorzy ka ON ka.KsiazkaId = k.KsiazkaId
      LEFT JOIN Autorzy a ON a.AutorId = ka.AutorId
      WHERE ${whereClause}
      GROUP BY k.KsiazkaId, k.Tytul, k.DostepneEgzemplarze
      ORDER BY k.Tytul;
      `
    );

    // === SEKCJA: Odpowiedź sukcesu ===
    return NextResponse.json({ books: rows });
  } catch (err) {
    // === SEKCJA: Obsługa błędów ===
    console.error("DB error /api/books:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych" },
      { status: 500 }
    );
  }
}

/**
 * Handler POST - Dodawanie nowej książki
 * 
 * Wymaga uprawnień ADMIN lub LIBRARIAN.
 * Tworzy nową książkę, autora (jeśli nie istnieje) i egzemplarze.
 */
export async function POST(request: NextRequest) {
  try {
    // Sprawdź uprawnienia
    const user = await getUserSessionSSR();
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json(
        { error: "Brak uprawnień do dodawania książek" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, author, isbn, genre, publisher, publicationYear, totalCopies, description } = body;

    // Walidacja
    if (!title || !author || !isbn) {
      return NextResponse.json(
        { error: "Tytuł, autor i ISBN są wymagane" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Sprawdź czy autor istnieje, jeśli nie - utwórz
      const [existingAuthors] = await connection.query<RowDataPacket[]>(
        `SELECT AutorId FROM autorzy WHERE ImieNazwisko = ?`,
        [author]
      );

      let authorId: number;
      if (existingAuthors.length > 0) {
        authorId = existingAuthors[0].AutorId;
      } else {
        const [authorResult] = await connection.query<ResultSetHeader>(
          `INSERT INTO autorzy (ImieNazwisko) VALUES (?)`,
          [author]
        );
        authorId = authorResult.insertId;
      }

      // 2. Dodaj książkę
      const [bookResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO ksiazki (numerISBN, Tytul, Wydawnictwo, Rok, LiczbaEgzemplarzy, DostepneEgzemplarze) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [isbn, title, publisher || null, publicationYear || null, totalCopies || 1, totalCopies || 1]
      );
      const bookId = bookResult.insertId;

      // 3. Powiąż autora z książką
      await connection.query(
        `INSERT INTO ksiazkiautorzy (KsiazkaId, AutorId) VALUES (?, ?)`,
        [bookId, authorId]
      );

      // 4. Utwórz egzemplarze
      const copies = totalCopies || 1;
      for (let i = 1; i <= copies; i++) {
        const inventoryNumber = `${isbn.slice(-4)}-${String(i).padStart(3, '0')}`;
        await connection.query(
          `INSERT INTO egzemplarze (KsiazkaId, NumerInwentarzowy, Status) VALUES (?, ?, 'Dostepny')`,
          [bookId, inventoryNumber]
        );
      }

      // 5. Dodaj log
      await connection.query(
        `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId) 
         VALUES ('Audyt', ?, ?, 'Ksiazki', ?)`,
        [user.id, `Dodano książkę: ${title}`, bookId]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        bookId,
        message: `Książka "${title}" została dodana do katalogu`
      }, { status: 201 });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error("Error POST /api/books:", err);
    return NextResponse.json(
      { error: "Błąd podczas dodawania książki" },
      { status: 500 }
    );
  }
}
