/**
 * =============================================================================
 * API: POST /api/auth/register - Rejestracja nowego użytkownika
 * =============================================================================
 * 
 * Endpoint odpowiedzialny za tworzenie nowych kont użytkowników w systemie
 * bibliotecznym. Nowi użytkownicy automatycznie otrzymują rolę CZYTELNIK.
 * 
 * Przepływ:
 * 1. Parsowanie danych z ciała żądania (email, password, firstName, lastName)
 * 2. Walidacja obecności wszystkich wymaganych pól
 * 3. Walidacja siły hasła według zdefiniowanych reguł
 * 4. Sprawdzenie unikalności adresu email w bazie danych
 * 5. Hashowanie hasła algorytmem bcrypt (Blowfish)
 * 6. Pobranie ID roli CZYTELNIK z tabeli Role
 * 7. Utworzenie nowego rekordu użytkownika w bazie danych
 * 8. Zwrócenie potwierdzenia z ID nowego użytkownika
 * 
 * Kody odpowiedzi:
 * - 201: Użytkownik zarejestrowany pomyślnie
 * - 400: Brakuje wymaganych pól lub hasło nie spełnia wymagań
 * - 409: Użytkownik z podanym emailem już istnieje (konflikt)
 * - 500: Błąd serwera (brak roli CZYTELNIK lub błąd bazy danych)
 * 
 * Zależności:
 * - next/server: NextRequest, NextResponse do obsługi żądań HTTP
 * - bcryptjs: Hashowanie haseł algorytmem Blowfish
 * - @/lib/db: Pool połączeń do bazy danych MySQL
 * - @/lib/auth/index: validatePassword - walidacja siły hasła
 * 
 * Tabele bazodanowe:
 * - Uzytkownicy: Przechowuje dane użytkowników
 * - Role: Słownik ról systemowych
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // Biblioteka do hashowania haseł (algorytm Blowfish)
import pool from "@/lib/db"; // Pula połączeń do bazy danych MySQL
import { validatePassword } from "@/lib/auth/index"; // Walidacja siły hasła

/**
 * Handler POST - Rejestracja nowego użytkownika
 * 
 * Tworzy nowe konto użytkownika po przejściu wszystkich walidacji.
 * Hasło jest bezpiecznie hashowane przed zapisem do bazy danych.
 * 
 * @param {NextRequest} req - Żądanie HTTP zawierające dane rejestracyjne
 * @returns {Promise<NextResponse>} Odpowiedź JSON z wynikiem rejestracji
 */
export async function POST(req: NextRequest) {
  try {
    // === SEKCJA: Parsowanie danych wejściowych ===
    const { email, password, firstName, lastName } = await req.json();

    // === SEKCJA: Walidacja obecności wymaganych pól ===
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Brakuje wymaganych pól" },
        { status: 400 }
      );
    }

    // === SEKCJA: Walidacja siły hasła ===
    // Sprawdzamy czy hasło spełnia wymagania bezpieczeństwa (długość, znaki specjalne, itp.)
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      );
    }

    // === SEKCJA: Sprawdzenie unikalności emaila ===
    // Szukamy aktywnych użytkowników (IsDeleted = 0) z tym samym emailem
    const [existingRows] = await pool.query(
      "SELECT UzytkownikId FROM Uzytkownicy WHERE Email = ? AND IsDeleted = 0",
      [email]
    );
    const existing = existingRows as any[];
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Użytkownik z takim emailem już istnieje" },
        { status: 409 }
      );
    }

    // === SEKCJA: Hashowanie hasła ===
    // Używamy bcrypt z kosztem 10 (balans między bezpieczeństwem a wydajnością)
    const passwordHash = await bcrypt.hash(password, 10);

    // === SEKCJA: Pobranie domyślnej roli użytkownika ===
    // Każdy nowy użytkownik otrzymuje rolę CZYTELNIK
    const [rolesRows] = await pool.query(
      "SELECT RolaId FROM Role WHERE NazwaRoli = 'CZYTELNIK'"
    );
    const rolesList = rolesRows as any[];

    if (rolesList.length === 0) {
      // Sytuacja awaryjna - brak podstawowej roli w systemie
      return NextResponse.json(
        { error: "Brak roli CZYTELNIK w tabeli Role" },
        { status: 500 }
      );
    }

    const roleId = rolesList[0].RolaId;

    // === SEKCJA: Utworzenie użytkownika w bazie danych ===
    // Wstawiamy nowy rekord z Aktywny = 1 (konto aktywne od razu)
    const [result] = await pool.query(
      `INSERT INTO Uzytkownicy (Email, HasloHash, Imie, Nazwisko, RolaId, Aktywny)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [email, passwordHash, firstName, lastName, roleId]
    );

    // === SEKCJA: Odpowiedź sukcesu ===
    return NextResponse.json(
      {
        message: "Użytkownik zarejestrowany",
        userId: (result as any).insertId,
      },
      { status: 201 }
    );
  } catch (err) {
    // === SEKCJA: Obsługa błędów ===
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Błąd serwera podczas rejestracji" },
      { status: 500 }
    );
  }
}
