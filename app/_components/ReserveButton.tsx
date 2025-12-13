/**
 * =============================================================================
 * RESERVE BUTTON - Przycisk rezerwacji książki
 * =============================================================================
 * 
 * Komponent przycisku do rezerwowania książek przez zalogowanych użytkowników.
 * Obsługuje różne stany (ładowanie, sukces, błąd) i waliduje możliwość rezerwacji.
 * 
 * Warunki rezerwacji:
 * - Użytkownik musi być zalogowany
 * - Książka musi być dostępna (available = true)
 * - Użytkownik nie może mieć już tej książki (hasActive = false)
 * 
 * Przepływ rezerwacji:
 * 1. Kliknięcie przycisku
 * 2. Walidacja warunków
 * 3. Wysłanie żądania POST do /api/reservations
 * 4. Aktualizacja stanu (sukces/błąd)
 * 
 * Jest to Client Component ze względu na:
 * - Interaktywność (kliknięcie, stany)
 * - Użycie useState i useAuth
 * - Żądania fetch
 * 
 * Zależności:
 * - @/lib/auth - hook useAuth do sprawdzenia autoryzacji
 * - @/domain/types - typy ReserveButtonProps, ReservationStatus
 */

"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/index";
import { borrowingsService } from "@/services";
import type { ReserveButtonProps, ReservationStatus } from "@/domain/types";

// =============================================================================
// KOMPONENT
// =============================================================================

/**
 * Przycisk rezerwacji książki.
 * 
 * Wyświetla odpowiedni tekst i styl w zależności od stanu:
 * - Ładowanie sesji → "Ładowanie..."
 * - Niezalogowany → "Zaloguj się"
 * - Niedostępna → "Niedostępna"
 * - Już zarezerwowana → "Zarezerwowano"
 * - W trakcie → "Rezerwuję..."
 * - Sukces → "Zarezerwowano!"
 * - Domyślnie → "Rezerwuj"
 * 
 * @param props.bookId - ID książki do zarezerwowania
 * @param props.available - Czy książka jest dostępna
 * @param props.hasActive - Czy użytkownik ma już aktywną rezerwację (opcjonalne)
 * @returns JSX przycisku rezerwacji
 * 
 * @example
 * ```tsx
 * <ReserveButton 
 *   bookId={123} 
 *   available={true} 
 *   hasActive={false}
 * />
 * ```
 */
export default function ReserveButton({
  bookId,
  available,
  hasActive = false,
}: ReserveButtonProps) {
  // ---------------------------------------------------------------------------
  // HOOKS
  // ---------------------------------------------------------------------------
  
  /** Dane autoryzacji użytkownika */
  const { user, isAuthenticated, isLoading } = useAuth();

  /** Status procesu rezerwacji */
  const [status, setStatus] = useState<ReservationStatus>("idle");

  // ---------------------------------------------------------------------------
  // OBSŁUGA ŁADOWANIA SESJI
  // ---------------------------------------------------------------------------
  
  // Wyświetl przycisk ładowania podczas sprawdzania sesji
  if (isLoading) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-400 text-white"
        aria-busy="true"
      >
        Ładowanie...
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // WARUNKI BLOKADY
  // ---------------------------------------------------------------------------
  
  /** Czy użytkownik ma już wypożyczoną/zarezerwowaną tę książkę */
  const alreadyBorrowed = hasActive === true;

  // ---------------------------------------------------------------------------
  // HANDLER KLIKNIĘCIA
  // ---------------------------------------------------------------------------
  
  /**
   * Obsługuje kliknięcie przycisku rezerwacji.
   * 
   * Waliduje warunki i wysyła żądanie do API.
   * W przypadku błędu resetuje stan po 3 sekundach.
   */
  const handleClick = async (): Promise<void> => {
    // Sprawdź warunki rezerwacji
    if (
      !isAuthenticated ||
      !user ||
      !available ||
      alreadyBorrowed ||
      status === "loading"
    ) {
      return;
    }

    // Ustaw stan ładowania
    setStatus("loading");

    try {
      // Wyślij żądanie rezerwacji przez serwis
      const result = await borrowingsService.createReservation(bookId);

      // Sprawdź odpowiedź
      if (!result.success) {
        throw new Error(result.error || "Błąd rezerwacji");
      }

      // Sukces!
      setStatus("success");
    } catch (error) {
      // Błąd - pokaż na 3 sekundy
      console.error("Błąd rezerwacji:", error);
      setStatus("error");
      
      // Reset po 3 sekundach
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  // ---------------------------------------------------------------------------
  // OKREŚLENIE TEKSTU PRZYCISKU
  // ---------------------------------------------------------------------------
  
  /**
   * Tekst wyświetlany na przycisku w zależności od stanu.
   */
  let buttonText = "Rezerwuj";

  if (alreadyBorrowed) {
    buttonText = "Zarezerwowano";
  } else if (!isAuthenticated) {
    buttonText = "Zaloguj się";
  } else if (!available) {
    buttonText = "Niedostępna";
  } else if (status === "loading") {
    buttonText = "Rezerwuję...";
  } else if (status === "success") {
    buttonText = "Zarezerwowano!";
  }

  // ---------------------------------------------------------------------------
  // OKREŚLENIE STANU DISABLED
  // ---------------------------------------------------------------------------
  
  /**
   * Czy przycisk powinien być zablokowany.
   */
  const disabled =
    alreadyBorrowed ||
    !available ||
    status === "loading" ||
    status === "success" ||
    !isAuthenticated;

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-busy={status === "loading"}
      className={`
        px-4 py-2 rounded-xl text-sm font-semibold transition
        ${disabled
          ? "bg-gray-400 cursor-not-allowed text-white"
          : "bg-blue-600 hover:bg-blue-500 text-white"
        }
      `}
    >
      {buttonText}
    </button>
  );
}
