/**
 * =============================================================================
 * API: Powiadomienia użytkownika
 * =============================================================================
 * 
 * GET  /api/notifications - pobiera powiadomienia użytkownika
 * POST /api/notifications - tworzy nowe powiadomienie (ADMIN/LIBRARIAN)
 * PUT  /api/notifications - oznacza wszystkie jako przeczytane
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserSessionSSR } from "@/lib/auth/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    if (!user) {
      return NextResponse.json(
        { error: "Wymagane logowanie" },
        { status: 401 }
      );
    }

    // Pobierz powiadomienia użytkownika (tylko InApp)
    const [notifications] = await pool.query<RowDataPacket[]>(
      `SELECT 
        PowiadomienieId as id,
        Typ as type,
        Status as status,
        Temat as title,
        Tresc as message,
        UtworzoneKiedy as createdAt,
        PrzeczytaneKiedy as readAt,
        (PrzeczytaneKiedy IS NOT NULL) as isRead
       FROM powiadomienia
       WHERE UzytkownikId = ? AND Typ = 'InApp'
       ORDER BY UtworzoneKiedy DESC
       LIMIT 50`,
      [user.id]
    );

    // Policz nieprzeczytane
    const [countResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as unreadCount 
       FROM powiadomienia 
       WHERE UzytkownikId = ? AND Typ = 'InApp' AND PrzeczytaneKiedy IS NULL`,
      [user.id]
    );

    return NextResponse.json({
      notifications,
      unreadCount: countResult[0]?.unreadCount || 0,
    });

  } catch (error) {
    console.error("Błąd pobierania powiadomień:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * POST - Tworzenie nowego powiadomienia (ADMIN/LIBRARIAN)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    if (!user) {
      return NextResponse.json(
        { error: "Wymagane logowanie" },
        { status: 401 }
      );
    }

    // Tylko admin i bibliotekarz mogą tworzyć powiadomienia
    if (user.role !== "ADMIN" && user.role !== "LIBRARIAN") {
      return NextResponse.json(
        { error: "Brak uprawnień" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, title, message, targetRole } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Tytuł i treść są wymagane" },
        { status: 400 }
      );
    }

    // Wyślij do konkretnego użytkownika lub do całej roli
    if (userId) {
      // Pojedynczy użytkownik
      await pool.query<ResultSetHeader>(
        `INSERT INTO powiadomienia (UzytkownikId, Typ, Status, Temat, Tresc)
         VALUES (?, 'InApp', 'Oczekuje', ?, ?)`,
        [userId, title, message]
      );
    } else if (targetRole) {
      // Wszyscy użytkownicy z daną rolą
      const roleMap: Record<string, string> = {
        "ADMIN": "ADMIN",
        "LIBRARIAN": "BIBLIOTEKARZ",
        "READER": "CZYTELNIK"
      };

      const dbRoleName = roleMap[targetRole];
      if (dbRoleName) {
        const [users] = await pool.query<RowDataPacket[]>(
          `SELECT u.UzytkownikId FROM uzytkownicy u
           JOIN role r ON u.RolaId = r.RolaId
           WHERE r.NazwaRoli = ? AND u.IsDeleted = 0 AND u.Aktywny = 1`,
          [dbRoleName]
        );

        for (const u of users) {
          await pool.query<ResultSetHeader>(
            `INSERT INTO powiadomienia (UzytkownikId, Typ, Status, Temat, Tresc)
             VALUES (?, 'InApp', 'Oczekuje', ?, ?)`,
            [u.UzytkownikId, title, message]
          );
        }
      }
    } else {
      // Wszyscy użytkownicy
      const [users] = await pool.query<RowDataPacket[]>(
        `SELECT UzytkownikId FROM uzytkownicy WHERE IsDeleted = 0 AND Aktywny = 1`
      );

      for (const u of users) {
        await pool.query<ResultSetHeader>(
          `INSERT INTO powiadomienia (UzytkownikId, Typ, Status, Temat, Tresc)
           VALUES (?, 'InApp', 'Oczekuje', ?, ?)`,
          [u.UzytkownikId, title, message]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Powiadomienie zostało wysłane"
    }, { status: 201 });

  } catch (error) {
    console.error("Błąd tworzenia powiadomienia:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}

// Oznacz wszystkie jako przeczytane
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    if (!user) {
      return NextResponse.json(
        { error: "Wymagane logowanie" },
        { status: 401 }
      );
    }

    await pool.query(
      `UPDATE powiadomienia 
       SET PrzeczytaneKiedy = NOW(), Status = 'Przeczytane'
       WHERE UzytkownikId = ? AND PrzeczytaneKiedy IS NULL`,
      [user.id]
    );

    return NextResponse.json({ message: "Oznaczono jako przeczytane" });

  } catch (error) {
    console.error("Błąd aktualizacji powiadomień:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
