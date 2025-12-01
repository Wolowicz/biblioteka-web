import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("userSession");

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(session.value);
    const userId = Number(user.id);

    // Pobieramy wypożyczenia użytkownika
    const borrowResult: any = await pool.query(
      `
        SELECT
          w.WypozyczenieId,
          w.DataWypozyczenia,
          w.TerminZwrotu,
          w.DataZwrotu,
          w.Status,
          k.KsiazkaId,
          k.Tytul
        FROM wypozyczenia w
        JOIN egzemplarze e ON w.EgzemplarzId = e.EgzemplarzId
        JOIN ksiazki k ON e.KsiazkaId = k.KsiazkaId
        WHERE w.UzytkownikId = ?
          AND w.IsDeleted = 0
        ORDER BY w.DataWypozyczenia DESC
      `,
      [userId]
    );

    const borrowRows = borrowResult[0];

    // --- AUTOMATYCZNE NALICZANIE KAR ---
    for (const row of borrowRows as any[]) {
      const { WypozyczenieId, TerminZwrotu, DataZwrotu } = row;

      if (DataZwrotu) continue;

      const dzis = new Date();
      const termin = new Date(TerminZwrotu);

      if (dzis <= termin) continue;

      const fineCheck: any = await pool.query(
        `
          SELECT KaraId
          FROM kary
          WHERE WypozyczenieId = ?
            AND Status = 'Naliczona'
          LIMIT 1
        `,
        [WypozyczenieId]
      );

      if (fineCheck[0].length > 0) continue;

      const diffDays = Math.ceil(
        (dzis.getTime() - termin.getTime()) / (1000 * 60 * 60 * 24)
      );

      const kwota = diffDays * 2;

      await pool.query(
        `
          INSERT INTO kary (WypozyczenieId, Kwota, Opis, Status)
          VALUES (?, ?, 'Przekroczono termin zwrotu', 'Naliczona')
        `,
        [WypozyczenieId, kwota]
      );
    }

    // --- KOŃCOWY SELECT DO FRONTENDU ---
    const result: any = await pool.query(
      `
        SELECT
          w.WypozyczenieId AS id,
          k.Tytul AS title,

          (
            SELECT GROUP_CONCAT(a.ImieNazwisko SEPARATOR ', ')
            FROM autorzy a
            JOIN ksiazkiautorzy ka ON ka.AutorId = a.AutorId
            WHERE ka.KsiazkaId = k.KsiazkaId
          ) AS author,

          NULL AS coverUrl,

          w.DataWypozyczenia AS borrowDate,
          w.TerminZwrotu AS dueDate,
          w.DataZwrotu AS returnedDate,

          COALESCE((
            SELECT Kwota
            FROM kary
            WHERE WypozyczenieId = w.WypozyczenieId
              AND Status = 'Naliczona'
            LIMIT 1
          ), 0) AS fine

        FROM wypozyczenia w
        JOIN egzemplarze e ON w.EgzemplarzId = e.EgzemplarzId
        JOIN ksiazki k ON e.KsiazkaId = k.KsiazkaId
        
        WHERE w.UzytkownikId = ?
          AND w.IsDeleted = 0

        ORDER BY w.DataWypozyczenia DESC
      `,
      [userId]
    );

    const rows = result[0];

    return NextResponse.json(rows);

  } catch (err) {
    console.error("BORROWINGS API ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
