/**
 * =============================================================================
 * API: /api/admin/dashboard-stats - Statystyki dla dashboardu admina
 * =============================================================================
 * 
 * GET - Zwraca agregowane statystyki systemu:
 * - Liczba użytkowników (total, active, trend)
 * - Aktywne wypożyczenia (active, overdue, trend)
 * - Zaległe kary (unpaid, total amount, trend)
 * - Stan magazynowy (books, copies, available, borrowed)
 * 
 * @packageDocumentation
 */

import { NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    // Autoryzacja - tylko admin i bibliotekarz
    const user = await getUserSessionSSR();
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json(
        { error: "Brak uprawnień" },
        { status: 403 }
      );
    }

    // === STATYSTYKI UŻYTKOWNIKÓW ===
    const [usersTotal] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM uzytkownicy WHERE IsDeleted = 0"
    );

    const [usersActive] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as active FROM uzytkownicy WHERE Aktywny = 1 AND IsDeleted = 0"
    );

    // Trend użytkowników (porównanie z poprzednim miesiącem)
    const [usersTrend] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as current_month
       FROM uzytkownicy 
       WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 1 MONTH) 
       AND IsDeleted = 0`
    );

    const [usersPrevMonth] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as prev_month
       FROM uzytkownicy 
       WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
       AND CreatedAt < DATE_SUB(NOW(), INTERVAL 1 MONTH)
       AND IsDeleted = 0`
    );

    const usersTrendPercent = usersPrevMonth[0].prev_month > 0
      ? Math.round(((usersTrend[0].current_month - usersPrevMonth[0].prev_month) / usersPrevMonth[0].prev_month) * 100)
      : 0;

    // === STATYSTYKI WYPOŻYCZEŃ ===
    const [borrowingsActive] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as active FROM wypozyczenia WHERE Status = 'Aktywne' AND IsDeleted = 0"
    );

    const [borrowingsOverdue] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as overdue 
       FROM wypozyczenia 
       WHERE Status = 'Aktywne' 
       AND TerminZwrotu < CURDATE() 
       AND DataZwrotu IS NULL
       AND IsDeleted = 0`
    );

    // Trend wypożyczeń (ostatni tydzień)
    const [borrowingsTrend] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as this_week
       FROM wypozyczenia 
       WHERE DataWypozyczenia >= DATE_SUB(NOW(), INTERVAL 1 WEEK) 
       AND IsDeleted = 0`
    );

    const [borrowingsPrevWeek] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as prev_week
       FROM wypozyczenia 
       WHERE DataWypozyczenia >= DATE_SUB(NOW(), INTERVAL 2 WEEK)
       AND DataWypozyczenia < DATE_SUB(NOW(), INTERVAL 1 WEEK)
       AND IsDeleted = 0`
    );

    const borrowingsTrendPercent = borrowingsPrevWeek[0].prev_week > 0
      ? Math.round(((borrowingsTrend[0].this_week - borrowingsPrevWeek[0].prev_week) / borrowingsPrevWeek[0].prev_week) * 100)
      : 0;

    // === STATYSTYKI KAR ===
    const [finesUnpaid] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as unpaid FROM kary WHERE Status = 'Naliczona'"
    );

    const [finesTotalAmount] = await pool.query<RowDataPacket[]>(
      "SELECT SUM(Kwota) as total FROM kary WHERE Status = 'Naliczona'"
    );

    // Trend kar (naliczone w ostatnim miesiącu)
    const [finesTrend] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as this_month
       FROM kary 
       WHERE DataNaliczona >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`
    );

    const [finesPrevMonth] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as prev_month
       FROM kary 
       WHERE DataNaliczona >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
       AND DataNaliczona < DATE_SUB(NOW(), INTERVAL 1 MONTH)`
    );

    const finesTrendPercent = finesPrevMonth[0].prev_month > 0
      ? Math.round(((finesTrend[0].this_month - finesPrevMonth[0].prev_month) / finesPrevMonth[0].prev_month) * 100)
      : 0;

    // === STATYSTYKI MAGAZYNOWE ===
    const [booksTotal] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM ksiazki WHERE IsDeleted = 0"
    );

    const [copiesStats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN Status = 'Dostepny' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN Status = 'Wypozyczony' THEN 1 ELSE 0 END) as borrowed
       FROM egzemplarze 
       WHERE IsDeleted = 0`
    );

    // Zwróć wszystkie statystyki
    return NextResponse.json({
      users: {
        total: usersTotal[0].total,
        active: usersActive[0].active,
        trend: usersTrendPercent,
      },
      borrowings: {
        active: borrowingsActive[0].active,
        overdue: borrowingsOverdue[0].overdue,
        trend: borrowingsTrendPercent,
      },
      fines: {
        unpaid: finesUnpaid[0].unpaid,
        totalAmount: parseFloat(finesTotalAmount[0].total || 0),
        trend: finesTrendPercent,
      },
      inventory: {
        totalBooks: booksTotal[0].total,
        totalCopies: copiesStats[0].total,
        available: copiesStats[0].available,
        borrowed: copiesStats[0].borrowed,
      },
    });

  } catch (error) {
    console.error("Błąd API /api/admin/dashboard-stats:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
