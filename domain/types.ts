/**
 * =============================================================================
 * DOMAIN TYPES - Typy domenowe aplikacji BiblioteQ
 * =============================================================================
 * 
 * Centralne miejsce dla wszystkich typów używanych w aplikacji.
 * 
 * @packageDocumentation
 */

// =============================================================================
// UŻYTKOWNIK
// =============================================================================

/**
 * Typ roli użytkownika w systemie.
 */
export type UserRole = "ADMIN" | "LIBRARIAN" | "READER";

/**
 * Etykiety ról użytkowników.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  LIBRARIAN: "Bibliotekarz",
  READER: "Czytelnik",
};

/**
 * Ikony ról użytkowników (FontAwesome).
 */
export const ROLE_ICONS: Record<UserRole, string> = {
  ADMIN: "fa-shield-halved",
  LIBRARIAN: "fa-user-tie",
  READER: "fa-user",
};

/**
 * Dane użytkownika zwracane z sesji.
 */
export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

/**
 * Stan autoryzacji w hooku useAuth.
 */
export interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
 * Props dla komponentu AdminPanel.
 */
export interface AdminPanelProps {
  user: UserSession;
}

/**
 * Props dla komponentu AppShell.
 */
export interface AppShellProps {
  user: UserSession | null;
  children: React.ReactNode;
}

// =============================================================================
// KSIĄŻKA
// =============================================================================

/**
 * Dane książki z katalogu.
 */
export interface BookData {
  id: number;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publisher: string;
  publicationYear: number;
  coverUrl?: string;
  description?: string;
  available: number;
  total: number;
}

/**
 * Model widoku książki dla katalogu.
 */
export interface BookViewModel {
  id: number;
  title: string;
  authors: string;
  available: boolean;
  coverUrl?: string;
  averageRating?: number;
  reviewCount?: number;
}

/**
 * Szczegółowe dane książki z API.
 */
export interface BookDetails {
  id: number;
  title: string;
  authors: string;
  isbn: string;
  publisher?: string;
  year?: number;
  description?: string;
  available: boolean;
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string;
  genre?: string;
  category?: string;
  pageCount?: number;
  genres?: Array<{
    id: number;
    name: string;
    icon?: string;
    color?: string;
  }>;
}

/**
 * Props dla komponentu CatalogContent.
 */
export interface CatalogContentProps {
  books: BookViewModel[];
  role: UserRole;
}

/**
 * Props dla komponentu ClientFilter.
 */
export interface ClientFilterProps {
  books: BookViewModel[];
  showReserveButton: boolean;
  role: UserRole;
}

// =============================================================================
// WYPOŻYCZENIE
// =============================================================================

/**
 * Dane wypożyczenia z API.
 */
export interface BorrowingData {
  id: number;
  bookId: number;
  title: string;
  author: string;
  coverUrl: string | null;
  borrowDate: string;
  dueDate: string;
  returnedDate: string | null;
  extensionCount: number;
  fine: number;
}

/**
 * Badge statusu wypożyczenia.
 */
export interface StatusBadge {
  text: string;
  className: string;
  dotClassName: string;
}

/**
 * Props dla komponentu BorrowingsList.
 */
export interface BorrowingsListProps {
  borrowings: BorrowingData[];
}

/**
 * Status wypożyczenia (obliczony).
 */
export type BorrowingStatus = "Wypożyczona" | "Termin wkrótce" | "Po terminie" | "Zwrócona";

/**
 * Badge statusu wypożyczenia z rozszerzonymi stylami.
 */
export interface BorrowingStatusBadge {
  text: BorrowingStatus;
  class: string;
  dot: string;
}

// =============================================================================
// REZERWACJA
// =============================================================================

/**
 * Status rezerwacji w bazie danych.
 */
export type ReservationDBStatus = "ACTIVE" | "CANCELLED" | "FULFILLED" | "EXPIRED";

/**
 * Dane rezerwacji z API.
 */
export interface ReservationData {
  id: number;
  bookId: number;
  title: string;
  author: string;
  coverUrl?: string;
  reservationDate: string;
  expirationDate: string;
  status: ReservationDBStatus;
  position: number;
}

/**
 * Dane rezerwacji wysyłane do API.
 */
export interface ReservationRequest {
  bookId: number;
}

/**
 * Odpowiedź z API po utworzeniu rezerwacji.
 */
export interface ReservationResponse {
  message: string;
  reservationId: number;
}

// =============================================================================
// POWIADOMIENIA
// =============================================================================

/**
 * Typ powiadomienia.
 */
export type NotificationType = 
  | "RESERVATION_READY"
  | "DUE_SOON"
  | "OVERDUE"
  | "SYSTEM"
  | "INFO";

/**
 * Dane powiadomienia.
 */
export interface NotificationData {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  linkUrl?: string;
}

// =============================================================================
// STATYSTYKI ADMINA
// =============================================================================

/**
 * Statystyki dla panelu admina.
 */
export interface AdminStats {
  users: {
    total: number;
    active: number;
    trend: number;
  };
  books: {
    total: number;
    available: number;
    trend: number;
  };
  borrowings: {
    active: number;
    overdue: number;
    trend: number;
  };
  reservations: {
    active: number;
    pending: number;
  };
  recentActivity: ActivityLogEntry[];
}

/**
 * Wpis w logu aktywności.
 */
export interface ActivityLogEntry {
  id: number;
  type: "USER_REGISTERED" | "BOOK_BORROWED" | "BOOK_RETURNED" | "RESERVATION_MADE" | "BOOK_ADDED";
  description: string;
  userName: string;
  timestamp: string;
}

// =============================================================================
// API RESPONSES
// =============================================================================

/**
 * Generyczna odpowiedź API z błędem.
 */
export interface ApiError {
  error: string;
  message?: string;
}

/**
 * Standardowa odpowiedź błędu z API (alias dla ApiError).
 */
export interface ApiErrorResponse {
  error: string;
  details?: string;
}

/**
 * Odpowiedź API z sukcesem.
 */
export interface ApiSuccess<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

// =============================================================================
// PROPS KOMPONENTÓW
// =============================================================================

/**
 * Props dla przycisku rezerwacji.
 */
export interface ReserveButtonProps {
  bookId: number;
  available: boolean;
  hasActive?: boolean;
}

/**
 * Status procesu rezerwacji.
 */
export type ReservationProcessStatus = "idle" | "loading" | "success" | "error";

// Alias dla kompatybilności
export type ReservationStatus = ReservationProcessStatus;

