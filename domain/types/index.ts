/**
 * =============================================================================
 * DOMAIN TYPES - Centralne definicje typów dla całej aplikacji
 * =============================================================================
 * 
 * Ten plik zawiera wszystkie interfejsy i typy TypeScript używane w aplikacji.
 * Dzięki centralizacji typów:
 * - Zapewniamy spójność danych w całej aplikacji
 * - Ułatwiamy refaktoryzację (zmiana w jednym miejscu)
 * - Dokumentujemy strukturę danych
 * - Zapobiegamy błędom typowania
 * 
 * Struktura:
 * 1. Typy użytkownika i autoryzacji
 * 2. Typy książek i katalogu
 * 3. Typy wypożyczeń i rezerwacji
 * 4. Typy odpowiedzi API
 * 5. Typy komponentów UI
 */

// =============================================================================
// 1. TYPY UŻYTKOWNIKA I AUTORYZACJI
// =============================================================================

/**
 * Dozwolone role użytkowników w systemie.
 * - READER (CZYTELNIK) - podstawowy użytkownik biblioteki
 * - LIBRARIAN (BIBLIOTEKARZ) - pracownik z uprawnieniami do zarządzania
 * - ADMIN (ADMINISTRATOR) - pełne uprawnienia systemowe
 */
export type UserRole = "READER" | "LIBRARIAN" | "ADMIN";

/**
 * Sesja użytkownika przechowywana w cookie i używana w całej aplikacji.
 * Zawiera podstawowe informacje o zalogowanym użytkowniku.
 */
export interface UserSession {
  /** Unikalny identyfikator użytkownika (z bazy danych) */
  id: string;
  /** Adres email użytkownika (używany do logowania) */
  email: string;
  /** Imię użytkownika */
  firstName: string;
  /** Nazwisko użytkownika */
  lastName: string;
  /** Rola użytkownika określająca uprawnienia */
  role: UserRole;
}

/**
 * Dane wymagane do logowania użytkownika.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Dane wymagane do rejestracji nowego użytkownika.
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Stan autoryzacji zwracany przez hook useAuth.
 */
export interface AuthState {
  /** Obiekt użytkownika lub null jeśli niezalogowany */
  user: UserSession | null;
  /** Czy użytkownik jest zalogowany */
  isAuthenticated: boolean;
  /** Czy trwa ładowanie danych sesji */
  isLoading: boolean;
}

// =============================================================================
// 2. TYPY KSIĄŻEK I KATALOGU
// =============================================================================

/**
 * Skrócona reprezentacja książki używana w liście katalogu.
 * Zawiera tylko dane potrzebne do wyświetlenia karty książki.
 */
export interface BookViewModel {
  /** Unikalny identyfikator książki */
  id: number;
  /** Tytuł książki */
  title: string;
  /** Lista autorów (połączona przecinkami) */
  authors: string;
  /** Czy książka jest dostępna do wypożyczenia */
  available: boolean;
  /** URL okładki książki (opcjonalny) */
  coverUrl?: string;
  /** Średnia ocena książki */
  averageRating?: number;
  /** Liczba recenzji */
  reviewCount?: number;
}

/**
 * Pełne dane książki zwracane przez API /api/books/[id].
 * Rozszerza BookViewModel o dodatkowe szczegóły.
 */
export interface BookDetails extends BookViewModel {
  /** Numer ISBN książki */
  isbn: string;
  /** Nazwa wydawnictwa */
  publisher?: string;
  /** Rok wydania */
  year?: number;
  /** Opis książki (opcjonalny) */
  description?: string;
  /** Kategoria/gatunek książki */
  category?: string;
  /** Liczba stron */
  pageCount?: number;
  /** Liczba wszystkich egzemplarzy */
  totalCopies?: number;
  /** Liczba dostępnych egzemplarzy */
  availableCopies?: number;
}

/**
 * Opcje filtrowania i sortowania listy książek.
 */
export interface BookFilterOptions {
  /** Fraza wyszukiwania (tytuł, autor, ISBN) */
  searchQuery: string;
  /** Kategoria książek */
  category: string;
  /** Status dostępności */
  status: "Wszystkie" | "Dostępne" | "Niedostępne";
  /** Metoda sortowania */
  sortBy: "Popularność" | "Tytuł A-Z" | "Tytuł Z-A";
}

/**
 * Stan paginacji dla listy książek.
 */
export interface PaginationState {
  /** Aktualna strona (1-indexed) */
  currentPage: number;
  /** Liczba elementów na stronie */
  pageSize: number;
  /** Całkowita liczba stron */
  totalPages: number;
}

// =============================================================================
// 3. TYPY WYPOŻYCZEŃ I REZERWACJI
// =============================================================================

/**
 * Status wypożyczenia określający jego aktualny stan.
 */
export type BorrowingStatus = 
  | "Wypożyczona"      // Aktywne wypożyczenie w terminie
  | "Termin wkrótce"   // Zbliża się termin zwrotu (≤3 dni)
  | "Po terminie"      // Przekroczony termin zwrotu
  | "Zwrócona";        // Książka została zwrócona

/**
 * Dane wypożyczenia zwracane przez API.
 */
