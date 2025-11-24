// app/api/user/borrowings/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  // ⬅️ UWAGA: UserID byłoby odczytywane z sesji (ciasteczka/JWT) w finalnej, bezpiecznej aplikacji.
  const userId = req.nextUrl.searchParams.get("userId");
  const numericId = Number(userId);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Brak ID użytkownika" }, { status: 400 });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT
        w.WypozyczenieId AS id,
        k.Tytul AS title,
        COALESCE(GROUP_CONCAT(a.ImieNazwisko SEPARATOR ', '), 'Brak autora') AS author,
        w.DataWypozyczenia AS borrowDate,
        w.TerminZwrotu AS dueDate,
        w.DataZwrotu AS returnDate,
        w.Status AS status,
        -- Suma naliczonych kar dla tego wypożyczenia
        COALESCE(SUM(ca.Kwota), 0) AS totalFines
      FROM Wypozyczenia w
      JOIN Egzemplarze e ON e.EgzemplarzId = w.EgzemplarzId
      JOIN Ksiazki k ON k.KsiazkaId = e.KsiazkaId
      LEFT JOIN KsiazkiAutorzy ka ON ka.KsiazkaId = k.KsiazkaId
      LEFT JOIN Autorzy a ON a.AutorId = ka.AutorId
      LEFT JOIN Kary ca ON ca.WypozyczenieId = w.WypozyczenieId AND ca.Status = 'Naliczona'
      WHERE w.UzytkownikId = ? AND w.IsDeleted = 0
      GROUP BY w.WypozyczenieId, k.Tytul, w.DataWypozyczenia, w.TerminZwrotu, w.DataZwrotu, w.Status
      ORDER BY w.TerminZwrotu DESC;
      `,
      [numericId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("DB error /api/user/borrowings:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych podczas pobierania wypożyczeń" },
      { status: 500 }
    );
  }
}