/**
 * =============================================================================
 * AUDIT LOGGER - System audytu i logowania zmian
 * =============================================================================
 * 
 * Funkcje pomocnicze do zapisywania historii zmian w bazie danych.
 * Wszystkie ważne operacje (CRUD) powinny być logowane z pełnym kontekstem:
 * - Kto wykonał akcję (userId)
 * - Co zostało zrobione (action)
 * - Na jakiej encji (entity, entityId)
 * - Stan przed zmianą (JSON)
 * - Stan po zmianie (JSON)
 * 
 * @packageDocumentation
 */

import pool from "@/lib/db";
import { ResultSetHeader } from "mysql2";

/**
 * Typy akcji audytowych
 */
export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "SOFT_DELETE"
  | "RESTORE"
  | "LOGIN"
  | "LOGOUT"
  | "BORROW"
  | "RETURN"
  | "EXTEND"
  | "SETTLE_FINE"
  | "APPROVE_REVIEW"
  | "REJECT_REVIEW"
  | "ADD_FAVORITE"
  | "REMOVE_FAVORITE";

/**
 * Typy encji w systemie
 */
export type AuditEntity =
  | "Uzytkownicy"
  | "Ksiazki"
  | "Egzemplarze"
  | "Wypozyczenia"
  | "Kary"
  | "Recenzje"
  | "Ulubione"
  | "Gatunki"
  | "Autorzy"
  | "System";

/**
 * Interfejs parametrów logowania
 */
export interface LogAuditParams {
  /** ID użytkownika wykonującego akcję */
  userId: number | string;
  /** Typ akcji */
  action: AuditAction;
  /** Typ encji */
  entity: AuditEntity;
  /** ID encji (opcjonalne, np. dla logowania systemowego) */
  entityId?: number | string;
  /** Stan przed zmianą (opcjonalny, dla UPDATE/DELETE) */
  before?: any;
  /** Stan po zmianie (opcjonalny, dla CREATE/UPDATE) */
  after?: any;
  /** Dodatkowy opis (opcjonalny) */
  description?: string;
}

/**
 * Główna funkcja logowania akcji audytowych.
 * 
 * Zapisuje wpis do tabeli `logi` z pełnym kontekstem operacji.
 * Automatycznie serializuje obiekty before/after do JSON.
 * 
 * @param params - Parametry logu
 * @returns Promise z ID nowego logu lub null w przypadku błędu
 * 
 * @example
 * ```ts
 * // Logowanie usunięcia książki
 * await logAudit({
 *   userId: 1,
 *   action: "SOFT_DELETE",
 *   entity: "Ksiazki",
 *   entityId: 42,
 *   before: { Tytul: "Pan Tadeusz", IsDeleted: 0 },
 *   after: { Tytul: "Pan Tadeusz", IsDeleted: 1, DeletedAt: "2025-01-09", DeletedBy: 1 },
 *   description: "Usunięto książkę z katalogu"
 * });
 * 
 * // Logowanie logowania
 * await logAudit({
 *   userId: 5,
 *   action: "LOGIN",
 *   entity: "System",
 *   description: "Użytkownik zalogował się do systemu"
 * });
 * ```
 */
export async function logAudit(params: LogAuditParams): Promise<number | null> {
  const {
    userId,
    action,
    entity,
    entityId = null,
    before = null,
    after = null,
    description = "",
  } = params;

  try {
    // Serializuj obiekty do JSON
    const stanPrzed = before ? JSON.stringify(before) : null;
    const stanPo = after ? JSON.stringify(after) : null;

    // Wstaw wpis do tabeli logi
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO logi 
       (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId, StanPrzed, StanPo, Kiedy)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        action, // TypCoSieStalo
        userId, // UzytkownikId
        description || `${action} na ${entity}`, // Opis
        entity, // Encja
        entityId, // EncjaId
        stanPrzed, // StanPrzed (JSON)
        stanPo, // StanPo (JSON)
      ]
    );

    return result.insertId;
  } catch (error) {
    // Logowanie nie powinno przerywać głównego procesu
    console.error("AUDIT LOG ERROR:", error);
    console.error("Failed to log:", { userId, action, entity, entityId });
    return null;
  }
}

/**
 * Pomocnicza funkcja do logowania tworzenia encji.
 * 
 * @param userId - ID użytkownika
 * @param entity - Typ encji
 * @param entityId - ID nowej encji
 * @param data - Dane nowej encji
 * @param description - Opcjonalny opis
 */
export async function logCreate(
  userId: number | string,
  entity: AuditEntity,
  entityId: number | string,
  data: any,
  description?: string
): Promise<number | null> {
  return logAudit({
    userId,
    action: "CREATE",
    entity,
    entityId,
    after: data,
    description: description || `Utworzono ${entity} #${entityId}`,
  });
}

/**
 * Pomocnicza funkcja do logowania aktualizacji encji.
 * 
 * @param userId - ID użytkownika
 * @param entity - Typ encji
 * @param entityId - ID encji
 * @param before - Stan przed zmianą
 * @param after - Stan po zmianie
 * @param description - Opcjonalny opis
 */
export async function logUpdate(
  userId: number | string,
  entity: AuditEntity,
  entityId: number | string,
  before: any,
  after: any,
  description?: string
): Promise<number | null> {
  return logAudit({
    userId,
    action: "UPDATE",
    entity,
    entityId,
    before,
    after,
    description: description || `Zaktualizowano ${entity} #${entityId}`,
  });
}

/**
 * Pomocnicza funkcja do logowania soft delete.
 * 
 * @param userId - ID użytkownika
 * @param entity - Typ encji
 * @param entityId - ID encji
 * @param before - Stan przed usunięciem
 * @param description - Opcjonalny opis
 */
export async function logSoftDelete(
  userId: number | string,
  entity: AuditEntity,
  entityId: number | string,
  before: any,
  description?: string
): Promise<number | null> {
  const after = { ...before, IsDeleted: 1, DeletedAt: new Date().toISOString(), DeletedBy: userId };
  
  return logAudit({
    userId,
    action: "SOFT_DELETE",
    entity,
    entityId,
    before,
    after,
    description: description || `Usunięto ${entity} #${entityId} (soft delete)`,
  });
}

/**
 * Pomocnicza funkcja do logowania przywrócenia usuniętej encji.
 * 
 * @param userId - ID użytkownika
 * @param entity - Typ encji
 * @param entityId - ID encji
 * @param before - Stan przed przywróceniem
 * @param description - Opcjonalny opis
 */
export async function logRestore(
  userId: number | string,
  entity: AuditEntity,
  entityId: number | string,
  before: any,
  description?: string
): Promise<number | null> {
  const after = { ...before, IsDeleted: 0, DeletedAt: null, DeletedBy: null };
  
  return logAudit({
    userId,
    action: "RESTORE",
    entity,
    entityId,
    before,
    after,
    description: description || `Przywrócono ${entity} #${entityId}`,
  });
}
