// app/api/books/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        k.KsiazkaId AS id,
        k.Tytul AS title,
        COALESCE(GROUP_CONCAT(a.ImieNazwisko SEPARATOR ', '), 'Brak autora') AS authors,
        (k.DostepneEgzemplarze > 0) AS available
      FROM Ksiazki k
      LEFT JOIN KsiazkiAutorzy ka ON ka.KsiazkaId = k.KsiazkaId
      LEFT JOIN Autorzy a ON a.AutorId = ka.AutorId
      WHERE k.IsDeleted = 0
      GROUP BY k.KsiazkaId, k.Tytul, k.DostepneEgzemplarze
      ORDER BY k.Tytul;
      `
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("DB error /api/books:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych" },
      { status: 500 }
    );
  }
}
