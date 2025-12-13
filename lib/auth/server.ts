/**
 * =============================================================================
 * AUTH MODULE (SERVER) - Moduł autoryzacji dla Server Components
 * =============================================================================
 * 
 * Ten moduł zawiera logikę autoryzacji działającą po stronie serwera (SSR).
 * Używany jest w Server Components i Route Handlers do pobierania sesji
 * użytkownika z cookie.
 * 
 * WAŻNE: Ten moduł używa next/headers, które działają tylko po stronie serwera!
 * Dla Client Components użyj @/lib/auth (hook useAuth).
 * 
 * Przepływ autoryzacji SSR:
 * 1. Użytkownik loguje się → API ustawia cookie "userSession"
 * 2. Przy każdym żądaniu SSR odczytujemy cookie
 * 3. Parsujemy JSON i mapujemy rolę na standardowy format
 * 4. Zwracamy obiekt UserSession lub null
 * 
 * Zależności:
 * - next/headers - dostęp do cookies w SSR
 * - @/lib/auth/role-map - mapowanie ról z bazy danych
 * - @/domain/types - typ UserSession
 */

import { cookies } from "next/headers";
import { mapRoleFromDb } from "@/lib/auth/role-map";
import type { UserSession } from "@/domain/types";

// =============================================================================
// STAŁE
// =============================================================================

/**
 * Nazwa cookie przechowującego sesję użytkownika.
 * Musi być zgodna z nazwą ustawianą w /api/auth/login.
 */
const SESSION_COOKIE_NAME = "userSession";

// =============================================================================
// FUNKCJE AUTORYZACJI SSR
// =============================================================================

/**
 * Pobiera sesję użytkownika z cookie (Server-Side Rendering).
 * 
 * Funkcja bezpiecznie parsuje cookie sesji i mapuje rolę
 * z formatu bazodanowego na standardowy format aplikacji.
 * 
 * @returns Promise z obiektem UserSession lub null jeśli:
 *          - Brak cookie sesji
 *          - Cookie zawiera nieprawidłowy JSON
 *          - Wystąpił błąd parsowania
 * 
 * @example
 * ```tsx
 * // W Server Component lub Route Handler
 * export default async function Page() {
 *   const user = await getUserSessionSSR();
 *   
 *   if (!user) {
 *     redirect("/login");
 *   }
 *   
 *   return <div>Witaj, {user.firstName}!</div>;
 * }
 * ```
 * 
 * Bezpieczeństwo:
 * - Cookie jest httpOnly (nie dostępne z JavaScript)
 * - Cookie jest Secure w produkcji (tylko HTTPS)
 * - Cookie ma SameSite=Lax (ochrona przed CSRF)
 */
export async function getUserSessionSSR(): Promise<UserSession | null> {
  // Pobierz store cookies (async w Next.js 14)
  const cookieStore = await cookies();
  
  // Szukaj cookie z sesją
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  // Brak cookie = niezalogowany
  if (!sessionCookie) {
    return null;
  }

  try {
    // Parsuj JSON z cookie
    const session = JSON.parse(sessionCookie.value);

    // Mapuj rolę z formatu bazodanowego na standardowy
    // (obsługuje różne formaty: "CZYTELNIK", "USER", "3", itp.)
    session.role = mapRoleFromDb(session.role);

    // Zwróć sesję użytkownika
    return session as UserSession;
  } catch (error) {
    // Błąd parsowania = nieprawidłowe dane w cookie
    // Loguj w development, ignoruj w produkcji
    if (process.env.NODE_ENV === "development") {
      console.error("Błąd parsowania sesji z cookie:", error);
    }
    
    return null;
  }
}

/**
 * Sprawdza czy użytkownik jest zalogowany (SSR).
 * 
 * Prostsza alternatywa dla getUserSessionSSR gdy potrzebujemy
 * tylko sprawdzić fakt zalogowania bez danych użytkownika.
 * 
 * @returns Promise<boolean> - true jeśli zalogowany
 */
export async function isAuthenticatedSSR(): Promise<boolean> {
  const user = await getUserSessionSSR();
  return user !== null;
}

/**
 * Pobiera sesję i sprawdza czy użytkownik ma wymaganą rolę.
 * 
 * @param requiredRoles - Tablica dozwolonych ról
 * @returns Promise z UserSession jeśli ma uprawnienia, null w przeciwnym razie
 * 
 * @example
 * ```tsx
 * // Tylko dla adminów
 * const admin = await getAuthorizedUser(["ADMIN"]);
 * 
 * // Dla adminów i bibliotekarzy
 * const staff = await getAuthorizedUser(["ADMIN", "LIBRARIAN"]);
 * ```
 */
export async function getAuthorizedUser(
  requiredRoles: UserSession["role"][]
): Promise<UserSession | null> {
  const user = await getUserSessionSSR();
  
  // Niezalogowany
  if (!user) {
    return null;
  }
  
  // Sprawdź czy rola jest dozwolona
  if (!requiredRoles.includes(user.role)) {
    return null;
  }
  
  return user;
}
