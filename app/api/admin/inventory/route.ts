/**
 * =============================================================================
 * API: /api/admin/inventory - Zarządzanie inwentarzem książek
 * =============================================================================
 * 
 * GET - Zwraca listę książek z agregowanymi statystykami egzemplarzy
 * - Wyszukiwanie po tytule/autorze
 * - Filtrowanie po gatunku
 * - Filtrowanie po statusie dostępności
 * 
 * @packageDocumentation
 */

import { NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: Request) {
  try {
    // Autoryzacja - tylko admin i bibliotekarz
    const user = await getUserSessionSSR();
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json(
        { error: "Brak uprawnień" },
        { status: 403 }
      );
    }

    // Parse URL params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre");
    const statusFilter = searchParams.get("status"); // "available", "low-stock", "borrowed-all"

    // Build WHERE conditions
    const conditions: string[] = ["k.IsDeleted = 0"];
    const params: any[] = [];

    if (search) {
      conditions.push("(k.Tytul LIKE ? OR a.ImieNazwisko LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (genre) {
      conditions.push("kg.GatunekId = ?");
      params.push(parseInt(genre));
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Main query - books with copy stats
    const [books] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        k.KsiazkaId,
        k.Tytul,
        GROUP_CONCAT(DISTINCT a.ImieNazwisko ORDER BY a.ImieNazwisko SEPARATOR ', ') AS Autor,
        k.numerISBN AS ISBN,
        k.Rok AS RokWydania,
        k.Wydawnictwo,
        GROUP_CONCAT(DISTINCT g.Nazwa ORDER BY g.Nazwa SEPARATOR ', ') AS NazwaGatunku,
        GROUP_CONCAT(DISTINCT kg.GatunekId ORDER BY kg.GatunekId SEPARATOR ',') AS NazwaGatunekIds,
        COALESCE((SELECT COUNT(*) FROM ebooki ex WHERE ex.KsiazkaId = k.KsiazkaId AND ex.IsDeleted = 0), 0) AS ebookCount,
        NULL AS coverUrl, -- column OkladkaUrl may not exist in DB yet (apply migration 003_add_okladka.sql to enable)
        COUNT(DISTINCT e.EgzemplarzId) AS totalCopies,
        COUNT(DISTINCT CASE WHEN e.Status = 'Dostepny' THEN e.EgzemplarzId END) AS availableCopies,
        COUNT(DISTINCT CASE WHEN e.Status = 'Wypozyczony' THEN e.EgzemplarzId END) AS borrowedCopies,
        COUNT(DISTINCT CASE WHEN e.Status = 'Uszkodzony' OR e.Status = 'Zaginiony' THEN e.EgzemplarzId END) AS unavailableCopies
      FROM ksiazki k
      LEFT JOIN ksiazkiautorzy ka ON k.KsiazkaId = ka.KsiazkaId
      LEFT JOIN autorzy a ON ka.AutorId = a.AutorId
      LEFT JOIN ksiazki_gatunki kg ON k.KsiazkaId = kg.KsiazkaId
      LEFT JOIN gatunki g ON kg.GatunekId = g.GatunekId AND g.IsDeleted = 0
      LEFT JOIN egzemplarze e ON k.KsiazkaId = e.KsiazkaId AND e.IsDeleted = 0
      ${whereClause}
      GROUP BY k.KsiazkaId
      ORDER BY k.Tytul ASC
      `,
      params
    );

    // Apply status filter in memory (since it's based on aggregated data)
    let filteredBooks = books;
    if (statusFilter === "available") {
      filteredBooks = books.filter((book) => book.availableCopies > 0);
    } else if (statusFilter === "low-stock") {
      filteredBooks = books.filter((book) => book.totalCopies > 0 && book.availableCopies <= 2);
    } else if (statusFilter === "borrowed-all") {
      filteredBooks = books.filter((book) => book.totalCopies > 0 && book.availableCopies === 0);
    }

    return NextResponse.json(filteredBooks);
  } catch (error) {
    console.error("Błąd API GET /api/admin/inventory:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
