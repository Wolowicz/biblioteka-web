# 📚 CONTEXT.md - BiblioteQ Library Management System

> **Cel dokumentu:** Szczegółowy kontekst projektu systemu bibliotecznego do wykorzystania w dalszym programowaniu i promptowaniu LLM w celu dodawania nowych funkcji.

---

## 📋 Spis Treści

1. [Przegląd Projektu](#-przegląd-projektu)
2. [Stack Technologiczny](#-stack-technologiczny)
3. [Architektura Systemu](#-architektura-systemu)
4. [Role i Uprawnienia](#-role-i-uprawnienia)
5. [Scenariusze Użycia](#-scenariusze-użycia)
6. [Schemat Bazy Danych](#-schemat-bazy-danych)
7. [API Endpoints](#-api-endpoints)
8. [Komponenty UI](#-komponenty-ui)
9. [Przepływ Danych](#-przepływ-danych)
10. [Wzorce i Konwencje](#-wzorce-i-konwencje)
11. [Planowane Funkcjonalności](#-planowane-funkcjonalności)
12. [Wskazówki dla LLM](#-wskazówki-dla-llm)

---

## 🎯 Przegląd Projektu

### Nazwa Projektu
**BiblioteQ** - Nowoczesny System Zarządzania Biblioteką

### Opis
BiblioteQ to pełnofunkcyjny system zarządzania biblioteką oparty na Next.js 16, umożliwiający:
- Katalogowanie i wyszukiwanie książek
- Zarządzanie wypożyczeniami i zwrotami
- System rezerwacji i ulubionych
- Recenzje i oceny książek
- Automatyczne naliczanie kar za przetrzymania
- Panel administracyjny ze statystykami
- System powiadomień

### Główne Funkcje
| Funkcja | Opis | Status |
|---------|------|--------|
| Katalog książek | Przeglądanie, wyszukiwanie, filtrowanie | ✅ Zaimplementowane |
| Wypożyczenia | Tworzenie, przedłużanie, zwroty | ✅ Zaimplementowane |
| Rezerwacje | Rezerwowanie niedostępnych książek | ✅ Zaimplementowane |
| Ulubione | Zapisywanie ulubionych pozycji | ✅ Zaimplementowane |
| Recenzje | Oceny 1-5 gwiazdek + komentarze | ✅ Zaimplementowane |
| Kary | Automatyczne naliczanie za przetrzymania | ✅ Zaimplementowane |
| Panel Admina | Statystyki, zarządzanie | ✅ Zaimplementowane |
| E-booki | Cyfrowe wersje książek | ⚠️ Schema gotowy, brak UI |
| Dark Mode dla admina | Ciemny motyw | ❌ Planowane |
| Grey Mode dla bibliotekarza | Ciemny motyw | ❌ Planowane |
| PWA | Progressive Web App | ❌ Planowane |
| Panel bibliiotekarza | Statystyki, zarządzanie | ❌ Planowane |

---

## 🛠 Stack Technologiczny

### Frontend
```
Next.js 16.0.1          - Framework React z App Router
React 19.2.0            - Biblioteka UI
TypeScript 5.x          - Statyczne typowanie
Tailwind CSS 4.0        - Stylowanie utility-first
Font Awesome 6.x        - Ikony
```

### Backend
```
Next.js API Routes      - Serverless endpoints
MySQL/MariaDB 10.4+     - Relacyjna baza danych
mysql2 3.15.3           - Klient MySQL z Promise API
bcrypt 6.0.0            - Hashowanie haseł
```

### Narzędzia Dev
```
Turbopack              - Fast bundler (dev mode)
ESLint 9               - Linting
Console Ninja          - Debugging
```

### Struktura Folderów
```
web/
├── app/                          # Next.js App Router
│   ├── _components/              # Komponenty współdzielone
│   │   ├── catalog/              # Komponenty katalogu
│   │   └── ui/                   # Reużywalne elementy UI
│   ├── admin/                    # Panel administratora
│   ├── librarian/                # Panel bibliotekarza
│   ├── profile/                  # Profil użytkownika
│   ├── books/[id]/               # Szczegóły książki
│   ├── borrowings/               # Wypożyczenia użytkownika
│   ├── fines/                    # Kary użytkownika
│   ├── reviews/                  # Recenzje użytkownika
│   ├── welcome/                  # Logowanie/Rejestracja
│   └── api/                      # API Routes
│       ├── auth/                 # Autoryzacja
│       ├── books/                # CRUD książek
│       ├── borrowings/           # Wypożyczenia
│       ├── favorites/            # Ulubione
│       ├── reviews/              # Recenzje
│       ├── reservations/         # Rezerwacje
│       ├── fines/                # Kary
│       ├── notifications/        # Powiadomienia
│       ├── genres/               # Gatunki
│       ├── admin/                # Endpointy admina
│       └── profile/              # Profil
├── domain/                       # Logika domenowa
│   ├── models/                   # Klasy OOP (Book, User, Borrowing)
│   ├── types/                    # Typy bazodanowe
│   └── types.ts                  # Główne interfejsy TypeScript
├── lib/                          # Utilities
│   ├── auth/                     # Autoryzacja (client + server)
│   ├── db.ts                     # Pool połączeń MySQL
│   └── ui/                       # Theme config
├── services/                     # Serwisy API (frontend)
│   ├── ApiService.ts             # Bazowy serwis HTTP
│   ├── BooksService.ts           # Operacje na książkach
│   ├── BorrowingsService.ts      # Operacje na wypożyczeniach
│   └── AuthService.ts            # Operacje autoryzacji
├── migrations/                   # Migracje SQL
└── biblioteka14.12v2.sql         # Pełny schemat bazy
```

---

## 🏗 Architektura Systemu

### Wzorzec Architektoniczny
```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 19)                         │
├─────────────────────────────────────────────────────────────────────┤
│   Server Components (SSR)     │     Client Components (CSR)         │
│   - Strona główna             │     - ClientFilter (filtry)         │
│   - Szczegóły książki         │     - FavoriteButton               │
│   - Panel admina              │     - ReviewForm                    │
│   - Wypożyczenia              │     - Modal, Toast                  │
├─────────────────────────────────────────────────────────────────────┤
│                         API ROUTES (Serverless)                      │
│   /api/auth/*   /api/books/*   /api/borrowings/*   /api/admin/*     │
├─────────────────────────────────────────────────────────────────────┤
│                    WARSTWA DANYCH (mysql2/promise)                   │
│                         Connection Pool                              │
├─────────────────────────────────────────────────────────────────────┤
│                    MySQL/MariaDB 10.4+ (biblioteka)                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Separacja Odpowiedzialności

#### Server Components (SSR)
- `app/page.tsx` - Strona główna z katalogiem
- `app/books/[id]/page.tsx` - Szczegóły książki
- `app/admin/page.tsx` - Panel admina
- `app/borrowings/page.tsx` - Lista wypożyczeń
- **Korzyści:** Szybkie FCP, SEO, bezpośredni dostęp do bazy

#### Client Components (CSR)
- `ClientFilter.tsx` - Filtrowanie katalogu
- `FavoriteButton.tsx` - Optimistic updates dla ulubionych
- `ReviewForm.tsx` - Formularz recenzji
- `Modal.tsx`, `Toast.tsx` - Interaktywne UI
- **Korzyści:** Interaktywność, stan lokalny, animacje

### Przepływ Autoryzacji

```
1. Użytkownik loguje się POST /api/auth/login
       ↓
2. Serwer waliduje hasło (bcrypt.compare)
       ↓
3. Serwer ustawia cookie "userSession" (JSON z danymi użytkownika)
   - httpOnly: true
   - secure: true (produkcja)
   - sameSite: "lax"
   - maxAge: 7 dni
       ↓
4. SSR: getUserSessionSSR() odczytuje cookie przy każdym renderze
       ↓
5. API: sprawdza cookie przy każdym żądaniu chronionym
```

---

## 👥 Role i Uprawnienia

### System RBAC (Role-Based Access Control)

| Rola | Kod DB | Opis |
|------|--------|------|
| Administrator | `RolaId=1`, `ADMIN` | Pełne uprawnienia |
| Bibliotekarz | `RolaId=2`, `BIBLIOTEKARZ` | Obsługa wypożyczeń |
| Czytelnik | `RolaId=3`, `CZYTELNIK` | Podstawowe operacje |

### Matryca Uprawnień

| Operacja | READER | LIBRARIAN | ADMIN |
|----------|:------:|:---------:|:-----:|
| Przeglądanie katalogu | ✅ | ✅ | ✅ |
| Wyszukiwanie książek | ✅ | ✅ | ✅ |
| Dodawanie do ulubionych | ✅ | ❌ | ❌ |
| Pisanie recenzji | ✅ | ✅ | ✅ |
| Rezerwowanie książek | ✅ | ✅ | ✅ |
| Podgląd własnych wypożyczeń | ✅ | ❌ | ❌ |
| Przedłużanie wypożyczeń | ✅ | ✅ | ✅ |
| Podgląd własnych kar | ✅ | ❌ | ❌ |
| **Obsługa wszystkich wypożyczeń** | ❌ | ✅ | ✅ |
| **Tworzenie wypożyczeń dla innych** | ❌ | ✅ | ✅ |
| **Przyjmowanie zwrotów** | ❌ | ✅ | ✅ |
| **Zarządzanie karami** | ❌ | ✅ | ✅ |
| **Dodawanie książek** | ❌ | ✅ | ✅ |
| **Zarządzanie użytkownikami** | ❌ | ❌ | ✅ |
| **Panel statystyk** | ❌ | ✅ | ✅ |
| **Logi systemowe** | ❌ | ❌ | ✅ |
| **Zarządzanie gatunkami** | ❌ | ✅ | ✅ |
| **Usuwanie książek (soft delete)** | ❌ | ✅ | ✅ |

---

## 📖 Scenariusze Użycia

### UC-01: Rejestracja Nowego Użytkownika
```
Aktor: Gość (niezalogowany)
Cel: Utworzenie konta w systemie

Przepływ:
1. Użytkownik wchodzi na /welcome
2. Wybiera zakładkę "Rejestracja"
3. Wypełnia formularz:
   - Imię, Nazwisko
   - Email
   - Hasło (min. 8 znaków, wielka/mała litera, cyfra, znak specjalny)
4. Klika "Zarejestruj się"
5. POST /api/auth/register:
   - Walidacja danych
   - Sprawdzenie czy email nie istnieje
   - Hashowanie hasła (bcrypt, 10 rounds)
   - INSERT do tabeli Uzytkownicy (RolaId=3 - Czytelnik)
   - Log do tabeli Logi
6. Przekierowanie na stronę logowania

Warunki końcowe:
- Użytkownik może się zalogować
- Domyślna rola: CZYTELNIK
```

### UC-02: Logowanie do Systemu
```
Aktor: Zarejestrowany użytkownik
Cel: Uzyskanie dostępu do systemu

Przepływ:
1. Użytkownik wchodzi na /welcome
2. Wprowadza email i hasło
3. POST /api/auth/login:
   - Wyszukanie użytkownika po email
   - Porównanie hasła (bcrypt.compare)
   - Ustawienie cookie sesji (JSON z id, email, role, firstName, lastName)
   - Log do tabeli Logi (TypCoSieStalo='Logowanie')
4. Przekierowanie na stronę główną (katalog)

Alternatywne przepływy:
- Błędne hasło → komunikat "Nieprawidłowe dane logowania"
- Użytkownik nieaktywny (Aktywny=0) → komunikat "Konto zablokowane"
```

### UC-03: Przeglądanie i Wyszukiwanie Książek
```
Aktor: Zalogowany użytkownik (dowolna rola)
Cel: Znalezienie interesującej książki

Przepływ:
1. Użytkownik widzi katalog na stronie głównej (/)
2. Katalog ładowany SSR (GET /api/books)
3. Filtrowanie (client-side, ClientFilter.tsx):
   - Wyszukiwanie po tytule/autorze
   - Filtr "Tylko dostępne"
   - Sortowanie (A-Z, Z-A)
4. Kliknięcie na kartę książki → /books/{id}
5. Szczegóły książki (SSR):
   - Tytuł, autor, ISBN, wydawnictwo, rok
   - Gatunki (badges z ikonami)
   - Dostępność (X z Y egzemplarzy)
   - Średnia ocen + liczba recenzji
   - Lista recenzji (zatwierdzone)
   - Przyciski akcji (Zarezerwuj, Dodaj do ulubionych)

Dane wyświetlane:
- Okładka (placeholder jeśli brak)
- Status dostępności (badge zielony/czerwony)
- Gatunki z ikonami Font Awesome
- Średnia ocen (gwiazdki)
```

### UC-04: Wypożyczenie Książki (przez Bibliotekarza)
```
Aktor: Bibliotekarz / Admin
Cel: Wydanie książki czytelnikowi

Przepływ:
1. Bibliotekarz wchodzi na /librarian
2. Klika "Nowe wypożyczenie"
3. Modal z formularzem:
   - Wyszukuje czytelnika (email/nazwisko)
   - Wyszukuje książkę (tytuł)
   - Ustawia datę zwrotu (domyślnie +30 dni)
4. POST /api/borrowings/create:
   - Sprawdzenie czy użytkownik nie ma już tej książki
   - Wyszukanie wolnego egzemplarza
   - BEGIN TRANSACTION:
     * INSERT do Wypozyczenia (Status='Aktywne')
     * UPDATE Egzemplarze SET Status='Wypozyczony'
     * UPDATE Ksiazki SET DostepneEgzemplarze = DostepneEgzemplarze - 1
   - COMMIT
5. Potwierdzenie (Toast)

Warunki wstępne:
- Książka ma dostępny egzemplarz
- Użytkownik nie ma już wypożyczonego egzemplarza tej książki
```

### UC-05: Rezerwacja Książki (przez Czytelnika)
```
Aktor: Czytelnik
Cel: Zarezerwowanie dostępnej książki

Przepływ:
1. Czytelnik na stronie szczegółów książki (/books/{id})
2. Książka jest dostępna (available > 0)
3. Klika przycisk "Zarezerwuj"
4. POST /api/reservations:
   - Sprawdzenie sesji użytkownika
   - Sprawdzenie czy nie ma już aktywnego wypożyczenia
   - Wyszukanie wolnego egzemplarza
   - BEGIN TRANSACTION:
     * INSERT do Wypozyczenia (Status='Aktywne', TerminZwrotu=+30dni)
     * UPDATE Egzemplarze SET Status='Wypozyczony'
   - COMMIT
5. Przekierowanie do /borrowings

Uwaga: W obecnej implementacji "rezerwacja" = natychmiastowe wypożyczenie
(brak kolejki rezerwacji dla niedostępnych książek)
```

### UC-06: Przedłużenie Wypożyczenia
```
Aktor: Czytelnik
Cel: Przedłużenie terminu zwrotu

Przepływ:
1. Czytelnik wchodzi na /borrowings lub /profile?tab=borrowings
2. Lista aktywnych wypożyczeń
3. Klika "Przedłuż" przy wybranym wypożyczeniu
4. POST /api/borrowings/{id}/extend:
   - Sprawdzenie czy IloscPrzedluzen < 2
   - Sprawdzenie czy nie ma kary
   - UPDATE Wypozyczenia:
     * TerminZwrotu = TerminZwrotu + 14 dni
     * IloscPrzedluzen = IloscPrzedluzen + 1
5. Odświeżenie listy

Ograniczenia:
- Maksymalnie 2 przedłużenia
- Nie można przedłużyć po terminie (gdy jest kara)
```

### UC-07: Zwrot Książki
```
Aktor: Bibliotekarz / Admin
Cel: Przyjęcie zwrotu od czytelnika

Przepływ:
1. Bibliotekarz wchodzi na /librarian
2. Widzi listę aktywnych wypożyczeń
3. Filtruje (wszystkie / aktywne / przetrzymane)
4. Klika "Zwróć" przy wybranym wypożyczeniu
5. Potwierdzenie (confirm dialog)
6. POST /api/borrowings/{id}/return:
   - BEGIN TRANSACTION:
     * UPDATE Wypozyczenia:
       - DataZwrotu = NOW()
       - Status = 'Zwrocone'
     * UPDATE Egzemplarze SET Status='Dostepny'
     * UPDATE Ksiazki SET DostepneEgzemplarze = DostepneEgzemplarze + 1
   - COMMIT
7. Toast "Książka zwrócona"

Uwaga: Czytelnik NIE może sam zwrócić książki - tylko bibliotekarz
```

### UC-08: Automatyczne Naliczanie Kar
```
Aktor: System (automatycznie)
Cel: Naliczenie kary za przetrzymanie

Przepływ (przy GET /api/borrowings):
1. Użytkownik wchodzi na listę swoich wypożyczeń
2. System iteruje przez wszystkie wypożyczenia:
   FOR EACH wypożyczenie WHERE DataZwrotu IS NULL:
     IF NOW() > TerminZwrotu:
       IF NOT EXISTS kara dla tego wypożyczenia:
         - Oblicz dni spóźnienia
         - Kwota = dni * 2 PLN (stawka dzienna)
         - INSERT INTO Kary (Kwota, Status='Naliczona', Opis='Przekroczono termin zwrotu')
3. Zwrócenie listy z aktualnymi karami

Stawka: 2 PLN za każdy dzień spóźnienia
```

### UC-09: Dodawanie Recenzji
```
Aktor: Czytelnik (wypożyczał książkę)
Cel: Wystawienie oceny i komentarza

Przepływ:
1. Czytelnik na stronie szczegółów książki
2. Widzi formularz recenzji (jeśli wypożyczał)
3. Wybiera ocenę (1-5 gwiazdek)
4. Pisze treść recenzji
5. POST /api/reviews:
   - Sprawdzenie sesji
   - Sprawdzenie czy użytkownik nie ma już recenzji tej książki
   - INSERT INTO Recenzje (Ocena, Tresc, Status='Oczekuje')
   - Log do tabeli Logi
6. Toast "Recenzja dodana, oczekuje na zatwierdzenie"

Status recenzji:
- Oczekuje - nowa, czeka na moderację
- Zatwierdzona - widoczna publicznie
- Odrzucona - ukryta
```

### UC-10: Dodawanie do Ulubionych (Optimistic Update)
```
Aktor: Zalogowany użytkownik
Cel: Zapisanie książki na liście ulubionych

Przepływ:
1. Użytkownik klika przycisk serca przy książce
2. FavoriteButton.tsx:
   - Natychmiast zmienia stan (optimistic update)
   - Animacja serca
3. POST /api/favorites (w tle):
   - INSERT INTO Ulubione (UzytkownikId, KsiazkaId)
4. Jeśli błąd → rollback UI
5. Lista ulubionych w /profile?tab=favorites

Zachowanie:
- Natychmiastowa reakcja UI (bez oczekiwania na serwer)
- Rollback przy błędzie
- Toggle: klik gdy jest ulubione → DELETE
```

### UC-11: Panel Administratora
```
Aktor: Administrator
Cel: Podgląd statystyk i zarządzanie systemem

Przepływ:
1. Admin wchodzi na /admin
2. GET /api/admin/stats:
   - Liczba użytkowników (total, aktywni)
   - Liczba książek (total, dostępne)
   - Wypożyczenia (aktywne, przetrzymane)
   - Ostatnia aktywność (logi)
3. Dashboard z kartami:
   - Statystyki liczbowe z trendami
   - Ostatnie akcje w systemie
   - Przyciski szybkich akcji
4. Nawigacja do podstron:
   - /admin/users - zarządzanie użytkownikami
   - /admin/books - zarządzanie książkami
   - /admin/logs - logi systemowe

Funkcje:
- Dodawanie użytkowników z wyborem roli
- Dodawanie książek z egzemplarzami
- Soft delete (IsDeleted=1)
```

---

## 🗄 Schemat Bazy Danych

### Diagram ERD (Uproszczony)

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   UZYTKOWNICY   │       │    WYPOZYCZENIA  │       │   EGZEMPLARZE   │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ UzytkownikId PK │───┐   │ WypozyczenieId   │   ┌───│ EgzemplarzId PK │
│ Email           │   │   │ UzytkownikId FK  │───┘   │ KsiazkaId FK    │
│ HasloHash       │   └──▶│ EgzemplarzId FK  │───────│ NumerInwentarzo │
│ Imie            │       │ DataWypozyczenia │       │ Status          │
│ Nazwisko        │       │ TerminZwrotu     │       │ IsDeleted       │
│ RolaId FK       │       │ DataZwrotu       │       └────────┬────────┘
│ Aktywny         │       │ Status           │                │
│ IsDeleted       │       │ IloscPrzedluzen  │                │
└────────┬────────┘       └────────┬─────────┘                │
         │                         │                          │
         │         ┌───────────────┘                          │
         │         │                                          │
         │    ┌────▼─────┐                          ┌─────────▼────────┐
         │    │   KARY   │                          │     KSIAZKI      │
         │    ├──────────┤                          ├──────────────────┤
         │    │ KaraId   │                          │ KsiazkaId PK     │
         │    │ Wypozycz │                          │ numerISBN        │
         │    │ Kwota    │                          │ Tytul            │
         │    │ Status   │                          │ Wydawnictwo      │
         │    └──────────┘                          │ Rok              │
         │                                          │ LiczbaEgz        │
         │    ┌──────────────────┐                  │ DostepneEgz      │
         │    │    RECENZJE      │                  │ IsDeleted        │
         │    ├──────────────────┤                  └────────┬─────────┘
         └───▶│ UzytkownikId FK  │                           │
              │ KsiazkaId FK     │───────────────────────────┘
              │ Ocena            │
              │ Tresc            │
              │ Status           │
              │ Zgloszona        │
              └──────────────────┘
         
         ┌──────────────────┐         ┌──────────────────┐
         │    ULUBIONE      │         │    GATUNKI       │
         ├──────────────────┤         ├──────────────────┤
         │ UzytkownikId FK  │         │ GatunekId PK     │
         │ KsiazkaId FK     │         │ Nazwa            │
         │ CreatedAt        │         │ Ikona            │
         └──────────────────┘         │ Kolor            │
                                      └──────────────────┘
                                               │
                                      ┌────────▼─────────┐
                                      │ KSIAZKI_GATUNKI  │
                                      ├──────────────────┤
                                      │ KsiazkaId FK     │
                                      │ GatunekId FK     │
                                      └──────────────────┘
```

### Tabele Główne

#### `uzytkownicy` - Użytkownicy
```sql
CREATE TABLE `uzytkownicy` (
  `UzytkownikId` int(11) NOT NULL AUTO_INCREMENT,
  `Email` varchar(255) NOT NULL UNIQUE,
  `HasloHash` varchar(255) NOT NULL,
  `Imie` varchar(100) NOT NULL,
  `Nazwisko` varchar(100) NOT NULL,
  `RolaId` int(11) NOT NULL,           -- FK do role
  `Aktywny` tinyint(1) DEFAULT 1,
  `IsDeleted` tinyint(1) DEFAULT 0,
  `ResetToken` varchar(255) DEFAULT NULL,
  `ResetTokenExpiry` datetime DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UzytkownikId`)
);
```

#### `role` - Role użytkowników
```sql
CREATE TABLE `role` (
  `RolaId` int(11) NOT NULL,
  `NazwaRoli` varchar(50) NOT NULL UNIQUE,
  PRIMARY KEY (`RolaId`)
);
-- Dane: 1=ADMIN, 2=BIBLIOTEKARZ, 3=CZYTELNIK
```

#### `ksiazki` - Książki
```sql
CREATE TABLE `ksiazki` (
  `KsiazkaId` int(11) NOT NULL AUTO_INCREMENT,
  `numerISBN` varchar(20) UNIQUE,
  `Tytul` varchar(300) NOT NULL,
  `Wydawnictwo` varchar(200),
  `Rok` int(11),
  `LiczbaEgzemplarzy` int(11) DEFAULT 0,
  `DostepneEgzemplarze` int(11) DEFAULT 0,
  `IsDeleted` tinyint(1) DEFAULT 0,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`KsiazkaId`)
);
```

#### `egzemplarze` - Fizyczne egzemplarze
```sql
CREATE TABLE `egzemplarze` (
  `EgzemplarzId` int(11) NOT NULL AUTO_INCREMENT,
  `KsiazkaId` int(11) NOT NULL,
  `NumerInwentarzowy` varchar(50) NOT NULL UNIQUE,
  `Status` enum('Dostepny','Wypozyczony','Uszkodzony','Zaginiony','Zarezerwowany') DEFAULT 'Dostepny',
  `IsDeleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`EgzemplarzId`),
  FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki`(`KsiazkaId`)
);
```

#### `wypozyczenia` - Wypożyczenia
```sql
CREATE TABLE `wypozyczenia` (
  `WypozyczenieId` int(11) NOT NULL AUTO_INCREMENT,
  `UzytkownikId` int(11) NOT NULL,
  `EgzemplarzId` int(11) NOT NULL,
  `DataWypozyczenia` date NOT NULL,
  `TerminZwrotu` date NOT NULL,
  `DataZwrotu` date DEFAULT NULL,
  `Status` enum('Aktywne','Zwrocone','Zalegle','Utracone') DEFAULT 'Aktywne',
  `IloscPrzedluzen` int(11) DEFAULT 0,
  `IsDeleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`WypozyczenieId`),
  FOREIGN KEY (`UzytkownikId`) REFERENCES `uzytkownicy`(`UzytkownikId`),
  FOREIGN KEY (`EgzemplarzId`) REFERENCES `egzemplarze`(`EgzemplarzId`)
);
```

#### `kary` - Kary za przetrzymania
```sql
CREATE TABLE `kary` (
  `KaraId` int(11) NOT NULL AUTO_INCREMENT,
  `WypozyczenieId` int(11) NOT NULL,
  `Kwota` decimal(10,2) NOT NULL,
  `Opis` varchar(255),
  `Status` enum('Naliczona','Zaplacona','Anulowana') DEFAULT 'Naliczona',
  `DataNaliczona` datetime DEFAULT CURRENT_TIMESTAMP,
  `DataRozliczona` datetime DEFAULT NULL,
  PRIMARY KEY (`KaraId`),
  FOREIGN KEY (`WypozyczenieId`) REFERENCES `wypozyczenia`(`WypozyczenieId`)
);
-- Stawka: 2 PLN za dzień spóźnienia
```

#### `recenzje` - Recenzje książek
```sql
CREATE TABLE `recenzje` (
  `RecenzjaId` int(11) NOT NULL AUTO_INCREMENT,
  `KsiazkaId` int(11) NOT NULL,
  `UzytkownikId` int(11) NOT NULL,
  `Ocena` tinyint(4) NOT NULL,          -- 1-5
  `Tresc` text NOT NULL,
  `Status` enum('Oczekuje','Zatwierdzona','Odrzucona') DEFAULT 'Oczekuje',
  `Zgloszona` tinyint(1) DEFAULT 0,
  `ZgloszonaPrzez` int(11) DEFAULT NULL,
  `PowodZgloszenia` varchar(255) DEFAULT NULL,
  `IsDeleted` tinyint(1) DEFAULT 0,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RecenzjaId`),
  UNIQUE KEY (`KsiazkaId`, `UzytkownikId`), -- 1 recenzja per user/book
  FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki`(`KsiazkaId`),
  FOREIGN KEY (`UzytkownikId`) REFERENCES `uzytkownicy`(`UzytkownikId`)
);
```

#### `ulubione` - Ulubione książki
```sql
CREATE TABLE `ulubione` (
  `UlubioneId` int(11) NOT NULL AUTO_INCREMENT,
  `UzytkownikId` int(11) NOT NULL,
  `KsiazkaId` int(11) NOT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UlubioneId`),
  UNIQUE KEY (`UzytkownikId`, `KsiazkaId`),
  FOREIGN KEY (`UzytkownikId`) REFERENCES `uzytkownicy`(`UzytkownikId`),
  FOREIGN KEY (`KsiazkaId`) REFERENCES `ksiazki`(`KsiazkaId`)
);
```

#### `gatunki` - Kategorie książek
```sql
CREATE TABLE `gatunki` (
  `GatunekId` int(11) NOT NULL AUTO_INCREMENT,
  `Nazwa` varchar(100) NOT NULL UNIQUE,
  `Ikona` varchar(50) DEFAULT 'fas fa-book',     -- Font Awesome class
  `Kolor` varchar(50) DEFAULT 'from-indigo-500 to-purple-600', -- Tailwind gradient
  `IsDeleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`GatunekId`)
);
-- Przykłady: Fantastyka (fa-dragon), Kryminał (fa-user-secret), Romans (fa-heart)
```

#### `logi` - Historia akcji
```sql
CREATE TABLE `logi` (
  `LogId` int(11) NOT NULL AUTO_INCREMENT,
  `TypCoSieStalo` enum('Audyt','Logowanie') NOT NULL,
  `UzytkownikId` int(11) DEFAULT NULL,
  `Opis` varchar(255),
  `Encja` varchar(100) DEFAULT NULL,     -- Nazwa tabeli
  `EncjaId` bigint(20) DEFAULT NULL,     -- ID rekordu
  `StanPrzed` JSON DEFAULT NULL,         -- Snapshot przed zmianą
  `StanPo` JSON DEFAULT NULL,            -- Snapshot po zmianie
  `Kiedy` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LogId`)
);
```

### Soft Delete
Wszystkie główne tabele używają wzorca **Soft Delete**:
- Kolumna `IsDeleted` (tinyint, default 0)
- Kolumna `DeletedAt` (datetime, nullable)
- Kolumna `DeletedBy` (int, FK do użytkownika)
- Wszystkie zapytania mają `WHERE IsDeleted = 0`

---

## 📡 API Endpoints

### Autoryzacja (`/api/auth/*`)

| Metoda | Endpoint | Opis | Rola |
|--------|----------|------|------|
| POST | `/api/auth/register` | Rejestracja | Publiczny |
| POST | `/api/auth/login` | Logowanie | Publiczny |
| POST | `/api/auth/logout` | Wylogowanie | Zalogowany |
| GET | `/api/auth/session` | Sprawdzenie sesji | Zalogowany |
| POST | `/api/auth/forgot-password` | Reset hasła (email) | Publiczny |
| POST | `/api/auth/reset-password` | Nowe hasło (token) | Publiczny |

### Książki (`/api/books/*`)

| Metoda | Endpoint | Opis | Rola |
|--------|----------|------|------|
| GET | `/api/books` | Lista wszystkich książek | Zalogowany |
| GET | `/api/books?available=true` | Tylko dostępne | Zalogowany |
| GET | `/api/books/{id}` | Szczegóły książki | Zalogowany |
| POST | `/api/books` | Dodaj książkę | LIBRARIAN+ |
| PUT | `/api/books/{id}` | Edytuj książkę | ADMIN |
| DELETE | `/api/books/{id}` | Soft delete | ADMIN |
| POST | `/api/books/{id}/stock` | Dodaj egzemplarze | ADMIN |

### Wypożyczenia (`/api/borrowings/*`)

| Metoda | Endpoint | Opis | Rola |
|--------|----------|------|------|
| GET | `/api/borrowings` | Moje wypożyczenia | Zalogowany |
| GET | `/api/borrowings?all=true` | Wszystkie wypożyczenia | LIBRARIAN+ |
| GET | `/api/borrowings?status=ACTIVE` | Filtr po statusie | Zalogowany |
| POST | `/api/borrowings/create` | Nowe wypożyczenie | LIBRARIAN+ |
| POST | `/api/borrowings/{id}/extend` | Przedłuż | Zalogowany |
| POST | `/api/borrowings/{id}/return` | Zwrot | LIBRARIAN+ |
| GET | `/api/borrowings/check?bookId=X` | Czy mam tę książkę | Zalogowany |

### Ulubione (`/api/favorites`)

| Metoda | Endpoint | Opis | Rola |
|--------|----------|------|------|
| GET | `/api/favorites` | Lista moich ulubionych | Zalogowany |
| POST | `/api/favorites` | Dodaj do ulubionych | Zalogowany |
| DELETE | `/api/favorites?bookId=X` | Usuń z ulubionych | Zalogowany |

### Recenzje (`/api/reviews/*`)

| Metoda | Endpoint | Opis | Rola |
|--------|----------|------|------|
| GET | `/api/reviews?bookId=X` | Recenzje książki (zatwierdzone) | Zalogowany |
| GET | `/api/reviews?my=true` | Moje recenzje | Zalogowany |
| GET | `/api/reviews?all=true` | Wszystkie (moderacja) | LIBRARIAN+ |
| POST | `/api/reviews` | Dodaj recenzję | Zalogowany |
| PUT | `/api/reviews/{id}` | Edytuj recenzję | Właściciel |
| DELETE | `/api/reviews/{id}` | Usuń recenzję | Właściciel/ADMIN |
| POST | `/api/reviews/{id}/report` | Zgłoś recenzję | Zalogowany |

### Rezerwacje (`/api/reservations`)

| Metoda | Endpoint | Opis | Rola |
|--------|----------|------|------|
| POST | `/api/reservations` | Zarezerwuj książkę | Zalogowany |

*Uwaga: Obecnie rezerwacja = natychmiastowe wypożyczenie*

### Kary (`/api/fines/*`)

| Metoda | Endpoint | Opis | Rola |
|--------|----------|------|------|
| GET | `/api/fines` | Moje kary | Zalogowany |
| GET | `/api/fines?status=UNPAID` | Nieopłacone | Zalogowany |
| PUT | `/api/fines/{id}` | Oznacz jako opłaconą | LIBRARIAN+ |

### Gatunki (`/api/genres`)

| Metoda | Endpoint | Opis | Rola |
|--------|----------|------|------|
| GET | `/api/genres` | Lista gatunków | Zalogowany |
| POST | `/api/genres` | Dodaj gatunek | ADMIN |

### Powiadomienia (`/api/notifications`)

| Metoda | Endpoint | Opis | Rola |
|--------|----------|------|------|
| GET | `/api/notifications` | Moje powiadomienia | Zalogowany |
| POST | `/api/notifications` | Wyślij powiadomienie | LIBRARIAN+ |
| PUT | `/api/notifications` | Oznacz jako przeczytane | Zalogowany |

### Admin (`/api/admin/*`)

| Metoda | Endpoint | Opis | Rola |
|--------|----------|------|------|
| GET | `/api/admin/stats` | Statystyki systemu | ADMIN |
| GET | `/api/admin/users` | Lista użytkowników | ADMIN |
| PUT | `/api/admin/users/{id}` | Edytuj użytkownika | ADMIN |
| GET | `/api/admin/logs` | Logi systemowe | ADMIN |

### Profil (`/api/profile`)

| Metoda | Endpoint | Opis | Rola |
|--------|----------|------|------|
| GET | `/api/profile` | Dane profilu | Zalogowany |
| PUT | `/api/profile` | Edytuj profil | Zalogowany |
| PUT | `/api/profile/password` | Zmień hasło | Zalogowany |

---

## 🎨 Komponenty UI

### Główne Komponenty

| Komponent | Ścieżka | Typ | Opis |
|-----------|---------|-----|------|
| `AppShell` | `_components/AppShell.tsx` | Client | Layout z nawigacją, sidebar, user card |
| `ClientFilter` | `_components/ClientFilter.tsx` | Client | Filtrowanie katalogu, wyszukiwarka |
| `CatalogContent` | `_components/catalog/CatalogContent.tsx` | Server | Siatka kart książek |
| `BookActions` | `_components/BookActions.tsx` | Client | Przyciski akcji (rezerwuj, wypożycz) |
| `FavoriteButton` | `_components/FavoriteButton.tsx` | Client | Serduszko z optimistic update |
| `ReviewForm` | `_components/ReviewForm.tsx` | Client | Formularz oceny i komentarza |
| `ReviewsList` | `_components/ReviewsList.tsx` | Client | Lista recenzji |
| `ReviewsSection` | `_components/ReviewsSection.tsx` | Client | Wrapper dla recenzji |
| `BookRating` | `_components/BookRating.tsx` | Client | Gwiazdki oceny |
| `ReserveButton` | `_components/ReserveButton.tsx` | Client | Przycisk rezerwacji |
| `BackButton` | `_components/BackButton.tsx` | Client | Nawigacja wstecz |
| `Modal` | `_components/ui/Modal.tsx` | Client | Okna modalne |
| `Toast` | `_components/ui/Toast.tsx` | Client | Powiadomienia toast |

### Strony

| Strona | Ścieżka | Typ | Opis |
|--------|---------|-----|------|
| Katalog | `app/page.tsx` | Server | Strona główna z listą książek |
| Welcome | `app/welcome/page.tsx` | Client | Logowanie/Rejestracja |
| Szczegóły książki | `app/books/[id]/page.tsx` | Server | Pełne info o książce |
| Wypożyczenia | `app/borrowings/page.tsx` | Server | Lista wypożyczeń |
| Profil | `app/profile/page.tsx` | Client | Konto, ulubione, kary |
| Panel Admina | `app/admin/page.tsx` | Server | Dashboard admina |
| Panel Bibliotekarza | `app/librarian/page.tsx` | Client | Obsługa wypożyczeń |
| Kary | `app/fines/page.tsx` | Client | Lista kar |
| Recenzje | `app/reviews/page.tsx` | Client | Moje recenzje |

### Design System

**Kolory (Tailwind):**
```
Primary:    indigo-600, purple-600
Success:    emerald-500, green-500
Danger:     rose-500, red-500
Warning:    amber-500, yellow-500
Neutral:    slate-*, gray-*
```

**Gradienty gatunków:**
```
Fantastyka:   from-violet-500 to-purple-600
Klasyka:      from-amber-400 to-orange-500
Horror:       from-gray-700 to-gray-900
Romans:       from-rose-400 to-pink-500
Sci-Fi:       from-indigo-500 to-blue-600
```

**Animacje CSS:**
- `animate-fade-in-up` - wejście elementów
- `card-hover` - efekt unoszenia karty
- `btn-interactive` - efekt kliknięcia przycisku
- `transition-all duration-300` - płynne przejścia

---

## 🔄 Przepływ Danych

### SSR Flow (Server Components)

```
Browser Request
       ↓
Next.js Server
       ↓
Server Component (np. page.tsx)
       ↓
getUserSessionSSR() ← cookies()
       ↓
pool.query() ← MySQL
       ↓
Render HTML
       ↓
Send to Browser
```

### CSR Flow (Client Components)

```
User Interaction (click, submit)
       ↓
useState() update (optimistic)
       ↓
fetch() to API Route
       ↓
API Route Handler
       ↓
getUserSessionSSR() ← cookies()
       ↓
pool.query() ← MySQL
       ↓
JSON Response
       ↓
Update UI (or rollback)
```

### Pattern: Optimistic Updates

```typescript
// FavoriteButton.tsx
async function toggleFavorite() {
  // 1. Zapisz poprzedni stan
  const previousState = isFavorite;
  
  // 2. Natychmiastowa zmiana UI
  setIsFavorite(!isFavorite);
  
  try {
    // 3. Wysłanie do API
    await fetch("/api/favorites", { method: isFavorite ? "DELETE" : "POST" });
  } catch (error) {
    // 4. Rollback przy błędzie
    setIsFavorite(previousState);
    toast.error("Błąd");
  }
}
```

---

## 📏 Wzorce i Konwencje

### Nazewnictwo

**Pliki:**
- Komponenty: `PascalCase.tsx` (np. `BookActions.tsx`)
- API Routes: `route.ts` w folderze (np. `api/books/route.ts`)
- Typy: `camelCase.ts` (np. `types.ts`)

**Zmienne/Funkcje:**
- Funkcje: `camelCase` (np. `getUserSessionSSR`)
- Komponenty: `PascalCase` (np. `FavoriteButton`)
- Stałe: `SCREAMING_SNAKE_CASE` (np. `SESSION_COOKIE_NAME`)

**Baza danych:**
- Tabele: `lowercase_plural` (np. `uzytkownicy`, `ksiazki`)
- Kolumny: `PascalCase` (np. `UzytkownikId`, `DataWypozyczenia`)
- Statusy: `'Dostepny'`, `'Aktywne'` (polskie stringi)

### API Response Format

**Sukces:**
```json
{
  "data": { ... },
  "message": "Operacja zakończona sukcesem"
}
```

**Błąd:**
```json
{
  "error": "Opis błędu dla użytkownika"
}
```

### Bezpieczeństwo

**Zawsze:**
- Prepared statements (nigdy konkatenacja SQL)
- Sprawdzanie sesji na początku każdego handlera
- Sprawdzanie uprawnień (rola)
- Walidacja inputów
- Soft delete zamiast fizycznego usuwania

**Wzorzec API Route:**
```typescript
export async function POST(request: Request) {
  // 1. Autoryzacja
  const user = await getUserSessionSSR();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // 2. Sprawdzenie uprawnień
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // 3. Walidacja danych
  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }
  
  // 4. Operacja na bazie (z transakcją jeśli potrzeba)
  try {
    const [result] = await pool.query("INSERT ...", [body.title]);
    return NextResponse.json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

---

## 🚀 Planowane Funkcjonalności

### Priorytet Wysoki
- [ ] **Dark Mode** - tryb cieny dla admina
- [ ] **Grey Mode** - tryb szary dla bibliotekarza
- [ ] **Zatwierdzanie recenzji** - panel moderacji dla bibliotekarzy

### Priorytet Średni
- [ ] **Google OAuth** - logowanie przez Google
- [ ] **Koszyk** - wypożyczanie wielu książek naraz
- [ ] **Historia** - pełna historia wypożyczeń z eksportem
- [ ] **QR Codes** - skanowanie kodów książek
- [ ] **Prawdziwa kolejka rezerwacji** - rezerwacja niedostępnej książki z powiadomieniem gdy będzie wolna
- [ ] **E-booki** - obsługa plików PDF/EPUB, pobieranie dla uprawnionych
- [ ] **Powiadomienia email** - przypomnienia o zbliżającym się terminie zwrotu (Nodemailer)

### Priorytet Niski
- [ ] **PWA** - Progressive Web App (offline, instalacja)
- [ ] **Multi-language** - obsługa i18n (PL, EN)
- [ ] **Integracja z OPAC** - import danych bibliograficznych
- [ ] **Statystyki rozszerzone** - wykresy, raporty PDF
- [ ] **API publiczne** - dokumentacja OpenAPI/Swagger

---

## 🤖 Wskazówki dla LLM

### Przy Dodawaniu Nowych Funkcji

1. **Sprawdź istniejące typy** w `domain/types.ts` przed tworzeniem nowych
2. **Użyj wzorca API Route** z sekcji "Wzorce i Konwencje"
3. **Pamiętaj o soft delete** - dodaj `IsDeleted`, `DeletedAt`, `DeletedBy`
4. **Loguj ważne akcje** do tabeli `logi`
5. **Sprawdzaj uprawnienia** - użyj `getUserSessionSSR()` i sprawdź `user.role`
6. **Waliduj dane wejściowe** przed operacjami na bazie

### Tworzenie Nowej Strony

```typescript
// Nowa strona SSR (app/nowa-strona/page.tsx)
import { getUserSessionSSR } from "@/lib/auth/server";
import { AppShell } from "@/app/_components/AppShell";

export default async function NowaStronaPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    return <RedirectToLogin />;
  }
  
  // Pobierz dane z bazy...
  
  return (
    <AppShell>
      {/* Treść strony */}
    </AppShell>
  );
}
```

### Tworzenie Nowego Endpointu

```typescript
// Nowy endpoint (app/api/nowy-endpoint/route.ts)
import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSessionSSR();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ... FROM ... WHERE IsDeleted = 0`
    );
    
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

### Tworzenie Nowego Komponentu Client

```typescript
// Nowy komponent (app/_components/NowyKomponent.tsx)
"use client";

import { useState, useEffect } from "react";

interface NowyKomponentProps {
  prop1: string;
  onAction?: () => void;
}

export function NowyKomponent({ prop1, onAction }: NowyKomponentProps) {
  const [loading, setLoading] = useState(false);
  
  async function handleAction() {
    setLoading(true);
    try {
      const res = await fetch("/api/endpoint", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      onAction?.();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="p-4 rounded-xl bg-white border border-gray-200">
      {/* UI */}
    </div>
  );
}
```

### Dodawanie Nowej Tabeli

```sql
-- 1. Utwórz tabelę
CREATE TABLE `nowa_tabela` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Nazwa` varchar(255) NOT NULL,
  `UzytkownikId` int(11) DEFAULT NULL,
  `IsDeleted` tinyint(1) DEFAULT 0,
  `DeletedAt` datetime DEFAULT NULL,
  `DeletedBy` int(11) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  FOREIGN KEY (`UzytkownikId`) REFERENCES `uzytkownicy`(`UzytkownikId`)
);

-- 2. Dodaj do CONTEXT.md sekcji "Schemat Bazy Danych"
-- 3. Dodaj typy do domain/types.ts
-- 4. Dodaj endpoint API
```

### Kluczowe Pliki do Przeczytania

Przy każdej większej zmianie sprawdź:
- `domain/types.ts` - wszystkie interfejsy TypeScript
- `lib/auth/server.ts` - autoryzacja SSR
- `lib/db.ts` - connection pool MySQL
- `app/_components/AppShell.tsx` - główny layout
- Ten plik (`CONTEXT.md`) - pełny kontekst projektu

---

## 📝 Changelog Bazy Danych

| Data | Wersja | Zmiany |
|------|--------|--------|
| 2025-11-16 | 1.0 | Początkowy schemat |
| 2025-12-01 | 1.1 | Dodano egzemplarze, kary |
| 2025-12-14 | 1.2 | Dodano gatunki, ulubione, okładki |

---

**Autor:** Wolowicz  
**Wersja dokumentu:** 1.0  
**Ostatnia aktualizacja:** Styczeń 2026

---

> 💡 **Tip:** Użyj tego dokumentu jako kontekstu przy promptowaniu LLM o nowe funkcje. Skopiuj odpowiednie sekcje lub cały dokument aby AI miał pełny obraz systemu.
