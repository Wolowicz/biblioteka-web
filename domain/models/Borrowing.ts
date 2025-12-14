/**
 * =============================================================================
 * BORROWING MODEL - Klasa domenowa reprezentująca wypożyczenie
 * =============================================================================
 * 
 * Klasa Borrowing enkapsuluje dane i logikę biznesową związaną z wypożyczeniem.
 * Zawiera metody do obliczania statusu, terminów i kar.
 * 
 * Zależności:
 * - @/domain/types - typy bazowe (BorrowingData, BorrowingStatus, BorrowingStatusBadge)
 */

import { 
  BorrowingData, 
  BorrowingStatus, 
  BorrowingStatusBadge 
} from "@/domain/types";

/**
 * Klasa reprezentująca wypożyczenie w systemie bibliotecznym.
 * Automatycznie oblicza status na podstawie dat.
 */
export class Borrowing implements BorrowingData {
  /** Unikalny identyfikator wypożyczenia */
  public readonly id: number;
  
  /** ID książki */
  public readonly bookId: number;
  
  /** Tytuł książki */
  public readonly title: string;
  
  /** Autor książki */
  public readonly author: string;
  
  /** URL okładki */
  public readonly coverUrl: string | null;
  
  /** Data wypożyczenia */
  public readonly borrowDate: string;
  
  /** Termin zwrotu */
  public readonly dueDate: string;
  
  /** Data faktycznego zwrotu */
  public readonly returnedDate: string | null;
  
  /** Liczba przedłużeń */
  public readonly extensionCount: number;
  
  /** Kwota kary */
  public readonly fine: number;

  // Obliczone wartości
  private readonly _borrowDateObj: Date;
  private readonly _dueDateObj: Date;
  private readonly _returnedDateObj: Date | null;

  /**
   * Konstruktor tworzący instancję Borrowing.
   * 
   * @param data - Dane wypożyczenia z API
   */
  constructor(data: BorrowingData) {
    this.id = data.id;
    this.bookId = data.bookId;
    this.title = data.title;
    this.author = data.author;
    this.coverUrl = data.coverUrl;
    this.borrowDate = data.borrowDate;
    this.dueDate = data.dueDate;
    this.returnedDate = data.returnedDate;
    this.extensionCount = data.extensionCount || 0;
    this.fine = data.fine || 0;

    // Konwersja dat do obiektów Date dla łatwiejszych obliczeń
    this._borrowDateObj = new Date(data.borrowDate);
    this._dueDateObj = new Date(data.dueDate);
    this._returnedDateObj = data.returnedDate ? new Date(data.returnedDate) : null;
  }

  // ===========================================================================
  // METODY SPRAWDZANIA STANU
  // ===========================================================================

  /**
   * Sprawdza czy książka została zwrócona.
   */
  public isReturned(): boolean {
    return this.returnedDate !== null;
  }

  /**
   * Sprawdza czy termin zwrotu został przekroczony.
   */
  public isOverdue(): boolean {
    if (this.isReturned()) return false;
    return new Date() > this._dueDateObj;
  }

  /**
   * Sprawdza czy termin zwrotu jest bliski (≤3 dni).
   */
  public isDueSoon(): boolean {
    if (this.isReturned() || this.isOverdue()) return false;
    
    const now = new Date();
    const daysLeft = this.getDaysUntilDue();
    
    return daysLeft >= 0 && daysLeft <= 3;
  }

  /**
   * Sprawdza czy wypożyczenie jest aktywne i w terminie.
   */
  public isActive(): boolean {
    return !this.isReturned() && !this.isOverdue() && !this.isDueSoon();
  }

  /**
   * Sprawdza czy istnieje kara do zapłaty.
   */
  public hasFine(): boolean {
    return this.fine > 0;
  }

  // ===========================================================================
  // METODY OBLICZENIOWE
  // ===========================================================================

  /**
   * Oblicza liczbę dni do terminu zwrotu.
   * Wartość ujemna oznacza przekroczenie terminu.
   */
  public getDaysUntilDue(): number {
    const now = new Date();
    const diffMs = this._dueDateObj.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Oblicza liczbę dni spóźnienia.
   * Zwraca 0 jeśli nie ma spóźnienia.
   */
  public getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    return Math.abs(this.getDaysUntilDue());
  }

  /**
   * Zwraca aktualny status wypożyczenia.
   */
  public getStatus(): BorrowingStatus {
    if (this.isReturned()) return "Zwrócona";
    if (this.isOverdue()) return "Po terminie";
    if (this.isDueSoon()) return "Termin wkrótce";
    return "Wypożyczona";
  }

  /**
   * Zwraca obiekt badge'a statusu dla UI.
   */
  public getStatusBadge(): BorrowingStatusBadge {
    const status = this.getStatus();

    switch (status) {
      case "Zwrócona":
        return {
          text: status,
          class: "bg-gray-100 text-gray-700",
          dot: "bg-gray-700",
        };
      case "Po terminie":
        return {
          text: status,
          class: "bg-red-100 text-red-700",
          dot: "bg-red-700",
        };
      case "Termin wkrótce":
        return {
          text: status,
          class: "bg-yellow-100 text-yellow-700",
          dot: "bg-yellow-700",
        };
      default:
        return {
          text: status,
          class: "bg-green-100 text-green-700",
          dot: "bg-green-700",
        };
    }
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
   * Formatuje datę do czytelnego formatu polskiego.
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  /**
   * Zwraca sformatowaną datę wypożyczenia.
   */
  public getFormattedBorrowDate(): string {
    return this.formatDate(this._borrowDateObj);
  }

  /**
   * Zwraca sformatowany termin zwrotu.
   */
  public getFormattedDueDate(): string {
    return this.formatDate(this._dueDateObj);
  }

  /**
   * Zwraca sformatowaną datę zwrotu lub null.
   */
  public getFormattedReturnedDate(): string | null {
    if (!this._returnedDateObj) return null;
    return this.formatDate(this._returnedDateObj);
  }

  /**
   * Zwraca sformatowaną kwotę kary.
   */
  public getFormattedFine(): string {
    return `${this.fine} zł`;
  }

  // ===========================================================================
  // METODY SERIALIZACJI
  // ===========================================================================

  /**
   * Konwertuje do formatu BorrowingData.
   */
  public toData(): BorrowingData {
    return {
      id: this.id,
      bookId: this.bookId,
      title: this.title,
      author: this.author,
      coverUrl: this.coverUrl,
      borrowDate: this.borrowDate,
      dueDate: this.dueDate,
      returnedDate: this.returnedDate,
      extensionCount: this.extensionCount,
      fine: this.fine,
    };
  }

  /**
   * Tworzy instancję Borrowing z danych API.
   */
  public static fromAPI(data: BorrowingData): Borrowing {
    return new Borrowing(data);
  }

  /**
   * Tworzy tablicę obiektów Borrowing z listy danych API.
   */
  public static fromAPIList(dataList: BorrowingData[]): Borrowing[] {
    return dataList.map((data) => Borrowing.fromAPI(data));
  }
}
