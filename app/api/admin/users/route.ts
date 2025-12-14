/**
 * =============================================================================
 * API: /api/admin/users - Zarządzanie użytkownikami (ADMIN)
 * =============================================================================
 * 
 * GET  /api/admin/users - Lista wszystkich użytkowników
 * POST /api/admin/users - Tworzenie nowego użytkownika
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcrypt";

/**
 * Handler GET - Lista użytkowników
 * 
 * Parametry query:
 * - includeDeleted=true: Uwzględnij usuniętych użytkowników
 * - role=READER|LIBRARIAN|ADMIN: Filtruj po roli
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    // Bibliotekarze i admini mogą pobierać listę użytkowników
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";
    const roleFilter = searchParams.get("role");

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (!includeDeleted) {
      conditions.push("u.IsDeleted = 0");
    }

    // Mapowanie roli na polskie nazwy w bazie
    if (roleFilter) {
      const roleMap: Record<string, string> = {
        "READER": "Czytelnik",
        "LIBRARIAN": "Bibliotekarz",
        "ADMIN": "Administrator"
      };
      const polishRole = roleMap[roleFilter];
      if (polishRole) {
        conditions.push("r.NazwaRoli = ?");
        params.push(polishRole);
      }
    }

    let query = `
      SELECT 
        u.UzytkownikId AS id,
        u.Email AS email,
        u.Imie AS firstName,
        u.Nazwisko AS lastName,
        CASE r.NazwaRoli
          WHEN 'Administrator' THEN 'ADMIN'
          WHEN 'Bibliotekarz' THEN 'LIBRARIAN'
          ELSE 'READER'
        END AS role,
        r.NazwaRoli AS roleName,
        u.Aktywny AS active,
        u.IsDeleted AS deleted,
        u.CreatedAt AS createdAt,
        u.DeletedAt AS deletedAt
      FROM uzytkownicy u
      JOIN role r ON u.RolaId = r.RolaId
    `;

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    query += ` ORDER BY u.CreatedAt DESC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return NextResponse.json({ users: rows });
  } catch (error) {
    console.error("Błąd API GET /api/admin/users:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler POST - Tworzenie użytkownika
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, firstName, lastName, role } = body;

    // Walidacja
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Wszystkie pola są wymagane" },
        { status: 400 }
      );
    }

    // Sprawdź czy email jest zajęty
    const [existingUser] = await pool.query<RowDataPacket[]>(
      `SELECT UzytkownikId FROM uzytkownicy WHERE Email = ?`,
      [email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Użytkownik z tym adresem email już istnieje" },
        { status: 409 }
      );
    }

    // Pobierz ID roli
    const roleMap: Record<string, string> = {
      "ADMIN": "ADMIN",
      "LIBRARIAN": "BIBLIOTEKARZ",
      "READER": "CZYTELNIK"
    };

    const dbRoleName = roleMap[role] || "CZYTELNIK";
    
    const [roleRow] = await pool.query<RowDataPacket[]>(
      `SELECT RolaId FROM role WHERE NazwaRoli = ?`,
      [dbRoleName]
    );

    if (roleRow.length === 0) {
      return NextResponse.json(
        { error: "Nieprawidłowa rola" },
        { status: 400 }
      );
    }

    // Hash hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Utwórz użytkownika
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO uzytkownicy (Email, HasloHash, Imie, Nazwisko, RolaId, Aktywny)
      VALUES (?, ?, ?, ?, ?, 1)
      `,
      [email, hashedPassword, firstName, lastName, roleRow[0].RolaId]
    );

    // Log operacji
    await pool.query(
      `
      INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId, StanPo)
      VALUES ('Audyt', ?, 'Utworzono nowego użytkownika', 'Uzytkownicy', ?, ?)
      `,
      [
        user.id,
        result.insertId,
        JSON.stringify({ email, firstName, lastName, role: dbRoleName })
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Użytkownik został utworzony",
      userId: result.insertId
    }, { status: 201 });
  } catch (error) {
    console.error("Błąd API POST /api/admin/users:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
