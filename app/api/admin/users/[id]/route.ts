/**
 * =============================================================================
 * API: /api/admin/users/[id] - Operacje na pojedynczym użytkowniku (ADMIN)
 * =============================================================================
 * 
 * GET    /api/admin/users/[id] - Pobierz szczegóły użytkownika
 * PATCH  /api/admin/users/[id] - Aktualizuj dane użytkownika
 * DELETE /api/admin/users/[id] - Usuń użytkownika (soft delete)
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcrypt";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Handler GET - Szczegóły użytkownika
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = parseInt(id);

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        u.UzytkownikId AS id,
        u.Email AS email,
        u.Imie AS firstName,
        u.Nazwisko AS lastName,
        r.NazwaRoli AS role,
        u.Aktywny AS active,
        u.IsDeleted AS deleted,
        u.CreatedAt AS createdAt
      FROM uzytkownicy u
      JOIN role r ON u.RolaId = r.RolaId
      WHERE u.UzytkownikId = ?
      `,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Użytkownik nie został znaleziony" },
        { status: 404 }
      );
    }

    // Pobierz statystyki użytkownika
    const [stats] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        (SELECT COUNT(*) FROM wypozyczenia WHERE UzytkownikId = ? AND IsDeleted = 0) AS borrowingsCount,
        (SELECT COUNT(*) FROM recenzje WHERE UzytkownikId = ? AND IsDeleted = 0) AS reviewsCount,
        (SELECT COALESCE(SUM(k.Kwota), 0) FROM kary k 
          JOIN wypozyczenia w ON k.WypozyczenieId = w.WypozyczenieId 
          WHERE w.UzytkownikId = ? AND k.Status = 'Naliczona') AS unpaidFines
      `,
      [userId, userId, userId]
    );

    return NextResponse.json({
      ...rows[0],
      stats: stats[0]
    });
  } catch (error) {
    console.error("Błąd API GET /api/admin/users/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler PATCH - Aktualizacja użytkownika
 */
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = parseInt(id);

    const body = await request.json();
    const { firstName, lastName, email, role, active, password } = body;

    // Pobierz stan przed zmianą
    const [beforeState] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM uzytkownicy WHERE UzytkownikId = ?`,
      [userId]
    );

    if (beforeState.length === 0) {
      return NextResponse.json(
        { error: "Użytkownik nie został znaleziony" },
        { status: 404 }
      );
    }

    // Budowanie zapytania UPDATE
    const updates: string[] = [];
    const params: any[] = [];

    if (firstName) {
      updates.push("Imie = ?");
      params.push(firstName);
    }
    if (lastName) {
      updates.push("Nazwisko = ?");
      params.push(lastName);
    }
    if (email) {
      // Sprawdź czy email nie jest zajęty
      const [existingEmail] = await pool.query<RowDataPacket[]>(
        `SELECT UzytkownikId FROM uzytkownicy WHERE Email = ? AND UzytkownikId != ?`,
        [email, userId]
      );

      if (existingEmail.length > 0) {
        return NextResponse.json(
          { error: "Ten adres email jest już zajęty" },
          { status: 409 }
        );
      }

      updates.push("Email = ?");
      params.push(email);
    }
    if (role) {
      const roleMap: Record<string, string> = {
        "ADMIN": "ADMIN",
        "LIBRARIAN": "BIBLIOTEKARZ",
        "READER": "CZYTELNIK"
      };

      const dbRoleName = roleMap[role];
      if (dbRoleName) {
        const [roleRow] = await pool.query<RowDataPacket[]>(
          `SELECT RolaId FROM role WHERE NazwaRoli = ?`,
          [dbRoleName]
        );

        if (roleRow.length > 0) {
          updates.push("RolaId = ?");
          params.push(roleRow[0].RolaId);
        }
      }
    }
    if (typeof active === "boolean") {
      updates.push("Aktywny = ?");
      params.push(active ? 1 : 0);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("HasloHash = ?");
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Brak danych do aktualizacji" },
        { status: 400 }
      );
    }

    params.push(userId);

    await pool.query<ResultSetHeader>(
      `UPDATE uzytkownicy SET ${updates.join(", ")} WHERE UzytkownikId = ?`,
      params
    );

    // Log operacji z audytem
    await pool.query(
      `
      INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId, StanPrzed, StanPo)
      VALUES ('Audyt', ?, 'Zaktualizowano dane użytkownika', 'Uzytkownicy', ?, ?, ?)
      `,
      [
        user.id,
        userId,
        JSON.stringify(beforeState[0]),
        JSON.stringify(body)
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Dane użytkownika zostały zaktualizowane"
    });
  } catch (error) {
    console.error("Błąd API PATCH /api/admin/users/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler DELETE - Usuwanie użytkownika (soft delete)
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = parseInt(id);

    // Nie pozwól na usunięcie samego siebie
    if (userId === parseInt(user.id)) {
      return NextResponse.json(
        { error: "Nie możesz usunąć własnego konta" },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik istnieje
    const [userCheck] = await pool.query<RowDataPacket[]>(
      `SELECT UzytkownikId, IsDeleted FROM uzytkownicy WHERE UzytkownikId = ?`,
      [userId]
    );

    if (userCheck.length === 0) {
      return NextResponse.json(
        { error: "Użytkownik nie został znaleziony" },
        { status: 404 }
      );
    }

    if (userCheck[0].IsDeleted) {
      return NextResponse.json(
        { error: "Użytkownik jest już usunięty" },
        { status: 400 }
      );
    }

    // Soft delete
    await pool.query<ResultSetHeader>(
      `UPDATE uzytkownicy SET IsDeleted = 1, DeletedAt = NOW(), Aktywny = 0 WHERE UzytkownikId = ?`,
      [userId]
    );

    // Log operacji
    await pool.query(
      `
      INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
      VALUES ('Audyt', ?, 'Usunięto użytkownika', 'Uzytkownicy', ?)
      `,
      [user.id, userId]
    );

    return NextResponse.json({
      success: true,
      message: "Użytkownik został usunięty"
    });
  } catch (error) {
    console.error("Błąd API DELETE /api/admin/users/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
