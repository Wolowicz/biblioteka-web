/**
 * =============================================================================
 * API: GET /api/borrowings/check - Sprawdzanie czy użytkownik ma wypożyczoną książkę
 * =============================================================================
 * 
 * Query params:
 * - bookId: ID książki do sprawdzenia
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserSessionSSR } from "@/lib/auth/server";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ hasBorrowed: false });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json(
        { error: "Wymagany parametr: bookId" },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik ma aktywne wypożyczenie tej książki
    const [borrowings] = await pool.query<RowDataPacket[]>(
      `
      SELECT 1
      FROM Wypozyczenia w
      JOIN Egzemplarze e ON w.EgzemplarzId = e.EgzemplarzId
      WHERE w.UzytkownikId = ?
        AND e.KsiazkaId = ?
        AND w.Status = 'Aktywne'
      LIMIT 1
      `,
      [user.id, parseInt(bookId)]
    );

    return NextResponse.json({
      hasBorrowed: borrowings.length > 0
    });
  } catch (error) {
    console.error("Błąd API GET /api/borrowings/check:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
