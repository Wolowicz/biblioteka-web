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
      // Trend wypożyczeń (ostatnie 30 dni)
      pool.query<RowDataPacket[]>(
        `SELECT DATE(DataWypozyczenia) as d, COUNT(*) as cnt
         FROM wypozyczenia
         WHERE DataWypozyczenia >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
         GROUP BY DATE(DataWypozyczenia)
         ORDER BY DATE(DataWypozyczenia) ASC`
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

    // Build a series for the last 30 days (including today)
    const today = new Date();
    const series: number[] = [];
    const raw: Record<string, number> = {};
    try {
      const trendRows = (await pool.query<RowDataPacket[]>(
        `SELECT DATE(DataWypozyczenia) as d, COUNT(*) as cnt
         FROM wypozyczenia
         WHERE DataWypozyczenia >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
         GROUP BY DATE(DataWypozyczenia)`
      )) as any;
      const rows = trendRows[0] as RowDataPacket[];
      rows.forEach((row) => { raw[String(row.d)] = Number(row.cnt); });
    } catch (e) {
      // ignore errors building trend
    }
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      series.push(raw[key] || 0);
    }

    (stats as any).borrowingsTrend = series;

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Błąd pobierania statystyk:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
