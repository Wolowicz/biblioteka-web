/**
 * =============================================================================
 * API: GET /api/auth/session - Pobieranie aktualnej sesji użytkownika
 * =============================================================================
 * 
 * Endpoint odpowiedzialny za zwracanie informacji o aktualnie zalogowanym
 * użytkowniku. Służy do weryfikacji stanu uwierzytelnienia po stronie klienta.
 * 
 * Przepływ:
 * 1. Wywołanie funkcji getUserSessionSSR() do odczytu sesji z ciasteczka
 * 2. Zwrócenie danych użytkownika lub null jeśli brak sesji
 * 
 * Kody odpowiedzi:
 * - 200: Zawsze zwraca sukces z obiektem { user: UserData | null }
 * 
 * Zależności:
 * - next/server: NextResponse do budowania odpowiedzi HTTP
 * - @/lib/auth/server: getUserSessionSSR - odczyt sesji po stronie serwera
 * 
 * Uwagi:
 * - Endpoint zawsze zwraca 200, nawet gdy użytkownik nie jest zalogowany
 * - Klient powinien sprawdzić czy user !== null aby określić stan logowania
 * 
 * @packageDocumentation
 */

import { NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";

/**
 * Handler GET - Pobieranie sesji użytkownika
 * 
 * Odczytuje dane sesji z ciasteczka serwerowego i zwraca informacje
 * o zalogowanym użytkowniku lub null w przypadku braku aktywnej sesji.
 * 
 * @returns {Promise<NextResponse>} Odpowiedź JSON z danymi użytkownika lub null
 */
export async function GET() {
  // === SEKCJA: Odczyt sesji użytkownika ===
  // Funkcja getUserSessionSSR odczytuje i parsuje ciasteczko "userSession"
  const user = await getUserSessionSSR();

  // === SEKCJA: Odpowiedź ===
  // Zwracamy dane użytkownika lub null (operator ?? zapewnia null zamiast undefined)
  return NextResponse.json({
    user: user ?? null,
  });
}
