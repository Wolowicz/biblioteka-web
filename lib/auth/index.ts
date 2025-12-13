/**
 * =============================================================================
 * AUTH MODULE (CLIENT) - Moduł autoryzacji dla komponentów klienckich
 * =============================================================================
 * 
 * Ten moduł zawiera logikę autoryzacji działającą po stronie klienta:
 * - Hook useAuth() do pobierania stanu sesji
 * - Funkcje walidacji hasła
 * 
 * WAŻNE: To jest "use client" moduł - nie używaj w Server Components!
 * Dla SSR użyj @/lib/auth/server.
 * 
 * Przepływ danych autoryzacji:
 * 1. Użytkownik loguje się przez authService.login() z @/services
 * 2. API ustawia cookie sesji (httpOnly)
 * 3. useAuth() pobiera sesję z /api/auth/session
 * 4. Komponenty reagują na zmiany stanu autoryzacji
 * 
 * Zależności:
 * - @/domain/types - typy UserSession, UserRole, AuthState
 * - /api/auth/* - endpointy autoryzacji
 * 
 * Re-eksporty (dla kompatybilności wstecznej):
 * - UserRole, UserSession z @/domain/types
 */

"use client";

import { useState, useEffect, useCallback } from "react";

// Re-eksport typów dla kompatybilności wstecznej
// Dzięki temu istniejący kod importujący z "@/lib/auth" nadal działa
export type { UserRole, UserSession } from "@/domain/types";

import type { UserSession, AuthState } from "@/domain/types";

// =============================================================================
// HOOK AUTORYZACJI
// =============================================================================

/**
 * Hook do zarządzania stanem autoryzacji po stronie klienta.
 * 
 * Automatycznie pobiera sesję użytkownika przy montowaniu komponentu
 * i udostępnia informacje o stanie autoryzacji.
 * 
 * @returns {AuthState} Obiekt z danymi użytkownika i stanem ładowania
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, isLoading } = useAuth();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (!isAuthenticated) return <LoginPrompt />;
 *   
 *   return <div>Witaj, {user.firstName}!</div>;
 * }
 * ```
 * 
 * Uwagi:
 * - Hook wykonuje żądanie HTTP przy każdym montowaniu
 * - Dla optymalizacji rozważ React Query lub SWR
 * - W przypadku błędu sieciowego traktuje jako niezalogowany
 */
export function useAuth(): AuthState {
  // Stan użytkownika (null = niezalogowany)
  const [user, setUser] = useState<UserSession | null>(null);
  
  // Flaga ładowania (true podczas pobierania sesji)
  const [isLoading, setIsLoading] = useState(true);

  // Effect pobierający sesję przy montowaniu
  useEffect(() => {
    /**
     * Asynchroniczna funkcja pobierająca sesję z API.
     * Wydzielona, bo useEffect nie może być async.
     */
    async function loadSession(): Promise<void> {
      try {
        // Wykonaj żądanie do API sesji
        const res = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include", // Ważne: wysyłaj cookies
          cache: "no-store",      // Zawsze pobieraj świeże dane
        });

        if (res.ok) {
          // Sukces - parsuj dane użytkownika
          const data = await res.json();
          setUser(data.user ?? data); // Obsłuż oba formaty odpowiedzi
        } else {
          // Błąd HTTP - traktuj jako niezalogowany
          setUser(null);
        }
      } catch (error) {
        // Błąd sieciowy - traktuj jako niezalogowany
        console.error("Błąd pobierania sesji:", error);
        setUser(null);
      } finally {
        // Zawsze zakończ ładowanie
        setIsLoading(false);
      }
    }

    // Uruchom pobieranie sesji
    loadSession();
  }, []); // Pusta tablica zależności = tylko przy montowaniu

  // Zwróć obiekt stanu autoryzacji
  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
  };
}

// =============================================================================
// WALIDACJA
// =============================================================================

/**
 * Waliduje hasło według wymagań bezpieczeństwa.
 * 
 * Wymagania:
 * - Minimum 8 znaków
 * - Co najmniej jedna duża litera (A-Z)
 * - Co najmniej jedna mała litera (a-z)
 * - Co najmniej jedna cyfra (0-9)
 * - Co najmniej jeden znak specjalny (!@#$%^&*)
 * 
 * @param password - Hasło do walidacji
 * @returns Komunikat błędu (string) lub null jeśli hasło poprawne
 * 
 * @example
 * ```tsx
 * const error = validatePassword("weakpass");
 * if (error) {
 *   setPasswordError(error); // "Hasło musi zawierać dużą literę"
 * }
 * ```
 */
export function validatePassword(password: string): string | null {
  // Sprawdź długość
  if (password.length < 8) {
    return "Hasło musi mieć co najmniej 8 znaków";
  }
  
  // Sprawdź dużą literę
  if (!/[A-Z]/.test(password)) {
    return "Hasło musi zawierać dużą literę";
  }
  
  // Sprawdź małą literę
  if (!/[a-z]/.test(password)) {
    return "Hasło musi zawierać małą literę";
  }
  
  // Sprawdź cyfrę
  if (!/[0-9]/.test(password)) {
    return "Hasło musi zawierać cyfrę";
  }
  
  // Sprawdź znak specjalny
  if (!/[!@#$%^&*]/.test(password)) {
    return "Hasło musi zawierać znak specjalny";
  }

  // Hasło poprawne
  return null;
}

// =============================================================================
// FUNKCJE LOGOWANIA
// =============================================================================

/**
 * Wykonuje żądanie logowania do API.
 * 
 * @param email - Email użytkownika
 * @param password - Hasło użytkownika
 * @returns Promise<Response> - Odpowiedź z API
 */
export async function authLogin(email: string, password: string): Promise<Response> {
  return fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
}
