// app/api/admin/logs/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ⬅️ UWAGA: Ta funkcja zakłada, że tylko ADMIN/LIBRARIAN ma uprawnienia.
// W prawdziwej aplikacji, w tym miejscu byłaby ścisła weryfikacja uprawnień po stronie serwera.
export async function GET() {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        l.LogId AS id,
        l.TypCoSieStalo AS type,
        u.Imie AS userFirstName,
        u.Nazwisko AS userLastName,
        l.Opis AS description,
        l.Encja AS entity,
        l.EncjaId AS entityId,
        l.Kiedy AS timestamp
      FROM Logi l
      LEFT JOIN Uzytkownicy u ON u.UzytkownikId = l.UzytkownikId
      ORDER BY l.Kiedy DESC
      LIMIT 50;
      `
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("DB error /api/admin/logs:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych podczas pobierania logów" },
      { status: 500 }
    );
  }
}