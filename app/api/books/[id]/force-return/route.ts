import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserSessionSSR();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'LIBRARIAN')) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const { id } = await context.params;
    const bookId = Number(id);
    if (!Number.isFinite(bookId)) return NextResponse.json({ error: 'Złe ID' }, { status: 400 });

    // Pobierz aktywne wypożyczenia dla tej książki
    const [rows] = await pool.query(`SELECT WypozyczenieId FROM wypozyczenia WHERE KsiazkaId = ? AND Status = 'Aktywne' AND IsDeleted = 0`, [bookId]) as any;
    const ids = rows.map((r: any) => r.WypozyczenieId);
    if (ids.length === 0) return NextResponse.json({ success: true, message: 'Brak aktywnych wypożyczeń' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const wid of ids) {
        await conn.query(`UPDATE wypozyczenia SET Status = 'RETURNED', DataZwrotu = NOW() WHERE WypozyczenieId = ?`, [wid]);
        await conn.query(`INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId) VALUES ('Audyt', ?, ?, 'Wypozyczenia', ?)`, [user.id, `Wymuszone zwroty dla książki ${bookId} (wypożyczenie ${wid})`, wid]);
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    return NextResponse.json({ success: true, returned: ids.length });
  } catch (err) {
    console.error('Error POST /api/books/[id]/force-return:', err);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
