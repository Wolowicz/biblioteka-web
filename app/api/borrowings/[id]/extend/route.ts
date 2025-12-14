/**
 * =============================================================================
 * API: Przedłużanie wypożyczenia
 * =============================================================================
 * 
 * PUT /api/borrowings/[id]/extend
 * Przedłuża wypożyczenie o 14 dni (maksymalnie 2 przedłużenia).
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserSessionSSR } from "@/lib/auth/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const EXTENSION_DAYS = 14;
const MAX_EXTENSIONS = 2;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Sprawdź autoryzację
    const user = await getUserSessionSSR();
    if (!user) {
      return NextResponse.json(
        { error: "Wymagane logowanie" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const borrowingId = parseInt(id, 10);

    if (isNaN(borrowingId)) {
      return NextResponse.json(
        { error: "Nieprawidłowy identyfikator wypożyczenia" },
        { status: 400 }
      );
    }

    // 2. Pobierz wypożyczenie
    const [borrowings] = await pool.query<RowDataPacket[]>(
      `SELECT w.*, e.KsiazkaId, k.Tytul
       FROM wypozyczenia w
       JOIN egzemplarze e ON w.EgzemplarzId = e.EgzemplarzId
       JOIN ksiazki k ON e.KsiazkaId = k.KsiazkaId
       WHERE w.WypozyczenieId = ? AND w.UzytkownikId = ? AND w.IsDeleted = 0`,
      [borrowingId, user.id]
    );

    if (borrowings.length === 0) {
      return NextResponse.json(
        { error: "Wypożyczenie nie znalezione" },
        { status: 404 }
      );
    }

    const borrowing = borrowings[0];

    // 3. Sprawdź czy już zwrócone
    if (borrowing.DataZwrotu) {
      return NextResponse.json(
        { error: "Książka została już zwrócona" },
        { status: 400 }
      );
    }

    // 4. Sprawdź limit przedłużeń
    const extensions = borrowing.LiczbaPrzedluzen || 0;
    if (extensions >= MAX_EXTENSIONS) {
      return NextResponse.json(
        { error: `Osiągnięto maksymalną liczbę przedłużeń (${MAX_EXTENSIONS})` },
        { status: 400 }
      );
    }

    // 5. Sprawdź czy nie ma kary
    const [fines] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM kary WHERE WypozyczenieId = ? AND Status = 'Naliczona'`,
      [borrowingId]
    );

    if (fines.length > 0) {
      return NextResponse.json(
        { error: "Nie można przedłużyć - istnieje niezapłacona kara" },
        { status: 400 }
      );
    }

    // 6. Oblicz nowy termin
    const currentDueDate = new Date(borrowing.TerminZwrotu);
    const now = new Date();
    const baseDate = currentDueDate > now ? currentDueDate : now;
    const newDueDate = new Date(baseDate);
    newDueDate.setDate(newDueDate.getDate() + EXTENSION_DAYS);

    // 7. Zaktualizuj wypożyczenie
    await pool.query<ResultSetHeader>(
      `UPDATE wypozyczenia 
       SET TerminZwrotu = ?, LiczbaPrzedluzen = COALESCE(LiczbaPrzedluzen, 0) + 1
       WHERE WypozyczenieId = ?`,
      [newDueDate.toISOString().split('T')[0], borrowingId]
    );

    // 8. Zapisz log
    await pool.query(
      `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
       VALUES ('Audyt', ?, ?, 'Wypozyczenia', ?)`,
      [user.id, `Przedłużono wypożyczenie "${borrowing.Tytul}"`, borrowingId]
    );

    return NextResponse.json({
      message: "Wypożyczenie przedłużone pomyślnie",
      newDueDate: newDueDate.toISOString().split('T')[0],
      extensionsLeft: MAX_EXTENSIONS - extensions - 1,
    });

  } catch (error) {
    console.error("Błąd przedłużania wypożyczenia:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
