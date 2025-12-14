/**
 * =============================================================================
 * BOOK MODEL - Klasa domenowa reprezentująca książkę
 * =============================================================================
 * 
 * Klasa Book enkapsuluje dane i logikę biznesową związaną z książką.
 * Zapewnia metody do sprawdzania dostępności i formatowania danych.
 * 
 * Zależności:
 * - @/domain/types - typy bazowe (BookViewModel, BookDetails)
 */

import { BookViewModel, BookDetails } from "@/domain/types";

/**
 * Klasa reprezentująca książkę w systemie bibliotecznym.
 * Może być tworzona z danych skróconych (lista) lub pełnych (szczegóły).
 */
export class Book implements BookViewModel {
  /** Unikalny identyfikator książki */
  public readonly id: number;
  
  /** Tytuł książki */
  public readonly title: string;
  
  /** Autorzy (połączeni przecinkami) */
  public readonly authors: string;
  
  /** Czy książka jest dostępna do wypożyczenia */
  public readonly available: boolean;
  
  /** URL okładki (opcjonalny) */
  public readonly coverUrl?: string;

  // Pola opcjonalne - dostępne tylko dla pełnych danych książki
  /** Numer ISBN */
  public readonly isbn?: string;
  
  /** Wydawnictwo */
  public readonly publisher?: string;
  
  /** Rok wydania */
  public readonly year?: number;
  
  /** Opis książki */
  public readonly description?: string;
  
  /** Kategoria */
  public readonly category?: string;
  
  /** Liczba stron */
  public readonly pageCount?: number;

  /**
   * Konstruktor tworzący instancję Book.
   * Akceptuje zarówno dane skrócone jak i pełne.
   * 
   * @param data - Dane książki (BookViewModel lub BookDetails)
   */
  constructor(data: BookViewModel | BookDetails) {
    // Wymagane pola
    this.id = data.id;
    this.title = data.title;
    this.authors = data.authors;
    this.available = Boolean(data.available);
    this.coverUrl = data.coverUrl;

    // Opcjonalne pola (tylko dla BookDetails)
    if (this.isDetailedData(data)) {
      this.isbn = data.isbn;
      this.publisher = data.publisher;
      this.year = data.year;
      this.description = data.description;
      this.category = data.category;
      this.pageCount = data.pageCount;
    }
  }

  /**
   * Type guard sprawdzający czy dane zawierają pełne szczegóły książki.
   */
  private isDetailedData(data: BookViewModel | BookDetails): data is BookDetails {
    return "isbn" in data;
  }

  // ===========================================================================
  // METODY SPRAWDZANIA STANU
  // ===========================================================================

  /**
   * Sprawdza czy książka jest dostępna do wypożyczenia.
   */
  public isAvailable(): boolean {
    return this.available;
  }

  /**
   * Sprawdza czy książka jest niedostępna (wszystkie egzemplarze wypożyczone).
   */
  public isUnavailable(): boolean {
    return !this.available;
  }

  /**
   * Sprawdza czy książka ma pełne dane szczegółowe.
   */
  public hasDetails(): boolean {
    return this.isbn !== undefined;
  }

  /**
   * Sprawdza czy książka ma zdefiniowaną okładkę.
   */
  public hasCover(): boolean {
    return !!this.coverUrl;
  }

  // ===========================================================================
  // METODY FORMATOWANIA
  // ===========================================================================

  /**
   * Zwraca URL okładki lub domyślny obrazek.
   */
  public getCoverUrl(): string {
    return this.coverUrl || "/biblio.png";
  }

  /**
   * Zwraca tekst statusu dostępności w języku polskim.
   */
  public getAvailabilityText(): string {
    return this.available ? "Dostępna" : "Niedostępna";
  }

  /**
   * Zwraca opis dostępności (dłuższy tekst).
   */
  public getAvailabilityDescription(): string {
    return this.available
      ? "Możesz ją wypożyczyć od zaraz!"
      : "Aktualnie brak egzemplarzy";
  }

  /**
   * Zwraca klasy CSS dla badge'a statusu.
   */
  public getStatusBadgeClasses(): string {
    return this.available
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  }

  /**
   * Zwraca listę autorów jako tablicę.
   */
  public getAuthorsArray(): string[] {
    return this.authors.split(",").map((a) => a.trim());
  }

  /**
   * Zwraca pierwszego autora.
   */
  public getPrimaryAuthor(): string {
    return this.getAuthorsArray()[0] || "Nieznany autor";
  }

  /**
   * Zwraca rok wydania sformatowany lub "Brak danych".
   */
  public getFormattedYear(): string {
    return this.year ? String(this.year) : "Brak danych";
  }

  // ===========================================================================
  // METODY SERIALIZACJI
  // ===========================================================================

  /**
   * Konwertuje do formatu BookViewModel.
   */
  public toViewModel(): BookViewModel {
    return {
      id: this.id,
      title: this.title,
      authors: this.authors,
      available: this.available,
      coverUrl: this.coverUrl,
    };
  }

  /**
   * Konwertuje do formatu BookDetails (jeśli dane dostępne).
   */
  public toDetails(): BookDetails | null {
    if (!this.hasDetails()) {
      return null;
    }

    return {
      id: this.id,
      title: this.title,
      authors: this.authors,
      available: this.available,
      coverUrl: this.coverUrl,
      isbn: this.isbn!,
      publisher: this.publisher ?? "",
      year: this.year ?? 0,
      description: this.description,
      category: this.category,
      pageCount: this.pageCount,
      totalCopies: 1,
      availableCopies: this.available ? 1 : 0,
    };
  }

  /**
   * Tworzy instancję Book z danych API.
   * Statyczna metoda fabrykująca.
   */
  public static fromAPI(data: BookViewModel | BookDetails): Book {
    return new Book(data);
  }

  /**
   * Tworzy tablicę obiektów Book z listy danych API.
   */
  public static fromAPIList(dataList: BookViewModel[]): Book[] {
    return dataList.map((data) => Book.fromAPI(data));
  }
}
