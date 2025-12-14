/**
 * =============================================================================
 * API: /api/borrowings/[id]/return - Zwrot wypożyczenia (LIBRARIAN/ADMIN)
 * =============================================================================
 * 
 * POST /api/borrowings/[id]/return - Przyjmij zwrot książki
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Handler POST - Przyjęcie zwrotu
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await context.params;
    const borrowingId = parseInt(id);

    // Pobierz wypożyczenie
    const [borrowingCheck] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        w.WypozyczenieId,
        w.EgzemplarzId,
        w.DataZwrotu,
        w.TerminZwrotu,
        w.Status,
        e.KsiazkaId,
        k.Tytul
      FROM wypozyczenia w
      JOIN egzemplarze e ON w.EgzemplarzId = e.EgzemplarzId
      JOIN ksiazki k ON e.KsiazkaId = k.KsiazkaId
      WHERE w.WypozyczenieId = ? AND w.IsDeleted = 0
      `,
      [borrowingId]
    );

    if (borrowingCheck.length === 0) {
      return NextResponse.json(
        { error: "Wypożyczenie nie zostało znalezione" },
        { status: 404 }
      );
    }

    const borrowing = borrowingCheck[0];

    if (borrowing.DataZwrotu) {
      return NextResponse.json(
        { error: "Książka została już zwrócona" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Zaktualizuj wypożyczenie
      await connection.query<ResultSetHeader>(
        `UPDATE wypozyczenia SET DataZwrotu = CURDATE(), Status = 'Zwrocone' WHERE WypozyczenieId = ?`,
        [borrowingId]
      );

      // Zmień status egzemplarza na dostępny
      await connection.query<ResultSetHeader>(
        `UPDATE egzemplarze SET Status = 'Dostepny' WHERE EgzemplarzId = ?`,
        [borrowing.EgzemplarzId]
      );

      // Zwiększ liczbę dostępnych egzemplarzy
      await connection.query(
        `UPDATE ksiazki SET DostepneEgzemplarze = DostepneEgzemplarze + 1 WHERE KsiazkaId = ?`,
        [borrowing.KsiazkaId]
      );

      await connection.commit();

      // Sprawdź czy były kary
      const [fineCheck] = await pool.query<RowDataPacket[]>(
        `SELECT KaraId, Kwota FROM kary WHERE WypozyczenieId = ? AND Status = 'Naliczona'`,
        [borrowingId]
      );

      // Log operacji
      await pool.query(
        `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
         VALUES ('Audyt', ?, ?, 'Wypozyczenia', ?)`,
        [user.id, `Przyjęto zwrot: "${borrowing.Tytul}"`, borrowingId]
      );

      // Powiadomienie dla użytkownika o zwrocie
      const [borrowingUser] = await pool.query<RowDataPacket[]>(
        `SELECT UzytkownikId FROM wypozyczenia WHERE WypozyczenieId = ?`,
        [borrowingId]
      );

      if (borrowingUser[0]) {
        const hasUnpaidFine = fineCheck.length > 0;
        const message = hasUnpaidFine
          ? `Książka "${borrowing.Tytul}" została zwrócona. Masz naliczoną karę: ${fineCheck[0].Kwota} zł.`
          : `Książka "${borrowing.Tytul}" została zwrócona. Dziękujemy!`;

        await pool.query(
          `INSERT INTO powiadomienia (UzytkownikId, Typ, Status, Temat, Tresc)
           VALUES (?, 'InApp', 'Oczekuje', 'Zwrot książki', ?)`,
          [borrowingUser[0].UzytkownikId, message]
        );
      }

      return NextResponse.json({
        success: true,
        message: "Zwrot został zarejestrowany",
        hadFine: fineCheck.length > 0,
        fineAmount: fineCheck.length > 0 ? fineCheck[0].Kwota : 0
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Błąd API POST /api/borrowings/[id]/return:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
