/**
 * =============================================================================
 * API: /api/admin/books/[id]/copies - Zarządzanie egzemplarzami książki
 * =============================================================================
 * 
 * GET - Zwraca listę egzemplarzy danej książki
 * POST - Dodaje nowy egzemplarz
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET - Pobierz egzemplarze książki
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await context.params;
    const bookId = parseInt(id);

    const [copies] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        e.EgzemplarzId,
        e.NumerInwentarzowy AS KodKreskowy,
        e.Status,
        e.CreatedAt AS DataDodania,
        e.IsDeleted,
        CASE 
          WHEN w.WypozyczenieId IS NOT NULL THEN CONCAT(u.Imie, ' ', u.Nazwisko)
          ELSE NULL
        END AS borrowedBy,
        w.DataWypozyczenia,
        w.TerminZwrotu
      FROM egzemplarze e
      LEFT JOIN wypozyczenia w ON e.EgzemplarzId = w.EgzemplarzId AND w.Status = 'Aktywne'
      LEFT JOIN uzytkownicy u ON w.UzytkownikId = u.UzytkownikId
      WHERE e.KsiazkaId = ?
      ORDER BY e.EgzemplarzId ASC
      `,
      [bookId]
    );

    return NextResponse.json(copies);
  } catch (error) {
    console.error("Błąd API GET /api/admin/books/[id]/copies:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

/**
 * POST - Dodaj nowy egzemplarz
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await context.params;
    const bookId = parseInt(id);
    const body = await request.json();
    const { barcode, condition } = body;

    // Sprawdź czy książka istnieje
    const [bookCheck] = await pool.query<RowDataPacket[]>(
      `SELECT KsiazkaId FROM ksiazki WHERE KsiazkaId = ? AND IsDeleted = 0`,
      [bookId]
    );

    if (bookCheck.length === 0) {
      return NextResponse.json(
        { error: "Książka nie została znaleziona" },
        { status: 404 }
      );
    }

    // Sprawdź czy kod kreskowy nie jest zajęty
    if (barcode) {
      const [barcodeCheck] = await pool.query<RowDataPacket[]>(
        `SELECT EgzemplarzId FROM egzemplarze WHERE NumerInwentarzowy = ?`,
        [barcode]
      );

      if (barcodeCheck.length > 0) {
        return NextResponse.json(
          { error: "Ten kod kreskowy jest już używany" },
          { status: 409 }
        );
      }
    }

    // Dodaj egzemplarz
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO egzemplarze (KsiazkaId, NumerInwentarzowy, Status, CreatedAt)
      VALUES (?, ?, 'Dostepny', NOW())
      `,
      [bookId, barcode || null]
    );

    // Log operacji
    await pool.query(
      `
      INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
      VALUES ('Audyt', ?, ?, 'Egzemplarze', ?)
      `,
      [user.id, `Dodano nowy egzemplarz książki (ID: ${bookId})`, result.insertId]
    );

    return NextResponse.json({
      success: true,
      message: "Egzemplarz został dodany",
      id: result.insertId
    });
  } catch (error) {
    console.error("Błąd API POST /api/admin/books/[id]/copies:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
