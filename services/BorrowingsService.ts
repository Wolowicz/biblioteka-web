/**
 * =============================================================================
 * BORROWINGS SERVICE - Serwis do obsługi wypożyczeń
 * =============================================================================
 * 
 * Klasa BorrowingsService obsługuje operacje związane z wypożyczeniami:
 * - Pobieranie listy wypożyczeń użytkownika
 * - Tworzenie rezerwacji
 * - Przedłużanie wypożyczeń (do implementacji)
 * 
 * Zależności:
 * - ApiService - klasa bazowa z logiką HTTP
 * - @/domain/types - typy wypożyczeń
 * - @/domain/models - klasa Borrowing
 * 
 * Wzorzec: Singleton - jedna instancja dla całej aplikacji
 */

import { ApiService, ApiResult } from "./ApiService";
import { 
  BorrowingData, 
  ReservationRequest, 
  ReservationResponse 
} from "@/domain/types";
import { Borrowing } from "@/domain/models";

/**
 * Serwis do obsługi operacji na wypożyczeniach.
 * Komunikuje się z endpointami /api/borrowings/* i /api/reservations/*.
 */
class BorrowingsService extends ApiService {
  constructor() {
    super("/api/borrowings");
  }

  // ===========================================================================
  // POBIERANIE WYPOŻYCZEŃ
  // ===========================================================================

  /**
   * Pobiera listę wypożyczeń aktualnie zalogowanego użytkownika.
   * 
   * @returns Lista wypożyczeń lub błąd
   * 
   * Wymaga:
   * - Zalogowanego użytkownika (cookie sesji)
   * 
   * Uwagi:
   * - Automatycznie nalicza kary za spóźnienia (po stronie API)
   * - Zwraca wypożyczenia posortowane od najnowszych
   */
  public async getMyBorrowings(): Promise<ApiResult<BorrowingData[]>> {
    return this.get<BorrowingData[]>();
  }

  /**
   * Pobiera wypożyczenia i konwertuje do obiektów Borrowing.
   * 
   * @returns Tablica obiektów klasy Borrowing
   */
  public async getMyBorrowingsAsModels(): Promise<Borrowing[]> {
    const result = await this.getMyBorrowings();
    
    if (!result.success) {
      console.error("Błąd pobierania wypożyczeń:", result.error);
      return [];
    }

    return Borrowing.fromAPIList(result.data);
  }

  /**
   * Filtruje wypożyczenia według statusu (aktualne vs historia).
   * 
   * @param borrowings - Lista wypożyczeń
   * @param showActive - true = aktualne, false = historia
   * @returns Przefiltrowana lista
   */
  public filterByActive(
    borrowings: Borrowing[],
    showActive: boolean
  ): Borrowing[] {
    return borrowings.filter((b) =>
      showActive ? !b.isReturned() : b.isReturned()
    );
  }

  // ===========================================================================
  // REZERWACJE
  // ===========================================================================

  /**
   * Tworzy nową rezerwację książki.
   * 
   * @param bookId - ID książki do zarezerwowania
   * @returns Potwierdzenie rezerwacji lub błąd
   * 
   * Wymaga:
   * - Zalogowanego użytkownika
   * - Dostępnego egzemplarza książki
   * 
   * Walidacja po stronie API:
   * - Użytkownik nie może mieć już tej książki wypożyczonej
   * - Musi istnieć wolny egzemplarz
   */
  public async createReservation(
    bookId: number
  ): Promise<ApiResult<ReservationResponse>> {
    // Rezerwacje mają osobny endpoint
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ bookId } as ReservationRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Błąd rezerwacji",
        status: response.status,
      };
    }

    return {
      success: true,
      data: data as ReservationResponse,
    };
  }

  // ===========================================================================
  // PRZEDŁUŻANIE (DO IMPLEMENTACJI)
  // ===========================================================================

  /**
   * Przedłuża wypożyczenie o standardowy okres.
   * 
   * @param borrowingId - ID wypożyczenia
   * @returns Sukces lub błąd
   * 
   * TODO: Implementacja po stronie API
   */
  public async extendBorrowing(
    borrowingId: number
  ): Promise<ApiResult<{ newDueDate: string }>> {
    // Placeholder - endpoint do zaimplementowania
    console.warn("Przedłużanie wypożyczeń nie jest jeszcze zaimplementowane");
    
    return {
      success: false,
      error: "Funkcja niedostępna",
    };
  }

  // ===========================================================================
  // POMOCNICZE
  // ===========================================================================

  /**
   * Sprawdza czy użytkownik ma aktywne wypożyczenie danej książki.
   * 
   * @param borrowings - Lista wypożyczeń użytkownika
   * @param bookId - ID książki
   * @returns true jeśli książka jest aktualnie wypożyczona
   */
  public hasActiveBookBorrowing(
    borrowings: Borrowing[],
    bookId: number
  ): boolean {
    // Uwaga: Wymaga dodania bookId do BorrowingData
    // Na razie zwracamy false jako placeholder
    return false;
  }

  /**
   * Oblicza sumę niezapłaconych kar.
   * 
   * @param borrowings - Lista wypożyczeń
   * @returns Suma kar w PLN
   */
  public calculateTotalFines(borrowings: Borrowing[]): number {
    return borrowings.reduce((sum, b) => sum + b.fine, 0);
  }

  /**
   * Pobiera wypożyczenia z przekroczonym terminem.
   * 
   * @param borrowings - Lista wypożyczeń
   * @returns Wypożyczenia po terminie
   */
  public getOverdueBorrowings(borrowings: Borrowing[]): Borrowing[] {
    return borrowings.filter((b) => b.isOverdue());
  }
}

/**
 * Singleton instance serwisu wypożyczeń.
 * Użycie: import { borrowingsService } from "@/services";
 */
export const borrowingsService = new BorrowingsService();
