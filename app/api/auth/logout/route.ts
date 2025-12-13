/**
 * =============================================================================
 * API: POST /api/auth/logout - Wylogowanie użytkownika
 * =============================================================================
 * 
 * Endpoint odpowiedzialny za zakończenie sesji użytkownika poprzez usunięcie
 * ciasteczka sesyjnego. Nie wymaga uwierzytelnienia - każde wywołanie
 * skutkuje wyczyszczeniem sesji.
 * 
 * Przepływ:
 * 1. Pobranie dostępu do ciasteczek serwera
 * 2. Nadpisanie ciasteczka "userSession" pustą wartością z maxAge=0
 * 3. Zwrócenie potwierdzenia sukcesu
 * 
 * Kody odpowiedzi:
 * - 200: Wylogowanie zakończone sukcesem
 * 
 * Zależności:
 * - next/server: NextResponse do budowania odpowiedzi HTTP
 * - next/headers: cookies() do zarządzania ciasteczkami po stronie serwera
 * 
 * @packageDocumentation
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Handler POST - Wylogowanie użytkownika
 * 
 * Usuwa ciasteczko sesyjne użytkownika poprzez ustawienie pustej wartości
 * i maxAge=0, co powoduje natychmiastowe wygaśnięcie ciasteczka w przeglądarce.
 * 
 * @returns {Promise<NextResponse>} Odpowiedź JSON z potwierdzeniem { ok: true }
 */
export async function POST() {
  // === SEKCJA: Dostęp do ciasteczek ===
  const cookieStore = await cookies();

  // === SEKCJA: Usunięcie sesji użytkownika ===
  // Nadpisujemy ciasteczko pustą wartością z maxAge=0, co skutkuje jego usunięciem
  cookieStore.set("userSession", "", {
    httpOnly: true,                                    // Niedostępne dla JavaScript (ochrona przed XSS)
    secure: process.env.NODE_ENV === "production",    // HTTPS tylko w produkcji
    sameSite: "lax",                                  // Ochrona przed CSRF
    path: "/",                                        // Ciasteczko dostępne dla całej aplikacji
    maxAge: 0,                                        // Natychmiastowe wygaśnięcie
  });

  // === SEKCJA: Odpowiedź ===
  return NextResponse.json({ ok: true });
}
