/**
 * =============================================================================
 * API: /api/ebooks - Zarządzanie e-bookami (PDF)
 * =============================================================================
 * 
 * GET /api/ebooks - Lista e-booków
 * POST /api/ebooks - Dodaj nowy e-book (ADMIN/LIBRARIAN)
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Handler GET - Lista e-booków
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        e.EbookId,
        e.Tytul,
        e.RozmiarPliku,
        e.Format,
        e.KsiazkaId,
        e.PoziomDostepu,
        e.CreatedAt,
        k.Tytul as KsiazkaTitle,
        k.OkladkaUrl
      FROM ebooki e
      LEFT JOIN ksiazki k ON e.KsiazkaId = k.KsiazkaId
      WHERE e.IsDeleted = 0
    `;

    const params: (string | number)[] = [];

    // Dla czytelników pokaż tylko publiczne lub ich poziom dostępu
    if (user.role === "READER") {
      query += ` AND (e.PoziomDostepu = 'Publiczny' OR e.PoziomDostepu = 'Czytelnik')`;
    } else if (user.role === "LIBRARIAN") {
      query += ` AND e.PoziomDostepu != 'Admin'`;
    }
    // Admin widzi wszystko

    if (bookId) {
      query += ` AND e.KsiazkaId = ?`;
      params.push(bookId);
    }

    query += ` ORDER BY e.CreatedAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [ebooks] = await pool.query<RowDataPacket[]>(query, params);

    // Pobierz całkowitą liczbę
    let countQuery = `SELECT COUNT(*) as total FROM ebooki e WHERE e.IsDeleted = 0`;
    const countParams: (string | number)[] = [];
    
    if (user.role === "READER") {
      countQuery += ` AND (e.PoziomDostepu = 'Publiczny' OR e.PoziomDostepu = 'Czytelnik')`;
    } else if (user.role === "LIBRARIAN") {
      countQuery += ` AND e.PoziomDostepu != 'Admin'`;
    }

    if (bookId) {
      countQuery += ` AND e.KsiazkaId = ?`;
      countParams.push(bookId);
    }

    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0].total;

    return NextResponse.json({
      ebooks: ebooks.map(ebook => ({
        id: ebook.EbookId,
        title: ebook.Tytul,
        fileSize: ebook.RozmiarPliku,
        format: ebook.Format,
        bookId: ebook.KsiazkaId,
        bookTitle: ebook.KsiazkaTitle,
        bookCover: ebook.OkladkaUrl,
        accessLevel: ebook.PoziomDostepu,
        createdAt: ebook.CreatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Błąd API GET /api/ebooks:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler POST - Dodaj nowy e-book
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      title, 
      filePath, 
      fileSize = 0,
      format = "PDF",
      bookId = null,
      accessLevel = "Czytelnik"
    } = body;

    if (!title || !filePath) {
      return NextResponse.json(
        { error: "Tytuł i ścieżka pliku są wymagane" },
        { status: 400 }
      );
    }

    // Walidacja poziomu dostępu
    const validAccessLevels = ["Publiczny", "Czytelnik", "Bibliotekarz", "Admin"];
    if (!validAccessLevels.includes(accessLevel)) {
      return NextResponse.json(
        { error: "Nieprawidłowy poziom dostępu" },
        { status: 400 }
      );
    }

    // Bibliotekarz nie może tworzyć e-booków Admin-only
    if (user.role === "LIBRARIAN" && accessLevel === "Admin") {
      return NextResponse.json(
        { error: "Brak uprawnień do tworzenia e-booków tylko dla administratorów" },
        { status: 403 }
      );
    }

    // Jeśli podano bookId, sprawdź czy książka istnieje
    if (bookId) {
      const [bookCheck] = await pool.query<RowDataPacket[]>(
        `SELECT KsiazkaId FROM ksiazki WHERE KsiazkaId = ? AND IsDeleted = 0`,
        [bookId]
      );

      if (bookCheck.length === 0) {
        return NextResponse.json(
          { error: "Książka nie istnieje" },
          { status: 404 }
        );
      }
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ebooki (Tytul, SciezkaPliku, RozmiarPliku, Format, KsiazkaId, PoziomDostepu, CreatedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, filePath, fileSize, format, bookId, accessLevel, user.id]
    );

    // Log operacji
    await pool.query(
      `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
       VALUES ('Audyt', ?, ?, 'Ebooki', ?)`,
      [user.id, `Dodano e-book: "${title}"`, result.insertId]
    );

    return NextResponse.json({
      success: true,
      message: "E-book został dodany",
      ebookId: result.insertId
    }, { status: 201 });
  } catch (error) {
    console.error("Błąd API POST /api/ebooks:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
