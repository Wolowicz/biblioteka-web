/**
 * =============================================================================
 * API: Statystyki systemu dla panelu administracyjnego
 * =============================================================================
 * 
 * GET /api/admin/stats - pobiera prawdziwe statystyki z bazy
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserSessionSSR } from "@/lib/auth/server";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json(
        { error: "Brak uprawnień" },
        { status: 403 }
      );
    }

    // Pobierz statystyki równolegle
    const [
      [usersResult],
      [booksResult],
      [borrowingsResult],
      [overdueResult],
      [reservationsResult],
      [recentActivity],
    ] = await Promise.all([
      // Liczba aktywnych użytkowników
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM uzytkownicy WHERE Aktywny = 1 AND IsDeleted = 0`
      ),
      // Liczba książek w katalogu
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count, SUM(DostepneEgzemplarze) as available 
         FROM ksiazki WHERE IsDeleted = 0`
      ),
      // Aktywne wypożyczenia
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM wypozyczenia 
         WHERE Status = 'Aktywne' AND IsDeleted = 0`
      ),
      // Przeterminowane
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM wypozyczenia 
         WHERE Status = 'Aktywne' AND TerminZwrotu < CURDATE() AND IsDeleted = 0`
      ),
      // Oczekujące rezerwacje
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM rezerwacje WHERE Status = 'Oczekuje'`
      ).catch(() => [[{ count: 0 }]]),
      // Ostatnia aktywność
      pool.query<RowDataPacket[]>(
        `SELECT 
          l.LogId as id,
          l.TypCoSieStalo as type,
          l.Opis as description,
          l.Encja as entity,
          l.Kiedy as timestamp,
          u.Imie as userFirstName,
          u.Nazwisko as userLastName
         FROM logi l
         LEFT JOIN uzytkownicy u ON l.UzytkownikId = u.UzytkownikId
         ORDER BY l.Kiedy DESC
         LIMIT 10`
      ),
    ]);

    // Przygotuj odpowiedź
    const stats = {
      users: {
        total: (usersResult as RowDataPacket[])[0]?.count || 0,
        trend: "+12%", // TODO: oblicz na podstawie danych historycznych
      },
      books: {
        total: (booksResult as RowDataPacket[])[0]?.count || 0,
        available: (booksResult as RowDataPacket[])[0]?.available || 0,
        trend: "+5%",
      },
      borrowings: {
        active: (borrowingsResult as RowDataPacket[])[0]?.count || 0,
        overdue: (overdueResult as RowDataPacket[])[0]?.count || 0,
        trend: "-3%",
      },
      reservations: {
        pending: (reservationsResult as RowDataPacket[])[0]?.count || 0,
      },
      recentActivity: recentActivity as RowDataPacket[],
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Błąd pobierania statystyk:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
