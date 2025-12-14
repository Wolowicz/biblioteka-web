/**
 * =============================================================================
 * API: /api/favorites - Zarządzanie ulubionymi książkami
 * =============================================================================
 * 
 * GET  /api/favorites - Lista ulubionych książek użytkownika
 * POST /api/favorites - Dodaj książkę do ulubionych
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserSessionSSR } from "@/lib/auth/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";

/**
 * Handler GET - Pobieranie listy ulubionych książek użytkownika
 */
export async function GET() {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        u.UlubioneId AS favoriteId,
        k.KsiazkaId AS id,
        k.Tytul AS title,
        NULL AS coverUrl,
        COALESCE(GROUP_CONCAT(DISTINCT a.ImieNazwisko SEPARATOR ', '), 'Brak autora') AS authors,
        (k.DostepneEgzemplarze > 0) AS available,
        COALESCE((
          SELECT AVG(r.Ocena) 
          FROM recenzje r 
          WHERE r.KsiazkaId = k.KsiazkaId 
          AND r.Status = 'Zatwierdzona' 
          AND r.IsDeleted = 0
        ), 0) AS averageRating,
        u.CreatedAt AS addedAt
      FROM ulubione u
      JOIN ksiazki k ON k.KsiazkaId = u.KsiazkaId
      LEFT JOIN KsiazkiAutorzy ka ON ka.KsiazkaId = k.KsiazkaId
      LEFT JOIN Autorzy a ON a.AutorId = ka.AutorId
      WHERE u.UzytkownikId = ? AND k.IsDeleted = 0
      GROUP BY u.UlubioneId, k.KsiazkaId, k.Tytul, k.DostepneEgzemplarze, u.CreatedAt
      ORDER BY u.CreatedAt DESC
      `,
      [user.id]
    );

    return NextResponse.json({ favorites: rows });
  } catch (err) {
    console.error("DB error /api/favorites GET:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych" },
      { status: 500 }
    );
  }
}

/**
 * Handler POST - Dodawanie książki do ulubionych
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookId } = body;

    if (!bookId || !Number.isFinite(Number(bookId))) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID książki" },
        { status: 400 }
      );
    }

    // Sprawdź czy książka istnieje
    const [bookCheck] = await pool.query<RowDataPacket[]>(
      "SELECT KsiazkaId FROM ksiazki WHERE KsiazkaId = ? AND IsDeleted = 0",
      [bookId]
    );

    if (bookCheck.length === 0) {
      return NextResponse.json(
        { error: "Książka nie istnieje" },
        { status: 404 }
      );
    }

    // Sprawdź czy już jest w ulubionych
    const [existingCheck] = await pool.query<RowDataPacket[]>(
      "SELECT UlubioneId FROM ulubione WHERE UzytkownikId = ? AND KsiazkaId = ?",
      [user.id, bookId]
    );

    if (existingCheck.length > 0) {
      return NextResponse.json(
        { error: "Książka jest już w ulubionych", alreadyFavorite: true },
        { status: 409 }
      );
    }

    // Dodaj do ulubionych
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO ulubione (UzytkownikId, KsiazkaId) VALUES (?, ?)",
      [user.id, bookId]
    );

    return NextResponse.json({
      success: true,
      favoriteId: result.insertId,
      message: "Dodano do ulubionych"
    }, { status: 201 });

  } catch (err) {
    console.error("DB error /api/favorites POST:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych" },
      { status: 500 }
    );
  }
}

/**
 * Handler DELETE - Usuwanie książki z ulubionych
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    if (!bookId || !Number.isFinite(Number(bookId))) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID książki" },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM ulubione WHERE UzytkownikId = ? AND KsiazkaId = ?",
      [user.id, bookId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Książka nie była w ulubionych" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usunięto z ulubionych"
    });

  } catch (err) {
    console.error("DB error /api/favorites DELETE:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych" },
      { status: 500 }
    );
  }
}
