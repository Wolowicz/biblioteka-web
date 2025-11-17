import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET( 
  _req: NextRequest,
  context: { params: Promise<{ id: string }> } 
){
  const { id } = await context.params;        // ⬅ await na params
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Złe ID" }, { status: 400 });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT
        k.KsiazkaId AS id,
        k.Tytul AS title,
        COALESCE(GROUP_CONCAT(a.ImieNazwisko SEPARATOR ', '), 'Brak autora') AS authors,
        k.numerISBN AS isbn,
        k.Wydawnictwo AS publisher,
        k.Rok AS year,
        (k.DostepneEgzemplarze > 0) AS available
      FROM Ksiazki k
      LEFT JOIN KsiazkiAutorzy ka ON ka.KsiazkaId = k.KsiazkaId
      LEFT JOIN Autorzy a ON a.AutorId = ka.AutorId
      WHERE k.KsiazkaId = ?
      GROUP BY
        k.KsiazkaId,
        k.Tytul,
        k.numerISBN,
        k.Wydawnictwo,
        k.Rok,
        k.DostepneEgzemplarze
      LIMIT 1;
      `,
      [numericId]
    );

    const list = rows as any[];//Typowanie jako any[], bo wynik z bazy to tablica obiektów o nieznanym typie.
    if (list.length === 0) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }

    return NextResponse.json(list[0]);
  } catch (err) {
    console.error("DB error /api/books/[id]:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych" },
      { status: 500 }
    );
  }
}
