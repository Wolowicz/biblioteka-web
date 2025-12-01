// lib/role-map.ts
// Centralny moduł mapowania ról pomiędzy warstwą danych (DB) a warstwą aplikacji (UI).
// Zapewnia spójność, bezpieczeństwo i hermetyzację logiki RBAC.

import type { UserRole } from "@/lib/auth-client";

/**
 * Typ ról w bazie danych.
 * W bazie występują:
 * - ADMIN
 * - BIBLIOTEKARZ
 * - CZYTELNIK
 */
export type DbRole = "ADMIN" | "BIBLIOTEKARZ" | "CZYTELNIK";

/**
 * Mapowanie ról DB → APP/UI.
 * 
 * Dzięki temu UI nigdy nie operuje na niestandardowych nazwach z bazy.
 */
export function mapRoleFromDb(dbRole: string): UserRole {
  switch (dbRole.toUpperCase()) {
    case "ADMIN":
      return "ADMIN";

    case "BIBLIOTEKARZ":
      return "LIBRARIAN";

    case "CZYTELNIK":
      return "USER";

    default:
      return "USER"; // Fallback bezpieczeństwa
  }
}

/**
 * Walidacja ról UI – do stosowania po stronie serwera.
 */
export function isValidUserRole(role: any): role is UserRole {
  return ["ADMIN", "BIBLIOTEKARZ", "CZYTELNIK"].includes(role);
}
