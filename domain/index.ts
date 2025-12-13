/**
 * =============================================================================
 * DOMAIN - Centralny eksport całej warstwy domenowej
 * =============================================================================
 * 
 * Ten plik eksportuje wszystkie typy i modele z warstwy domenowej.
 * Stanowi główny punkt wejścia do logiki biznesowej aplikacji.
 * 
 * Struktura warstwy domenowej:
 * - types/ - definicje typów i interfejsów TypeScript
 * - models/ - klasy domenowe (OOP) z logiką biznesową
 * 
 * Przykład użycia:
 * import { User, Book, UserRole, BookViewModel } from "@/domain";
 */

// Eksport wszystkich typów
export * from "./types";

// Eksport wszystkich modeli
export * from "./models";
