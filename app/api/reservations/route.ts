// app/api/reservations/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { bookId } = await req.json();

    if (!bookId) {
      return NextResponse.json({ error: "Brak ID książki" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("userSession");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    try {
      user = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(user.id);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "Błędne ID użytkownika" }, { status: 400 });
    }

    // 2. Szukamy wolnego egzemplarza
    const [copies] = await pool.query(
      "SELECT Id FROM egzemplarze WHERE KsiazkaId = ? AND Status = 0 LIMIT 1",
      [bookId]
    );
    const copyRows = copies as any[];

    if (copyRows.length === 0) {
      return NextResponse.json(
        { error: "Brak dostępnych egzemplarzy" },
        { status: 400 }
      );
    }

    const egzId = copyRows[0].Id;

    // 3. Tworzymy rezerwację
    await pool.query(
      "INSERT INTO rezerwacje (UzytkownikId, EgzemplarzId, DataRezerwacji, Status) VALUES (?, ?, NOW(), 'AKTYWNA')",
      [userId, egzId]
    );

    // 4. Aktualizujemy status egzemplarza
    await pool.query(
      "UPDATE egzemplarze SET Status = 1 WHERE Id = ?",
      [egzId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reservation error:", err);
    return NextResponse.json(
      { error: "SERVER ERROR" },
      { status: 500 }
    );
  }
}
