// app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Endpoint do tworzenia rezerwacji (symulacja wypożyczenia)
export async function POST(req: NextRequest) {
  // Oczekujemy bookId (ID książki) i userId (ID zalogowanego użytkownika)
  const { bookId, userId } = await req.json();

  if (!bookId || !userId) {
    return NextResponse.json(
      { error: "Brak ID książki lub użytkownika" },
      { status: 400 }
    );
  }

  const numericBookId = Number(bookId);
  const numericUserId = Number(userId);
  
  // ⬅️ Używamy transakcji, aby zapewnić spójność danych:
  // Albo wszystko się wykona, albo nic (atomowość operacji).
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1) Znajdź pierwszy dostępny egzemplarz i sprawdź dostępność
    const [availableEgsRows] = await connection.query(
      "SELECT EgzemplarzId FROM Egzemplarze WHERE KsiazkaId = ? AND Status = 'Dostepny' AND IsDeleted = 0 LIMIT 1 FOR UPDATE",
      [numericBookId]
    );

    const availableEgs = availableEgsRows as any[];
    if (availableEgs.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Brak dostępnych egzemplarzy książki" },
        { status: 409 }
      );
    }
    
    const egzemplarzId = availableEgs[0].EgzemplarzId;

    // 2) Zmień status egzemplarza na 'Wypozyczony'
    await connection.query(
      "UPDATE Egzemplarze SET Status = 'Wypozyczony' WHERE EgzemplarzId = ?",
      [egzemplarzId]
    );

    // 3) Zmniejsz licznik dostępnych egzemplarzy w tabeli Ksiazki
    await connection.query(
        "UPDATE Ksiazki SET DostepneEgzemplarze = DostepneEgzemplarze - 1 WHERE KsiazkaId = ? AND DostepneEgzemplarze > 0",
        [numericBookId]
    );

    // 4) Utwórz nowy wpis w tabeli Wypozyczenia
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + 30); // Domyślny termin zwrotu: 30 dni

    const [result] = await connection.query(
      `INSERT INTO Wypozyczenia (UzytkownikId, EgzemplarzId, DataWypozyczenia, TerminZwrotu, Status)
       VALUES (?, ?, ?, ?, 'Aktywne')`,
      [numericUserId, egzemplarzId, now.toISOString().split('T')[0], dueDate.toISOString().split('T')[0]]
    );

    // 5) Zatwierdź transakcję
    await connection.commit();

    return NextResponse.json(
      {
        message: "Książka zarezerwowana (wypożyczona)",
        wypozyczenieId: (result as any).insertId,
      },
      { status: 201 }
    );

  } catch (err) {
    await connection.rollback();
    console.error("Reservation/Borrowing error:", err);
    return NextResponse.json(
      { error: "Błąd serwera podczas tworzenia rezerwacji" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}