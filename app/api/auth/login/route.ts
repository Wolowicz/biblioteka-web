/**
 * =============================================================================
 * API: POST /api/auth/login - Logowanie użytkownika
 * =============================================================================
 * 
 * Endpoint autoryzacji użytkownika w systemie bibliotecznym.
 * 
 * Przepływ:
 * 1. Walidacja danych wejściowych (email, hasło)
 * 2. Wyszukanie użytkownika w bazie danych
 * 3. Weryfikacja hasła przez bcrypt
 * 4. Mapowanie roli z polskiej nazwy na enum
 * 5. Utworzenie sesji i zapisanie w cookie
 * 
 * Bezpieczeństwo:
 * - Hasła przechowywane jako hash bcrypt
 * - Cookie httpOnly (niedostępne dla JS)
 * - Cookie secure w produkcji (tylko HTTPS)
 * - Sesja wygasa po 2 godzinach
 * 
 * Kody odpowiedzi:
 * - 200: Sukces, zwraca dane sesji
 * - 400: Błąd walidacji lub nieprawidłowe dane
 * - 500: Błąd serwera
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { mapRoleFromDb, isValidUserRole } from "@/lib/auth/role-map";
import type { UserSession } from "@/domain/types";

// =============================================================================
// STAŁE KONFIGURACYJNE
// =============================================================================

/** Czas życia sesji w sekundach (2 godziny) */
const SESSION_MAX_AGE = 60 * 60 * 2;

/** Czas życia sesji "zapamiętaj mnie" w sekundach (30 dni) */
const SESSION_REMEMBER_MAX_AGE = 60 * 60 * 24 * 30;

// =============================================================================
// HANDLER POST
// =============================================================================

/**
 * Obsługuje żądanie logowania.
 * 
 * @param req - Żądanie Next.js z body { email, password }
 * @returns Odpowiedź JSON z danymi sesji lub błędem
 */
export async function POST(req: NextRequest) {
  try {
    // -------------------------------------------------------------------------
    // 1. PARSOWANIE I WALIDACJA BODY
    // -------------------------------------------------------------------------
    
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Nieprawidłowe dane wejściowe" },
        { status: 400 }
      );
    }

    const { email, password, rememberMe = false } = body;

    // Walidacja wymaganych pól
    if (!email || !password) {
      return NextResponse.json(
        { error: "Podaj email i hasło" },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------------------
    // 2. WYSZUKANIE UŻYTKOWNIKA W BAZIE DANYCH
    // -------------------------------------------------------------------------
    
    const [rows] = await pool.query(
      `
        SELECT 
          u.UzytkownikId AS Id,
          u.Imie,
          u.Nazwisko,
          u.Email,
          u.HasloHash,
          r.NazwaRoli AS Rola
        FROM uzytkownicy u
        JOIN role r ON u.RolaId = r.RolaId
        WHERE u.Email = ?
          AND u.IsDeleted = 0
          AND u.Aktywny = 1
      `,
      [email]
    );

    const users = rows as any[];

    // Użytkownik nie istnieje lub jest nieaktywny
    if (users.length === 0) {
      return NextResponse.json(
        { error: "Nieprawidłowy login lub hasło" },
        { status: 400 }
      );
    }

    const user = users[0];

    // -------------------------------------------------------------------------
    // 3. WERYFIKACJA HASŁA
    // -------------------------------------------------------------------------
    
    const passwordValid = await bcrypt.compare(password, user.HasloHash);
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Nieprawidłowy login lub hasło" },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------------------
    // 4. MAPOWANIE ROLI I TWORZENIE SESJI
    // -------------------------------------------------------------------------
    
    // Mapuj polską nazwę roli na enum (np. "Administrator" -> "ADMIN")
    const mappedRole = mapRoleFromDb(user.Rola);

    // Ostrzeżenie deweloperskie jeśli rola nieznana
    if (!isValidUserRole(mappedRole)) {
      console.warn("Ostrzeżenie: niezmapowana rola w DB:", user.Rola);
    }

    // Obiekt sesji użytkownika
    const session: UserSession = {
      id: String(user.Id),
      email: user.Email,
      firstName: user.Imie,
      lastName: user.Nazwisko,
      role: mappedRole,
    };

    // -------------------------------------------------------------------------
    // 5. ZAPISANIE SESJI W COOKIE
    // -------------------------------------------------------------------------
    
    // Ustaw czas życia sesji w zależności od "zapamiętaj mnie"
    const sessionMaxAge = rememberMe ? SESSION_REMEMBER_MAX_AGE : SESSION_MAX_AGE;
    
    const cookieStore = await cookies();
    cookieStore.set("userSession", JSON.stringify(session), {
      httpOnly: true, // Niedostępne dla JavaScript (ochrona przed XSS)
      secure: process.env.NODE_ENV === "production", // HTTPS w produkcji
      sameSite: "lax", // Ochrona przed CSRF
      path: "/",
      maxAge: sessionMaxAge,
    });

    // Log logowania
    await pool.query(
      `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
       VALUES ('Bezpieczenstwo', ?, ?, 'Uzytkownicy', ?)`,
      [user.Id, `Zalogowano${rememberMe ? ' (zapamiętaj mnie)' : ''}`, user.Id]
    );

    // Zwróć dane sesji (bez hasła)
    return NextResponse.json(session, { status: 200 });
    
  } catch (err) {
    // -------------------------------------------------------------------------
    // OBSŁUGA BŁĘDÓW
    // -------------------------------------------------------------------------
    
    console.error("Login error:", err);

    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 }
    );
  }
}
