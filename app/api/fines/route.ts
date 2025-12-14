/**
 * =============================================================================
 * API: /api/fines - Zarządzanie karami
 * =============================================================================
 * 
 * GET  /api/fines - Lista kar zalogowanego użytkownika (READER)
 *                   lub wszystkich kar (LIBRARIAN/ADMIN)
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * Handler GET - Pobieranie listy kar
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const isStaff = user.role === "ADMIN" || user.role === "LIBRARIAN";
    
    // Budowanie warunków WHERE
    let whereConditions = isStaff ? "1=1" : "w.UzytkownikId = ?";
    const params: any[] = isStaff ? [] : [user.id];

    // Filtr statusu
    if (statusFilter === "UNPAID") {
      whereConditions += " AND k.Status = 'Naliczona'";
    } else if (statusFilter === "PAID") {
      whereConditions += " AND k.Status = 'Zaplacona'";
    }

    // Zapytanie różne w zależności od roli
    const query = isStaff
      ? `
        SELECT 
          k.KaraId AS id,
          k.WypozyczenieId AS borrowingId,
          ks.KsiazkaId AS bookId,
          k.Kwota AS amount,
          k.Opis AS description,
          k.Status AS status,
          k.DataNaliczona AS createdAt,
          k.DataRozliczona AS paidAt,
          ks.Tytul AS bookTitle,
          CONCAT(u.Imie, ' ', u.Nazwisko) AS userName,
          u.Email AS userEmail,
          GREATEST(0, DATEDIFF(COALESCE(w.DataZwrotu, NOW()), w.TerminZwrotu)) AS daysOverdue
        FROM kary k
        JOIN wypozyczenia w ON k.WypozyczenieId = w.WypozyczenieId
        JOIN egzemplarze e ON w.EgzemplarzId = e.EgzemplarzId
        JOIN ksiazki ks ON e.KsiazkaId = ks.KsiazkaId
        JOIN uzytkownicy u ON w.UzytkownikId = u.UzytkownikId
        WHERE ${whereConditions}
        ORDER BY k.DataNaliczona DESC
      `
      : `
        SELECT 
          k.KaraId AS id,
          k.WypozyczenieId AS borrowingId,
          ks.KsiazkaId AS bookId,
          k.Kwota AS amount,
          k.Opis AS description,
          k.Status AS status,
          k.DataNaliczona AS createdAt,
          k.DataRozliczona AS paidAt,
          ks.Tytul AS bookTitle,
          GREATEST(0, DATEDIFF(COALESCE(w.DataZwrotu, NOW()), w.TerminZwrotu)) AS daysOverdue
        FROM kary k
        JOIN wypozyczenia w ON k.WypozyczenieId = w.WypozyczenieId
        JOIN egzemplarze e ON w.EgzemplarzId = e.EgzemplarzId
        JOIN ksiazki ks ON e.KsiazkaId = ks.KsiazkaId
        WHERE ${whereConditions}
        ORDER BY k.DataNaliczona DESC
      `;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    const fines = (rows as any[]).map(row => ({
      ...row,
      amount: parseFloat(row.amount) || 0,
      daysOverdue: parseInt(row.daysOverdue) || 0
    }));

    return NextResponse.json({ fines });
  } catch (error) {
    console.error("Błąd API /api/fines:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
