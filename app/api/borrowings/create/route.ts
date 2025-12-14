/**
 * =============================================================================
 * API: /api/borrowings/create - Tworzenie wypożyczenia (LIBRARIAN/ADMIN)
 * =============================================================================
 * 
 * POST /api/borrowings/create - Utwórz nowe wypożyczenie dla użytkownika
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Handler POST - Tworzenie wypożyczenia
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, bookId, copyId, daysToReturn = 30 } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID użytkownika jest wymagane" },
        { status: 400 }
      );
    }

    if (!bookId && !copyId) {
      return NextResponse.json(
        { error: "ID książki lub egzemplarza jest wymagane" },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik istnieje i jest aktywny
    const [userCheck] = await pool.query<RowDataPacket[]>(
      `SELECT UzytkownikId, RolaId FROM uzytkownicy WHERE UzytkownikId = ? AND IsDeleted = 0 AND Aktywny = 1`,
      [userId]
    );

    if (userCheck.length === 0) {
      return NextResponse.json(
        { error: "Użytkownik nie istnieje lub jest nieaktywny" },
        { status: 404 }
      );
    }

    // Sprawdź czy użytkownik jest czytelnikiem
    const [roleCheck] = await pool.query<RowDataPacket[]>(
      `SELECT NazwaRoli FROM role WHERE RolaId = ?`,
      [userCheck[0].RolaId]
    );

    if (roleCheck[0].NazwaRoli !== "CZYTELNIK") {
      return NextResponse.json(
        { error: "Tylko czytelnicy mogą wypożyczać książki" },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik nie ma nieopłaconych kar
    const [finesCheck] = await pool.query<RowDataPacket[]>(
      `SELECT SUM(k.Kwota) as totalFines 
       FROM kary k
       JOIN wypozyczenia w ON k.WypozyczenieId = w.WypozyczenieId
       WHERE w.UzytkownikId = ? AND k.Status = 'Naliczona'`,
      [userId]
    );

    if (finesCheck[0].totalFines > 0) {
      return NextResponse.json(
        { error: `Użytkownik ma nieopłacone kary: ${finesCheck[0].totalFines} zł` },
        { status: 400 }
      );
    }

    let selectedCopyId = copyId;
    let selectedBookId = bookId;

    // Jeśli podano tylko bookId, znajdź dostępny egzemplarz
    if (!copyId && bookId) {
      const [availableCopy] = await pool.query<RowDataPacket[]>(
        `SELECT EgzemplarzId FROM egzemplarze 
         WHERE KsiazkaId = ? AND Status = 'Dostepny' AND IsDeleted = 0
         LIMIT 1`,
        [bookId]
      );

      if (availableCopy.length === 0) {
        return NextResponse.json(
          { error: "Brak dostępnych egzemplarzy tej książki" },
          { status: 400 }
        );
      }

      selectedCopyId = availableCopy[0].EgzemplarzId;
    }

    // Pobierz dane egzemplarza
    const [copyData] = await pool.query<RowDataPacket[]>(
      `SELECT e.EgzemplarzId, e.KsiazkaId, e.Status, k.Tytul
       FROM egzemplarze e
       JOIN ksiazki k ON e.KsiazkaId = k.KsiazkaId
       WHERE e.EgzemplarzId = ? AND e.IsDeleted = 0`,
      [selectedCopyId]
    );

    if (copyData.length === 0) {
      return NextResponse.json(
        { error: "Egzemplarz nie istnieje" },
        { status: 404 }
      );
    }

    if (copyData[0].Status !== "Dostepny") {
      return NextResponse.json(
        { error: "Egzemplarz nie jest dostępny do wypożyczenia" },
        { status: 400 }
      );
    }

    selectedBookId = copyData[0].KsiazkaId;
    const bookTitle = copyData[0].Tytul;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Utwórz wypożyczenie
      const terminZwrotu = new Date();
      terminZwrotu.setDate(terminZwrotu.getDate() + daysToReturn);

      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO wypozyczenia (UzytkownikId, EgzemplarzId, DataWypozyczenia, TerminZwrotu, Status)
         VALUES (?, ?, CURDATE(), ?, 'Aktywne')`,
        [userId, selectedCopyId, terminZwrotu.toISOString().split('T')[0]]
      );

      // Zmień status egzemplarza
      await connection.query<ResultSetHeader>(
        `UPDATE egzemplarze SET Status = 'Wypozyczony' WHERE EgzemplarzId = ?`,
        [selectedCopyId]
      );

      // Zmniejsz liczbę dostępnych egzemplarzy
      await connection.query(
        `UPDATE ksiazki SET DostepneEgzemplarze = DostepneEgzemplarze - 1 WHERE KsiazkaId = ?`,
        [selectedBookId]
      );

      await connection.commit();

      // Log operacji
      await pool.query(
        `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
         VALUES ('Audyt', ?, ?, 'Wypozyczenia', ?)`,
        [user.id, `Utworzono wypożyczenie: "${bookTitle}"`, result.insertId]
      );

      // Powiadomienie dla użytkownika
      await pool.query(
        `INSERT INTO powiadomienia (UzytkownikId, Typ, Status, Temat, Tresc)
         VALUES (?, 'InApp', 'Oczekuje', 'Nowe wypożyczenie', ?)`,
        [userId, `Wypożyczono książkę "${bookTitle}". Termin zwrotu: ${terminZwrotu.toLocaleDateString('pl-PL')}`]
      );

      return NextResponse.json({
        success: true,
        message: "Wypożyczenie zostało utworzone",
        borrowingId: result.insertId,
        dueDate: terminZwrotu.toISOString().split('T')[0]
      }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Błąd API POST /api/borrowings/create:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