export interface BorrowingData {
  /** Unikalny identyfikator wypożyczenia */
  id: number;
  /** ID książki */
  bookId: number;
  /** Tytuł wypożyczonej książki */
  title: string;
  /** Autor książki */
  author: string;
  /** URL okładki (może być null) */
  coverUrl: string | null;
  /** Data wypożyczenia (format ISO) */
  borrowDate: string;
  /** Termin zwrotu (format ISO) */
  dueDate: string;
  /** Data zwrotu (null jeśli nie zwrócono) */
  returnedDate: string | null;
  /** Liczba przedłużeń */
  extensionCount: number;
  /** Kwota kary (0 jeśli brak) */
  fine: number;
}

/**
 * Badge statusu wypożyczenia do wyświetlenia w UI.
 */
export interface BorrowingStatusBadge {
  /** Tekst statusu */
  text: BorrowingStatus;
  /** Klasy CSS dla badge'a */
  class: string;
  /** Klasy CSS dla kropki statusu */
  dot: string;
}

/**
 * Uniwersalny badge statusu (używany w BorrowingsList).
 * Bardziej elastyczny niż BorrowingStatusBadge.
 */
export interface StatusBadge {
  /** Tekst wyświetlany w badge */
  text: string;
  /** Klasy CSS dla kontenera badge */
  className: string;
  /** Klasy CSS dla kropki wskaźnika */
  dotClassName: string;
}

/**
 * Dane rezerwacji wysyłane do API.
 */
export interface ReservationRequest {
  /** ID książki do zarezerwowania */
  bookId: number;
}

/**
 * Stan procesu rezerwacji.
 */
export type ReservationStatus = "idle" | "loading" | "success" | "error";

// =============================================================================
// 4. TYPY ODPOWIEDZI API
// =============================================================================

/**
 * Standardowa odpowiedź błędu z API.
 */
export interface ApiErrorResponse {
  /** Komunikat błędu */
  error: string;
  /** Szczegóły błędu (opcjonalne) */
  details?: string;
}

/**
 * Odpowiedź z API po udanym logowaniu.
 */
export interface LoginResponse extends UserSession {}

/**
 * Odpowiedź z API po udanej rejestracji.
 */
export interface RegisterResponse {
  message: string;
  userId: number;
}

/**
 * Odpowiedź z API po utworzeniu rezerwacji.
 */
export interface ReservationResponse {
  message: string;
  reservationId: number;
}

/**
 * Dane logu systemowego z API admin.
 */
export interface SystemLogEntry {
  id: number;
  type: string;
  userFirstName: string;
  userLastName: string;
  description: string;
  entity: string;
  entityId: number;
  timestamp: string;
}

// =============================================================================
// 5. TYPY KOMPONENTÓW UI
// =============================================================================

/**
 * Props dla komponentu AppShell (główny layout aplikacji).
 */
export interface AppShellProps {
  /** Dane zalogowanego użytkownika */
  user: UserSession;
  /** Zawartość strony */
  children: React.ReactNode;
}

/**
 * Props dla komponentu ClientFilter (filtrowanie książek).
 */
export interface ClientFilterProps {
  /** Lista książek do wyświetlenia */
  books: BookViewModel[];
  /** Czy pokazać przycisk rezerwacji (tylko dla USER) */
  showReserveButton: boolean;
  /** Rola aktualnego użytkownika */
  role: UserRole;
}

/**
 * Props dla komponentu ReserveButton.
 */
export interface ReserveButtonProps {
  /** ID książki */
  bookId: number;
  /** Czy książka jest dostępna */
  available: boolean;
  /** Czy użytkownik ma już aktywną rezerwację (opcjonalne) */
  hasActive?: boolean;
}

/**
 * Props dla komponentu BorrowingsList.
 */
export interface BorrowingsListProps {
  /** Lista wypożyczeń do wyświetlenia */
  borrowings: BorrowingData[];
}

/**
 * Props dla komponentu CatalogContent.
 */
export interface CatalogContentProps {
  /** Lista książek */
  books: BookViewModel[];
  /** Rola użytkownika */
  role: UserRole;
}

/**
 * Props dla komponentu AdminPanel.
 */
export interface AdminPanelProps {
  /** Dane użytkownika (admina) */
  user: UserSession;
}

// =============================================================================
// 6. TYPY POMOCNICZE
// =============================================================================

/**
 * Mapowanie roli na klucz motywu.
 */
export type ThemeKey = "admin" | "librarian" | "user";

/**
 * Mapowanie UserRole na ThemeKey.
 */
export const roleToThemeKey: Record<UserRole, ThemeKey> = {
  ADMIN: "admin",
  LIBRARIAN: "librarian",
  READER: "user",
};

/**
 * Etykiety ról w języku polskim.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  LIBRARIAN: "Bibliotekarz",
  READER: "Czytelnik",
};

/**
 * Ikony FontAwesome dla każdej roli.
 */
export const ROLE_ICONS: Record<UserRole, string> = {
  ADMIN: "fas fa-user-shield",
  LIBRARIAN: "fas fa-book",
  READER: "fas fa-user",
};
