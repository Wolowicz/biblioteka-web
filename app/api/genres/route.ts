/**
 * =============================================================================
 * API: /api/genres - Zarządzanie gatunkami książek
 * =============================================================================
 * 
 * GET  /api/genres - Lista wszystkich gatunków
 * POST /api/genres - Dodaj nowy gatunek (ADMIN)
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserSessionSSR } from "@/lib/auth/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";

/**
 * Handler GET - Pobieranie listy gatunków
 */
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        g.GatunekId AS id,
        g.Nazwa AS name,
        g.Ikona AS icon,
        g.Kolor AS color,
        (SELECT COUNT(*) FROM ksiazki_gatunki kg WHERE kg.GatunekId = g.GatunekId) AS bookCount
      FROM gatunki g
      WHERE g.IsDeleted = 0
      ORDER BY g.Nazwa
      `
    );

    return NextResponse.json({ genres: rows });
  } catch (err) {
    console.error("DB error /api/genres GET:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych" },
      { status: 500 }
    );
  }
}

/**
 * Handler POST - Dodawanie nowego gatunku (tylko ADMIN)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Brak uprawnień" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, icon, color } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nazwa gatunku musi mieć minimum 2 znaki" },
        { status: 400 }
      );
    }

    // Sprawdź czy gatunek już istnieje
    const [existingCheck] = await pool.query<RowDataPacket[]>(
      "SELECT GatunekId FROM gatunki WHERE Nazwa = ? AND IsDeleted = 0",
      [name.trim()]
    );

    if (existingCheck.length > 0) {
      return NextResponse.json(
        { error: "Gatunek o takiej nazwie już istnieje" },
        { status: 409 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO gatunki (Nazwa, Ikona, Kolor) VALUES (?, ?, ?)",
      [name.trim(), icon || "fas fa-book", color || "from-indigo-500 to-purple-600"]
    );

    return NextResponse.json({
      success: true,
      genreId: result.insertId,
      message: "Gatunek został dodany"
    }, { status: 201 });

  } catch (err) {
    console.error("DB error /api/genres POST:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych" },
      { status: 500 }
    );
  }
}
