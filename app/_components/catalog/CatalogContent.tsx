/**
 * =============================================================================
 * CATALOG CONTENT - Kontener katalogu książek
 * =============================================================================
 * 
 * Komponent opakowujący ClientFilter z nagłówkiem sekcji.
 * 
 * Funkcjonalności:
 * - Wyświetla nagłówek "Katalog Książek"
 * - Przekazuje dane do ClientFilter
 * - Kontroluje widoczność przycisku rezerwacji
 * 
 * Przepływ danych:
 * - books: lista książek z Server Component
 * - role: rola użytkownika (do stylowania i uprawnień)
 * 
 * Dlaczego osobny komponent:
 * - Separacja logiki prezentacji od filtrowania
 * - Możliwość reużycia nagłówka w innych kontekstach
 * - Czystszy kod w głównym page.tsx
 * 
 * Zależności:
 * - ../ClientFilter - komponent filtrowania
 * - @/domain/types - typy BookViewModel, UserRole
 * 
 * @packageDocumentation
 */

"use client";

import ClientFilter from "../ClientFilter";
import type { BookViewModel, UserRole, CatalogContentProps } from "@/domain/types";

// =============================================================================
// KOMPONENT GŁÓWNY
// =============================================================================

/**
 * Kontener katalogu książek z nagłówkiem.
 * 
 * Wyświetla:
 * - Tytuł sekcji
 * - Opis
 * - Komponent ClientFilter z pełną funkcjonalnością
 * 
 * @param props.books - Lista książek do wyświetlenia
 * @param props.role - Rola użytkownika
 * @returns JSX z nagłówkiem i filtrowaniem książek
 */
export default function CatalogContent({
  books,
  role,
}: CatalogContentProps) {
  // ---------------------------------------------------------------------------
  // LOGIKA
  // ---------------------------------------------------------------------------
  
  /**
   * Przycisk rezerwacji widoczny tylko dla roli USER.
   * ADMIN i LIBRARIAN mają inne opcje zarządzania.
   */
  const showReserveButton = role === "READER";

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  
  return (
    <div className="space-y-8">
      {/* -------------------------------------------------------------- */}
      {/* NAGŁÓWEK SEKCJI */}
      {/* -------------------------------------------------------------- */}
      <h2 className="text-4xl font-black">Katalog Książek</h2>
      <p className="text-gray-600 text-lg">
        Przeglądaj, wyszukuj i odkrywaj nowe tytuły w naszej kolekcji.
      </p>

      {/* -------------------------------------------------------------- */}
      {/* KOMPONENT FILTROWANIA */}
      {/* -------------------------------------------------------------- */}
      <ClientFilter
        books={books}
        showReserveButton={showReserveButton}
        role={role}
      />
    </div>
  );
}
