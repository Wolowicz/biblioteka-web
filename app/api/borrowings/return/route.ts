/**
 * =============================================================================
 * API: POST /api/borrowings/return - Oddawanie wypożyczonej książki
 * =============================================================================
 * 
 * Endpoint chroniony umożliwiający oddanie wypożyczonej książki.
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserSessionSSR } from "@/lib/auth/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
    }

    const { bookId } = await request.json();

    if (!bookId) {
      return NextResponse.json(
        { error: "Wymagane pole: bookId" },
        { status: 400 }
      );
    }

    // Znajdź aktywne wypożyczenie użytkownika dla tej książki
    const [borrowings] = await pool.query<RowDataPacket[]>(
      `
      SELECT w.WypozyczenieId, w.EgzemplarzId
      FROM Wypozyczenia w
      JOIN Egzemplarze e ON w.EgzemplarzId = e.EgzemplarzId
      WHERE w.UzytkownikId = ?
        AND e.KsiazkaId = ?
        AND w.Status = 'Aktywne'
      LIMIT 1
      `,
      [user.id, bookId]
    );

    if (borrowings.length === 0) {
      return NextResponse.json(
        { error: "Nie masz aktywnego wypożyczenia tej książki" },
        { status: 400 }
      );
    }

    const borrowing = borrowings[0];

    // Zaktualizuj wypożyczenie - ustaw datę zwrotu i status
    await pool.query<ResultSetHeader>(
      `
      UPDATE Wypozyczenia
      SET DataZwrotu = NOW(),
          Status = 'Zakonczone',
          UpdatedAt = NOW(),
          UpdatedBy = ?
      WHERE WypozyczenieId = ?
      `,
      [user.id, borrowing.WypozyczenieId]
    );

    // Zaktualizuj status egzemplarza na dostępny
    await pool.query<ResultSetHeader>(
      `
      UPDATE Egzemplarze
      SET Status = 'Dostepny'
      WHERE EgzemplarzId = ?
      `,
      [borrowing.EgzemplarzId]
    );

    // Zaktualizuj liczbę dostępnych egzemplarzy książki
    await pool.query<ResultSetHeader>(
      `
      UPDATE ksiazki k
      SET DostepneEgzemplarze = (
        SELECT COUNT(*) FROM egzemplarze e 
        WHERE e.KsiazkaId = k.KsiazkaId 
        AND e.Status = 'Dostepny' 
        AND e.IsDeleted = 0
      )
      WHERE k.KsiazkaId = ?
      `,
      [bookId]
    );

    // Log operacji
    await pool.query(
      `
      INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
      VALUES ('Audyt', ?, 'Oddano książkę', 'Wypozyczenia', ?)
      `,
      [user.id, borrowing.WypozyczenieId]
    );

    return NextResponse.json({
      success: true,
      message: "Książka została oddana"
    });
  } catch (error) {
    console.error("Błąd API POST /api/borrowings/return:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
