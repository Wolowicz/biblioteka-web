/**
 * =============================================================================
 * SERVICES - Centralny eksport serwisów API
 * =============================================================================
 * 
 * Ten plik eksportuje wszystkie serwisy API z jednego miejsca.
 * Serwisy implementują wzorzec Singleton i obsługują komunikację z backendem.
 * 
 * Architektura:
 * - ApiService - abstrakcyjna klasa bazowa z logiką HTTP
 * - AuthService - autoryzacja (login, logout, register)
 * - BooksService - operacje na książkach
 * - BorrowingsService - wypożyczenia i rezerwacje
 * 
 * Przykład użycia:
 * import { authService, booksService, borrowingsService } from "@/services";
 * 
 * const result = await authService.login({ email, password });
 * const books = await booksService.getAllAsModels();
 */

// Eksport klas bazowych (dla rozszerzenia)
export { ApiService } from "./ApiService";
export type { ApiResult } from "./ApiService";

// Eksport instancji serwisów (Singleton)
export { authService } from "./AuthService";
export { booksService } from "./BooksService";
export { borrowingsService } from "./BorrowingsService";
