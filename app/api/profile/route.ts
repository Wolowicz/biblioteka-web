/**
 * =============================================================================
 * API: /api/profile - Zarządzanie profilem użytkownika
 * =============================================================================
 * 
 * GET   /api/profile - Pobierz dane profilu zalogowanego użytkownika
 * PATCH /api/profile - Aktualizuj dane profilu
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcrypt";

/**
 * Handler GET - Pobieranie danych profilu
 */
export async function GET() {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        u.UzytkownikId AS id,
        u.Email AS email,
        u.Imie AS firstName,
        u.Nazwisko AS lastName,
        r.NazwaRoli AS role,
        u.Aktywny AS active,
        u.CreatedAt AS createdAt
      FROM uzytkownicy u
      JOIN role r ON u.RolaId = r.RolaId
      WHERE u.UzytkownikId = ? AND u.IsDeleted = 0
      `,
      [user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Użytkownik nie został znaleziony" },
        { status: 404 }
      );
    }

    const profile = rows[0];

    // Pobierz statystyki użytkownika
    const [statsResult] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        (SELECT COUNT(*) FROM wypozyczenia WHERE UzytkownikId = ? AND IsDeleted = 0) AS totalBorrowings,
        (SELECT COUNT(*) FROM wypozyczenia WHERE UzytkownikId = ? AND Status = 'Aktywne' AND IsDeleted = 0) AS activeBorrowings,
        (SELECT COUNT(*) FROM recenzje WHERE UzytkownikId = ? AND IsDeleted = 0) AS totalReviews,
        (SELECT COALESCE(SUM(Kwota), 0) FROM kary k 
          JOIN wypozyczenia w ON k.WypozyczenieId = w.WypozyczenieId 
          WHERE w.UzytkownikId = ? AND k.Status = 'Naliczona') AS unpaidFines
      `,
      [user.id, user.id, user.id, user.id]
    );

    return NextResponse.json({
      ...profile,
      stats: {
        totalBorrowings: statsResult[0].totalBorrowings,
        activeBorrowings: statsResult[0].activeBorrowings,
        totalReviews: statsResult[0].totalReviews,
        unpaidFines: parseFloat(statsResult[0].unpaidFines) || 0
      }
    });
  } catch (error) {
    console.error("Błąd API GET /api/profile:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler PATCH - Aktualizacja profilu
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, currentPassword, newPassword } = body;

    // Walidacja danych
    if (firstName && firstName.length < 2) {
      return NextResponse.json(
        { error: "Imię musi mieć minimum 2 znaki" },
        { status: 400 }
      );
    }

    if (lastName && lastName.length < 2) {
      return NextResponse.json(
        { error: "Nazwisko musi mieć minimum 2 znaki" },
        { status: 400 }
      );
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Nieprawidłowy format adresu email" },
          { status: 400 }
        );
      }

      // Sprawdź czy email nie jest już zajęty
      const [existingEmail] = await pool.query<RowDataPacket[]>(
        `SELECT UzytkownikId FROM uzytkownicy WHERE Email = ? AND UzytkownikId != ?`,
        [email, user.id]
      );

      if (existingEmail.length > 0) {
        return NextResponse.json(
          { error: "Ten adres email jest już zajęty" },
          { status: 409 }
        );
      }
    }

    // Jeśli zmiana hasła
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Wymagane aktualne hasło do zmiany hasła" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "Nowe hasło musi mieć minimum 8 znaków" },
          { status: 400 }
        );
      }

      // Weryfikacja aktualnego hasła
      const [userRow] = await pool.query<RowDataPacket[]>(
        `SELECT HasloHash FROM uzytkownicy WHERE UzytkownikId = ?`,
        [user.id]
      );

      const isPasswordValid = await bcrypt.compare(currentPassword, userRow[0].HasloHash);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Nieprawidłowe aktualne hasło" },
          { status: 400 }
        );
      }
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
      updates.push("Email = ?");
      params.push(email);
    }
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push("HasloHash = ?");
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Brak danych do aktualizacji" },
        { status: 400 }
      );
    }

    params.push(user.id);

    await pool.query<ResultSetHeader>(
      `UPDATE uzytkownicy SET ${updates.join(", ")} WHERE UzytkownikId = ?`,
      params
    );

    // Log operacji
    await pool.query(
      `
      INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
      VALUES ('Audyt', ?, 'Zaktualizowano profil użytkownika', 'Uzytkownicy', ?)
      `,
      [user.id, user.id]
    );

    // Aktualizuj sesję jeśli zmieniono dane
    if (firstName || lastName || email) {
      const newSession = {
        ...user,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email
      };

      const cookieStore = await cookies();
      cookieStore.set("userSession", JSON.stringify(newSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 7 dni
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profil został zaktualizowany"
    });
  } catch (error) {
    console.error("Błąd API PATCH /api/profile:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
