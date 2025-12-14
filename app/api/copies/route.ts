/**
 * =============================================================================
 * API: /api/copies - Zarządzanie egzemplarzami książek (LIBRARIAN/ADMIN)
 * =============================================================================
 * 
 * GET  /api/copies - Lista egzemplarzy (z opcjonalnym filtrem po książce)
 * POST /api/copies - Dodanie nowego egzemplarza
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Handler GET - Lista egzemplarzy
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    let query = `
      SELECT 
        e.EgzemplarzId AS id,
        e.KsiazkaId AS bookId,
        k.Tytul AS bookTitle,
        e.NumerInwentarzowy AS inventoryNumber,
        e.Status AS status,
        e.CreatedAt AS createdAt,
        e.IsDeleted AS deleted
      FROM egzemplarze e
      JOIN ksiazki k ON e.KsiazkaId = k.KsiazkaId
      WHERE e.IsDeleted = 0
    `;

    const params: any[] = [];

    if (bookId) {
      query += ` AND e.KsiazkaId = ?`;
      params.push(parseInt(bookId));
    }

    query += ` ORDER BY e.CreatedAt DESC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Błąd API GET /api/copies:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler POST - Dodawanie egzemplarza
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const body = await request.json();
    const { bookId, inventoryNumber, status = "Dostepny" } = body;

    if (!bookId || !inventoryNumber) {
      return NextResponse.json(
        { error: "ID książki i numer inwentarzowy są wymagane" },
        { status: 400 }
      );
    }

    // Sprawdź czy książka istnieje
    const [bookCheck] = await pool.query<RowDataPacket[]>(
      `SELECT KsiazkaId FROM ksiazki WHERE KsiazkaId = ? AND IsDeleted = 0`,
      [bookId]
    );

    if (bookCheck.length === 0) {
      return NextResponse.json(
        { error: "Książka nie istnieje" },
        { status: 404 }
      );
    }

    // Sprawdź czy numer inwentarzowy nie jest zajęty
    const [existingCopy] = await pool.query<RowDataPacket[]>(
      `SELECT EgzemplarzId FROM egzemplarze WHERE NumerInwentarzowy = ?`,
      [inventoryNumber]
    );

    if (existingCopy.length > 0) {
      return NextResponse.json(
        { error: "Numer inwentarzowy jest już zajęty" },
        { status: 409 }
      );
    }

    // Walidacja statusu
    const validStatuses = ["Dostepny", "Wypozyczony", "Uszkodzony", "Zaginiony", "Zarezerwowany"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Nieprawidłowy status egzemplarza" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Dodaj egzemplarz
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO egzemplarze (KsiazkaId, NumerInwentarzowy, Status)
         VALUES (?, ?, ?)`,
        [bookId, inventoryNumber, status]
      );

      // Aktualizuj liczniki w książce
      await connection.query(
        `UPDATE ksiazki 
         SET LiczbaEgzemplarzy = LiczbaEgzemplarzy + 1,
             DostepneEgzemplarze = DostepneEgzemplarze + ?
         WHERE KsiazkaId = ?`,
        [status === "Dostepny" ? 1 : 0, bookId]
      );

      await connection.commit();

      // Log operacji
      await pool.query(
        `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
         VALUES ('Audyt', ?, 'Dodano nowy egzemplarz', 'Egzemplarze', ?)`,
        [user.id, result.insertId]
      );

      return NextResponse.json({
        success: true,
        message: "Egzemplarz został dodany",
        copyId: result.insertId
      }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Błąd API POST /api/copies:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
