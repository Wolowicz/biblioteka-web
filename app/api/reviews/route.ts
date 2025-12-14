/**
 * =============================================================================
 * API: /api/reviews - Zarządzanie recenzjami książek
 * =============================================================================
 * 
 * GET  /api/reviews - Lista recenzji (publiczne, tylko zatwierdzone)
 * POST /api/reviews - Dodanie recenzji (READER)
 * 
 * Query params:
 * - bookId: ID książki (opcjonalne, filtruje recenzje dla danej książki)
 * - all: "true" - pokaż wszystkie recenzje (tylko LIBRARIAN/ADMIN)
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Handler GET - Pobieranie recenzji
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const showAll = searchParams.get("all") === "true";
    const showMy = searchParams.get("my") === "true";
    const showMyReports = searchParams.get("myReports") === "true";
    
    const user = await getUserSessionSSR();
    const isStaff = user && (user.role === "ADMIN" || user.role === "LIBRARIAN");
    
    // Jeśli użytkownik chce swoje recenzje lub zgłoszenia, musi być zalogowany
    if ((showMy || showMyReports) && !user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
    }
    
    // Pobieranie recenzji zgłoszonych przez bieżącego użytkownika
    if (showMyReports && user) {
      const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          r.RecenzjaId AS id,
          r.KsiazkaId AS bookId,
          k.Tytul AS bookTitle,
          r.UzytkownikId AS userId,
          CONCAT(u.Imie, ' ', u.Nazwisko) AS userName,
          r.Ocena AS rating,
          r.Tresc AS comment,
          r.Status AS status,
          r.Zgloszona AS reported,
          r.ZgloszonaPrzez AS reportedBy,
          r.PowodZgloszenia AS reportReason,
          r.CreatedAt AS createdAt
        FROM recenzje r
        JOIN ksiazki k ON r.KsiazkaId = k.KsiazkaId
        JOIN uzytkownicy u ON r.UzytkownikId = u.UzytkownikId
        WHERE r.IsDeleted = 0 AND r.Zgloszona = 1 AND r.ZgloszonaPrzez = ?
        ORDER BY r.CreatedAt DESC
        `,
        [user.id]
      );

      return NextResponse.json({
        reviews: rows
      });
    }
    
    // Budowanie zapytania
    let query = `
      SELECT 
        r.RecenzjaId AS id,
        r.KsiazkaId AS bookId,
        k.Tytul AS bookTitle,
        r.UzytkownikId AS userId,
        CONCAT(u.Imie, ' ', u.Nazwisko) AS userName,
        r.Ocena AS rating,
        r.Tresc AS comment,
        r.Status AS status,
        r.Zgloszona AS reported,
        r.PowodZgloszenia AS reportReason,
        r.CreatedAt AS createdAt
      FROM recenzje r
      JOIN ksiazki k ON r.KsiazkaId = k.KsiazkaId
      JOIN uzytkownicy u ON r.UzytkownikId = u.UzytkownikId
      WHERE r.IsDeleted = 0
    `;
    
    const params: any[] = [];
    
    // Filtr po użytkowniku (moje recenzje)
    if (showMy && user) {
      query += ` AND r.UzytkownikId = ?`;
      params.push(user.id);
    }
    
    // Filtr po książce
    if (bookId) {
      query += ` AND r.KsiazkaId = ?`;
      params.push(parseInt(bookId));
    }
    
    // Tylko zatwierdzone dla zwykłych użytkowników (chyba że to ich własne recenzje)
    if (!showMy && (!showAll || !isStaff)) {
      query += ` AND r.Status = 'Zatwierdzona'`;
    }
    
    query += ` ORDER BY r.CreatedAt DESC`;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    
    // Oblicz średnią ocenę jeśli filtrujemy po książce
    let averageRating = null;
    if (bookId) {
      const [avgResult] = await pool.query<RowDataPacket[]>(
        `
        SELECT AVG(Ocena) as avg, COUNT(*) as count
        FROM recenzje
        WHERE KsiazkaId = ? AND Status = 'Zatwierdzona' AND IsDeleted = 0
        `,
        [parseInt(bookId)]
      );
      
      if (avgResult[0]) {
        averageRating = {
          average: parseFloat(avgResult[0].avg) || 0,
          count: avgResult[0].count
        };
      }
    }

    return NextResponse.json({
      reviews: rows,
      averageRating
    });
  } catch (error) {
    console.error("Błąd API GET /api/reviews:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler POST - Dodawanie recenzji
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
    }

    const body = await request.json();
    const { bookId, rating, content } = body;

    // Walidacja
    if (!bookId || !rating || !content) {
      return NextResponse.json(
        { error: "Wymagane pola: bookId, rating, content" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Ocena musi być w zakresie 1-5" },
        { status: 400 }
      );
    }

    if (content.length < 10) {
      return NextResponse.json(
        { error: "Recenzja musi mieć minimum 10 znaków" },
        { status: 400 }
      );
    }

    // Sprawdź czy książka istnieje
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

    // Sprawdź czy użytkownik już dodał recenzję do tej książki
    const [existingReview] = await pool.query<RowDataPacket[]>(
      `SELECT RecenzjaId FROM recenzje WHERE KsiazkaId = ? AND UzytkownikId = ? AND IsDeleted = 0`,
      [bookId, user.id]
    );

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: "Już dodałeś recenzję do tej książki" },
        { status: 409 }
      );
    }

    // Dodaj recenzję (status: Oczekuje na zatwierdzenie)
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO recenzje (KsiazkaId, UzytkownikId, Ocena, Tresc, Status)
      VALUES (?, ?, ?, ?, 'Oczekuje')
      `,
      [bookId, user.id, rating, content]
    );

    // Log operacji
    await pool.query(
      `
      INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
      VALUES ('Audyt', ?, 'Dodano nową recenzję', 'Recenzje', ?)
      `,
      [user.id, result.insertId]
    );

    return NextResponse.json({
      success: true,
      message: "Recenzja została dodana i oczekuje na zatwierdzenie",
      reviewId: result.insertId
    }, { status: 201 });
  } catch (error) {
    console.error("Błąd API POST /api/reviews:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
