/**
 * =============================================================================
 * USER MODEL - Klasa domenowa reprezentująca użytkownika
 * =============================================================================
 * 
 * Klasa User enkapsuluje dane i logikę biznesową związaną z użytkownikiem.
 * Stosuje wzorzec Domain Model z OOP, zapewniając:
 * - Walidację danych
 * - Metody pomocnicze
 * - Enkapsulację logiki biznesowej
 * 
 * Zależności:
 * - @/domain/types - typy bazowe (UserRole, UserSession)
 */

import { 
  UserRole, 
  UserSession, 
  ROLE_LABELS, 
  ROLE_ICONS 
} from "@/domain/types";

/**
 * Klasa reprezentująca użytkownika w systemie bibliotecznym.
 * Zapewnia metody do sprawdzania uprawnień i formatowania danych.
 */
export class User implements UserSession {
  /** Unikalny identyfikator użytkownika */
  public readonly id: string;
  
  /** Adres email użytkownika */
  public readonly email: string;
  
  /** Imię użytkownika */
  public readonly firstName: string;
  
  /** Nazwisko użytkownika */
  public readonly lastName: string;
  
  /** Rola użytkownika */
  public readonly role: UserRole;

  /**
   * Konstruktor tworzący instancję User z danych sesji.
   * 
   * @param session - Dane sesji użytkownika (z cookie lub API)
   * @throws Error jeśli dane sesji są nieprawidłowe
   */
  constructor(session: UserSession) {
    // Walidacja wymaganych pól
    if (!session.id || !session.email || !session.firstName || !session.lastName) {
      throw new Error("Nieprawidłowe dane sesji użytkownika");
    }

    this.id = session.id;
    this.email = session.email;
    this.firstName = session.firstName;
    this.lastName = session.lastName;
    this.role = session.role || "USER";
  }

  // ===========================================================================
  // METODY SPRAWDZANIA RÓL I UPRAWNIEŃ
  // ===========================================================================

  /**
   * Sprawdza czy użytkownik jest administratorem.
   * Admin ma pełne uprawnienia w systemie.
   */
  public isAdmin(): boolean {
    return this.role === "ADMIN";
  }

  /**
   * Sprawdza czy użytkownik jest bibliotekarzem.
   * Bibliotekarz może zarządzać wypożyczeniami i książkami.
   */
  public isLibrarian(): boolean {
    return this.role === "LIBRARIAN";
  }

  /**
   * Sprawdza czy użytkownik jest zwykłym czytelnikiem.
   * Czytelnik może przeglądać katalog i wypożyczać książki.
   */
  public isUser(): boolean {
    return this.role === "USER";
  }

  /**
   * Sprawdza czy użytkownik ma uprawnienia pracownika biblioteki.
   * Obejmuje zarówno bibliotekarzy jak i administratorów.
   */
  public isStaff(): boolean {
    return this.isAdmin() || this.isLibrarian();
  }

  /**
   * Sprawdza czy użytkownik może wypożyczać książki.
   * Tylko zwykli użytkownicy (czytelnicy) mogą wypożyczać.
   */
  public canBorrow(): boolean {
    return this.isUser();
  }

  /**
   * Sprawdza czy użytkownik może zarządzać książkami.
   * Uprawnienie dla bibliotekarzy i administratorów.
   */
  public canManageBooks(): boolean {
    return this.isStaff();
  }

  /**
   * Sprawdza czy użytkownik ma dostęp do panelu administracyjnego.
   * Tylko administratorzy mają pełny dostęp.
   */
  public canAccessAdminPanel(): boolean {
    return this.isAdmin();
  }

  // ===========================================================================
  // METODY FORMATOWANIA I WYŚWIETLANIA
  // ===========================================================================

  /**
   * Zwraca pełne imię i nazwisko użytkownika.
   */
  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Zwraca polską nazwę roli użytkownika.
   */
  public getRoleLabel(): string {
    return ROLE_LABELS[this.role];
  }

  /**
   * Zwraca klasę ikony FontAwesome dla roli użytkownika.
   */
  public getRoleIcon(): string {
    return ROLE_ICONS[this.role];
  }

  /**
   * Zwraca sformatowany tekst z imieniem, nazwiskiem i rolą.
   * Używany np. w nagłówku aplikacji.
   */
  public getDisplayText(): string {
    return `${this.getFullName()} — ${this.getRoleLabel()}`;
  }

  // ===========================================================================
  // METODY SERIALIZACJI
  // ===========================================================================

  /**
   * Konwertuje obiekt User do formatu JSON (UserSession).
   * Używane przy zapisywaniu sesji do cookie.
   */
  public toJSON(): UserSession {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
    };
  }

  /**
   * Tworzy instancję User z obiektu JSON.
   * Statyczna metoda fabrykująca.
   * 
   * @param json - Obiekt JSON z danymi użytkownika
   * @returns Nowa instancja User lub null jeśli dane nieprawidłowe
   */
  public static fromJSON(json: unknown): User | null {
    try {
      if (!json || typeof json !== "object") {
        return null;
      }
      return new User(json as UserSession);
    } catch {
      return null;
    }
  }
}
