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
    const body = await request.json();
    const delta = Number(body.delta) || 0;

    if (!Number.isFinite(bookId) || bookId <= 0) return NextResponse.json({ error: 'Złe ID' }, { status: 400 });
    if (delta === 0) return NextResponse.json({ error: 'Delta nie może być 0' }, { status: 400 });

    const [bookRows] = await pool.query(`SELECT LiczbaEgzemplarzy, DostepneEgzemplarze, numerISBN, Tytul FROM ksiazki WHERE KsiazkaId = ?`, [bookId]) as any;
    if (bookRows.length === 0) return NextResponse.json({ error: 'Nie znaleziono książki' }, { status: 404 });
    const book = bookRows[0];

    if (delta > 0) {
      // Increase counts and create new egzemplarze
      await pool.query(`UPDATE ksiazki SET LiczbaEgzemplarzy = LiczbaEgzemplarzy + ?, DostepneEgzemplarze = DostepneEgzemplarze + ? WHERE KsiazkaId = ?`, [delta, delta, bookId]);
      for (let i = 0; i < delta; i++) {
        const inventoryNumber = `${(book.numerISBN || 'ISBN').slice(-4)}-${Math.floor(Math.random()*900+100)}`;
        await pool.query(`INSERT INTO egzemplarze (KsiazkaId, NumerInwentarzowy, Status) VALUES (?, ?, 'Dostepny')`, [bookId, inventoryNumber]);
      }
    } else {
      // Remove available copies (only if enough available)
      const toRemove = Math.abs(delta);
      if (book.DostepneEgzemplarze < toRemove) return NextResponse.json({ error: 'Nie ma tylu dostępnych egzemplarzy' }, { status: 400 });
      await pool.query(`UPDATE ksiazki SET LiczbaEgzemplarzy = LiczbaEgzemplarzy - ?, DostepneEgzemplarze = DostepneEgzemplarze - ? WHERE KsiazkaId = ?`, [toRemove, toRemove, bookId]);
      // Soft-delete egzemplarze with status Dostepny
      await pool.query(`UPDATE egzemplarze SET IsDeleted = 1 WHERE KsiazkaId = ? AND Status = 'Dostepny' LIMIT ?`, [bookId, toRemove]);
    }

    await pool.query(`INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId) VALUES ('Audyt', ?, ?, 'Ksiazki', ?)`, [user.id, `Zmieniono stan magazynowy książki: ${book.Tytul} (delta ${delta})`, bookId]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error POST /api/books/[id]/stock:', err);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
