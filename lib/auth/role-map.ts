/**
 * =============================================================================
 * ROLE MAP - Mapowanie ról użytkowników z bazy danych
 * =============================================================================
 * 
 * Ten moduł odpowiada za konwersję ról użytkowników z różnych formatów
 * używanych w bazie danych na standardowy format aplikacji (UserRole).
 * 
 * Problem:
 * Baza danych może przechowywać role w różnych formatach:
 * - Polskie nazwy: "CZYTELNIK", "BIBLIOTEKARZ", "ADMIN"
 * - Angielskie nazwy: "USER", "LIBRARIAN", "ADMIN"
 * - Numeryczne ID: "1" (Admin), "2" (Librarian), "3" (User)
 * 
 * Rozwiązanie:
 * Funkcja mapRoleFromDb() normalizuje wszystkie formaty do UserRole.
 * 
 * Zależności:
 * - @/domain/types - typ UserRole
 */

import type { UserRole } from "@/domain/types";

// Re-eksport typu dla kompatybilności wstecznej
export type { UserRole } from "@/domain/types";

// =============================================================================
// STAŁE MAPOWANIA
// =============================================================================

/**
 * Mapa konwersji różnych formatów na UserRole.
 * Klucze są UPPERCASE dla case-insensitive porównania.
 */
const ROLE_MAPPING: Record<string, UserRole> = {
  // Polskie nazwy
  "ADMIN": "ADMIN",
  "ADMINISTRATOR": "ADMIN",
  "BIBLIOTEKARZ": "LIBRARIAN",
  "CZYTELNIK": "READER",
  
  // Angielskie nazwy
  "LIBRARIAN": "LIBRARIAN",
  "READER": "READER",
  "USER": "READER",
  
  // Numeryczne ID (z tabeli Role w bazie)
  "1": "ADMIN",
  "2": "LIBRARIAN", 
  "3": "READER",
};

/**
 * Domyślna rola przypisywana gdy nie można zmapować.
 */
const DEFAULT_ROLE: UserRole = "READER";

// =============================================================================
// FUNKCJE MAPOWANIA
// =============================================================================

/**
 * Mapuje rolę z bazy danych na standardowy format UserRole.
 * 
 * Funkcja jest case-insensitive i obsługuje:
 * - Polskie nazwy ról (CZYTELNIK, BIBLIOTEKARZ, ADMIN)
 * - Angielskie nazwy ról (USER, LIBRARIAN, ADMIN)
 * - Numeryczne ID ról (1, 2, 3)
 * - Wartości z białymi znakami (trimowane)
 * 
 * @param dbRole - Rola z bazy danych (może być string, number, null, undefined)
 * @returns Zmapowana rola (UserRole) lub "USER" jako domyślna
 * 
 * @example
 * ```typescript
 * mapRoleFromDb("CZYTELNIK")   // → "USER"
 * mapRoleFromDb("ADMIN")       // → "ADMIN"
 * mapRoleFromDb("2")           // → "LIBRARIAN"
 * mapRoleFromDb("librarian")   // → "LIBRARIAN" (case-insensitive)
 * mapRoleFromDb(null)          // → "USER" (domyślna)
 * mapRoleFromDb("unknown")     // → "USER" (domyślna)
 * ```
 */
export function mapRoleFromDb(dbRole: string | number | null | undefined): UserRole {
  // Obsłuż null/undefined
  if (dbRole === null || dbRole === undefined) {
    return DEFAULT_ROLE;
  }

  // Konwertuj na string i normalizuj
  const normalizedRole = String(dbRole).toUpperCase().trim();

  // Szukaj w mapie
  const mappedRole = ROLE_MAPPING[normalizedRole];

  // Zwróć zmapowaną rolę lub domyślną
  if (mappedRole) {
    return mappedRole;
  }

  // Loguj ostrzeżenie w development dla nieznanych ról
  if (process.env.NODE_ENV === "development") {
    console.warn(`Nieznana rola w bazie danych: "${dbRole}", używam domyślnej: ${DEFAULT_ROLE}`);
  }

  return DEFAULT_ROLE;
}

/**
 * Sprawdza czy wartość jest prawidłową rolą UserRole.
 * 
 * Type guard pozwalający TypeScriptowi zawęzić typ.
 * 
 * @param role - Wartość do sprawdzenia
 * @returns true jeśli role jest prawidłową UserRole
 * 
 * @example
 * ```typescript
 * const role: unknown = getUserInput();
 * 
 * if (isValidUserRole(role)) {
 *   // TypeScript wie, że role jest UserRole
 *   console.log(`Rola: ${role}`);
 * }
 * ```
 */
export function isValidUserRole(role: unknown): role is UserRole {
  return (
    typeof role === "string" &&
    ["ADMIN", "LIBRARIAN", "READER"].includes(role)
  );
}

/**
 * Pobiera wszystkie dozwolone wartości UserRole.
 * 
 * @returns Tablica wszystkich dozwolonych ról
 */
export function getAllRoles(): UserRole[] {
  return ["ADMIN", "LIBRARIAN", "READER"];
}
