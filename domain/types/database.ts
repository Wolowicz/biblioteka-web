/**
 * =============================================================================
 * DATABASE TYPES - Typy zgodne ze schematem bazy danych biblioteka.sql
 * =============================================================================
 */

// =============================================================================
// ROLE I UŻYTKOWNICY
// =============================================================================

/**
 * Role z tabeli `role`
 */
export type DBRoleName = "ADMIN" | "BIBLIOTEKARZ" | "CZYTELNIK";

/**
 * Tabela: role
 */
export interface DBRole {
  RolaId: number;
  NazwaRoli: DBRoleName;
}

/**
 * Tabela: uzytkownicy
 */
export interface DBUser {
  UzytkownikId: number;
  Email: string;
  HasloHash: string;
  Imie: string;
  Nazwisko: string;
  RolaId: number;
  Aktywny: boolean;
  IsDeleted: boolean;
  DeletedAt: string | null;
  CreatedAt: string;
}

// =============================================================================
// KSIĄŻKI
// =============================================================================

/**
 * Tabela: ksiazki
 */
export interface DBBook {
  KsiazkaId: number;
  numerISBN: string | null;
  Tytul: string;
  Wydawnictwo: string | null;
  Rok: number | null;
  LiczbaEgzemplarzy: number;
  DostepneEgzemplarze: number;
  IsDeleted: boolean;
  DeletedAt: string | null;
  DeletedBy: number | null;
  CreatedAt: string;
}

/**
 * Tabela: autorzy
 */
export interface DBAuthor {
  AutorId: number;
  ImieNazwisko: string;
}

/**
 * Tabela: ksiazkiautorzy (relacja M:N)
 */
export interface DBBookAuthor {
  KsiazkaId: number;
  AutorId: number;
}

/**
 * Status egzemplarza z tabeli egzemplarze
 */
export type DBCopyStatus = "Dostepny" | "Wypozyczony" | "Uszkodzony" | "Zaginiony" | "Zarezerwowany";

/**
 * Tabela: egzemplarze
 */
export interface DBCopy {
  EgzemplarzId: number;
  KsiazkaId: number;
  NumerInwentarzowy: string;
  Status: DBCopyStatus;
  IsDeleted: boolean;
  DeletedAt: string | null;
  DeletedBy: number | null;
  CreatedAt: string;
}

// =============================================================================
// WYPOŻYCZENIA
// =============================================================================

/**
 * Status wypożyczenia z tabeli wypozyczenia
 */
export type DBBorrowingStatus = "Aktywne" | "Zwrocone" | "Zalegle" | "Utracone";

/**
 * Tabela: wypozyczenia
 */
export interface DBBorrowing {
  WypozyczenieId: number;
  UzytkownikId: number;
  EgzemplarzId: number;
  DataWypozyczenia: string;
  TerminZwrotu: string;
  DataZwrotu: string | null;
  Status: DBBorrowingStatus;
  IsDeleted: boolean;
  DeletedAt: string | null;
  DeletedBy: number | null;
  CreatedAt: string;
}

// =============================================================================
// KARY
// =============================================================================

/**
 * Status kary z tabeli kary
 */
export type DBFineStatus = "Naliczona" | "Zaplacona" | "Anulowana";

/**
 * Tabela: kary
 */
export interface DBFine {
  KaraId: number;
  WypozyczenieId: number;
  Kwota: number;
  Opis: string | null;
  Status: DBFineStatus;
  DataNaliczona: string;
  DataRozliczona: string | null;
}

// =============================================================================
// RECENZJE
// =============================================================================

/**
 * Status recenzji z tabeli recenzje
 */
export type DBReviewStatus = "Oczekuje" | "Zatwierdzona" | "Odrzucona";

/**
 * Tabela: recenzje
 */
export interface DBReview {
  RecenzjaId: number;
  KsiazkaId: number;
  UzytkownikId: number;
  Ocena: number; // 1-5
  Tresc: string;
  Status: DBReviewStatus;
  Zgloszona: boolean;
  ZgloszonaPrzez: number | null;
  PowodZgloszenia: string | null;
  ZatwierdzonaPrzez: number | null;
  ZatwierdzonaKiedy: string | null;
  IsDeleted: boolean;
  DeletedAt: string | null;
  DeletedBy: number | null;
  CreatedAt: string;
}

// =============================================================================
// POWIADOMIENIA
// =============================================================================

/**
 * Typ powiadomienia z tabeli powiadomienia
 */
export type DBNotificationType = "Mail" | "SMS" | "InApp";

/**
 * Status powiadomienia z tabeli powiadomienia
 */
export type DBNotificationStatus = "Oczekuje" | "Wyslane" | "Niepowodzenie" | "Przeczytane";

/**
 * Tabela: powiadomienia
 */
export interface DBNotification {
  PowiadomienieId: number;
  UzytkownikId: number;
  Typ: DBNotificationType;
  Status: DBNotificationStatus;
  Temat: string;
  Tresc: string;
  UtworzoneKiedy: string;
  WyslaneKiedy: string | null;
  PrzeczytaneKiedy: string | null;
}

// =============================================================================
// DOKUMENTY
// =============================================================================

/**
 * Typ dokumentu z tabeli dokumenty
 */
export type DBDocumentType = "PotwierdzenieWypozyczenia" | "RozliczenieKary" | "Inne";

/**
 * Tabela: dokumenty
 */
export interface DBDocument {
  DokumentId: number;
  Typ: DBDocumentType;
  WypozyczenieId: number | null;
  KaraId: number | null;
  SciezkaPliku: string | null;
  UtworzonyPrzez: number;
  UtworzonyKiedy: string;
}

// =============================================================================
// LOGI
// =============================================================================

/**
 * Typ logu z tabeli logi
 */
export type DBLogType = "Audyt" | "Logowanie";

/**
 * Tabela: logi
 */
export interface DBLog {
  LogId: number;
  TypCoSieStalo: DBLogType;
  UzytkownikId: number | null;
  Opis: string | null;
  Encja: string | null;
  EncjaId: number | null;
  StanPrzed: string | null; // JSON
  StanPo: string | null; // JSON
  Kiedy: string;
}
