import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { bookId } = await req.json();

    // --- 1. Pobieramy usera z cookie ---
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("userSession");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = JSON.parse(sessionCookie.value);
    const userId = Number(user.id);

    // --- 2. Szukamy wolnego egzemplarza ---
    const [copyRows] = await pool.query(
      `
      SELECT EgzemplarzId
      FROM Egzemplarze
      WHERE KsiazkaId = ? AND Status = 'Dostepny' AND IsDeleted = 0
      LIMIT 1
      `,
      [bookId]
    );

    const copies = copyRows as any[];

    if (copies.length === 0) {
      return NextResponse.json(
        { error: "Brak dostępnych egzemplarzy" },
        { status: 400 }
      );
    }

    const egzemplarzId = copies[0].EgzemplarzId;

    // --- 3. Tworzymy wypożyczenie ---
    const [insertResult] = await pool.query(
      `
      INSERT INTO Wypozyczenia (UzytkownikId, EgzemplarzId, DataWypozyczenia, Status)
      VALUES (?, ?, NOW(), 'Aktywne')
      `,
      [userId, egzemplarzId]
    );

    // --- 4. Ustawiamy egzemplarz jako zajęty ---
    await pool.query(
      `
      UPDATE Egzemplarze
      SET Status = 'Wypozyczony'
      WHERE EgzemplarzId = ?
      `,
      [egzemplarzId]
    );

    return NextResponse.json({
      message: "Rezerwacja utworzona",
      reservationId: (insertResult as any).insertId,
    });

  } catch (err) {
    console.error("Reservation error:", err);
    return NextResponse.json(
      { error: "Błąd podczas rezerwacji" },
      { status: 500 }
    );
  }
}
