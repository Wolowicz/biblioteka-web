# 📚 BiblioteQ

> Nowoczesny system zarządzania biblioteką – Next.js + MySQL + TypeScript

---

## 1. Wprowadzenie

Projekt **BiblioteQ** stanowi część systemu informatycznego przeznaczonego do zarządzania zasobami bibliotecznymi. Aplikacja została zaprojektowana jako moduł webowy, odpowiedzialny za obsługę interakcji użytkowników z funkcjonalnościami systemu bibliotecznego.

System został wykonany z wykorzystaniem technologii **Next.js** (React) z integracją z relacyjną bazą danych **MySQL**, co umożliwia stworzenie rozwiązania modularnego, skalowalnego i przystosowanego do dalszej rozbudowy.

---

## 2. Funkcjonalności

### 🔐 Autoryzacja
- Rejestracja nowych użytkowników z walidacją hasła (min. 8 znaków, duża/mała litera, cyfra, znak specjalny)
- Logowanie z obsługą sesji (cookie httpOnly)
- Trzy role użytkowników: **Czytelnik**, **Bibliotekarz**, **Administrator**
- Mapowanie ról z bazy danych (polski/angielski format)

### 📖 Katalog książek
- Przeglądanie katalogu z nowoczesnym interfejsem kafelkowym
- Filtrowanie po tytule, autorze i statusie dostępności
- Sortowanie (A-Z, Z-A, popularność)
- Szczegóły książki z okładką, opisem i informacjami bibliograficznymi
- System rezerwacji dla zalogowanych czytelników

### 📚 Wypożyczenia
- Lista wypożyczeń użytkownika ze statystykami
- Statusy: Aktywne, Termin wkrótce, Po terminie, Zwrócone
- Automatyczne wykrywanie przekroczenia terminu
- Karty wypożyczeń z kolorowymi badge'ami statusu

### ⚙️ Panel administracyjny
- Statystyki systemu (użytkownicy, książki, wypożyczenia)
- Szybkie akcje (dodawanie, edycja)
- Feed ostatnich aktywności
- Sekcja kosza (soft delete)

---

## 3. Wykorzystane technologie

| Technologia | Wersja | Opis |
|-------------|--------|------|
| **Next.js** | 16.0.1 | Framework React z App Router |
| **React** | 19.2.0 | Biblioteka UI |
| **TypeScript** | 5.x | Statyczne typowanie |
| **TailwindCSS** | 4.x | Stylizacja utility-first |
| **MySQL** | 8.x | Relacyjna baza danych |
| **mysql2/promise** | - | Async driver MySQL |
| **bcryptjs** | - | Hashowanie haseł |
| **FontAwesome** | 6.5 | Ikony (CDN) |

---

## 4. Architektura aplikacji

Aplikacja została zorganizowana zgodnie z architekturą **warstwową (DDD-inspired)**:

```
biblioteka-web/
│
├── app/                        # Warstwa prezentacji (Next.js App Router)
│   ├── page.tsx               # Strona główna (katalog/welcome)
│   ├── layout.tsx             # Główny layout z metadanymi
│   ├── globals.css            # Globalne style Tailwind
│   │
│   ├── welcome/               # Strona powitalna (login/register)
│   │   └── page.tsx
│   │
│   ├── books/                 # Szczegóły książek
│   │   └── [id]/page.tsx
│   │
│   ├── borrowings/            # Wypożyczenia użytkownika
│   │   ├── page.tsx
│   │   └── BorrowingsList.tsx
│   │
│   ├── admin/                 # Panel administracyjny
│   │   └── AdminPanel.tsx
│   │
│   ├── _components/           # Współdzielone komponenty
│   │   ├── AppShell.tsx       # Główny layout dla zalogowanych
│   │   ├── ClientFilter.tsx   # Filtrowanie i katalog książek
│   │   ├── BackButton.tsx     # Przycisk powrotu
│   │   └── ReserveButton.tsx  # Przycisk rezerwacji
│   │
│   └── api/                   # Route Handlers (REST API)
│       ├── auth/              # Autoryzacja
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   ├── register/route.ts
│       │   └── session/route.ts
│       ├── books/             # Książki
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── borrowings/route.ts
│       └── reservations/route.ts
│
├── domain/                    # Warstwa domenowa (OOP)
│   ├── types/                 # Definicje typów TypeScript
│   │   └── index.ts
│   └── models/                # Klasy domenowe
│       ├── User.ts
│       ├── Book.ts
│       └── Borrowing.ts
│
├── services/                  # Warstwa serwisów (API clients)
│   ├── ApiService.ts          # Bazowa klasa HTTP
│   ├── AuthService.ts         # Autoryzacja
│   ├── BooksService.ts        # Książki
│   └── BorrowingsService.ts   # Wypożyczenia
│
├── lib/                       # Warstwa infrastruktury
│   ├── db.ts                  # Pula połączeń MySQL
│   ├── auth/                  # Moduły autoryzacji
│   │   ├── index.ts           # Client-side (useAuth hook)
│   │   ├── server.ts          # Server-side (SSR)
│   │   └── role-map.ts        # Mapowanie ról
│   └── ui/
│       └── theme.ts           # Motywy kolorystyczne (legacy)
│
├── styles/                    # Scentralizowane style
│   └── index.ts               # Wszystkie style Tailwind
│
└── public/                    # Zasoby statyczne
    └── biblio.png             # Domyślna okładka
```

---

## 5. Zmiany wprowadzone w sesji (Changelog)

### 🎨 UI/UX Redesign

#### Strona powitalna (`app/welcome/page.tsx`)
- Nowy layout dwukolumnowy (65%/35%)
- Lewa strona: tło obrazkowe z tytułem "BiblioteQ"
- Prawa strona: formularz logowania/rejestracji z przełącznikiem zakładek
- Animacje hover i transition

#### Katalog książek (`app/_components/ClientFilter.tsx`)
- Kategorie jako pill buttony
- Pasek filtrów: wyszukiwarka, status, sortowanie
- Przełącznik widoku grid/list
- Karty książek z overlay przy hover
- System ocen gwiazdkowych
- Tagi kategorii

#### Layout aplikacji (`app/_components/AppShell.tsx`)
- Header z backdrop-blur
- Nawigacja jako pills
- Wyszukiwarka w headerze
- Dzwonek powiadomień
- Badge użytkownika z rolą

#### Panel administracyjny (`app/admin/AdminPanel.tsx`)
- Karty statystyk z ikonami
- Sekcja szybkich akcji
- Feed ostatnich aktywności
- Sekcja kosza

#### Szczegóły książki (`app/books/[id]/page.tsx`)
- Layout 12-kolumnowy (8+4)
- Sticky sidebar z okładką
- Box statusu dostępności
- Sekcja recenzji
- Naprawiono duplikację kodu

#### Wypożyczenia (`app/borrowings/`)
- Karty statystyk (wszystkie, aktywne, zwrócone, po terminie)
- Zakładki filtrowania
- Nowoczesne karty wypożyczeń z badge'ami statusu

### 🏗️ Architektura

#### Warstwa domenowa (`domain/`)
- Typy TypeScript (`domain/types/index.ts`)
- Klasy OOP: `User`, `Book`, `Borrowing`
- Logika biznesowa w modelach

#### Warstwa serwisów (`services/`)
- `ApiService` - bazowa klasa HTTP z obsługą błędów
- `AuthService` - logowanie, rejestracja, sesja
- `BooksService` - CRUD książek + filtrowanie
- `BorrowingsService` - wypożyczenia + rezerwacje

#### Style (`styles/index.ts`)
- Scentralizowane style Tailwind
- Motywy według ról (ADMIN/LIBRARIAN/USER)
- Style komponentów: przyciski, inputy, karty
- Funkcje pomocnicze

### 🔧 Bugfixy

- Naprawiono duplikację kodu w `books/[id]/page.tsx`
- Dodano brakującą funkcję `authLogin()` w `lib/auth/index.ts`
- Poprawiono import typów w komponentach

### 📚 Dokumentacja

- Rozbudowane komentarze JSDoc we wszystkich plikach
- Wyjaśnienia przepływu danych
- Przykłady użycia

---

## 6. Uruchomienie projektu

### Wymagania
- Node.js 20+
- MySQL 8+
- npm lub yarn

### Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/your-repo/biblioteq.git
cd biblioteq

# Instalacja zależności
npm install

# Konfiguracja bazy danych
# Utwórz plik .env.local z parametrami:
cp .env.example .env.local

# Zmienne środowiskowe:
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=twoje_haslo
# DB_NAME=biblioteka

# Import schematu bazy
mysql -u root -p biblioteka < biblioteka.sql

# Uruchomienie w trybie development
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

### Konta testowe

| Email | Hasło | Rola |
|-------|-------|------|
| admin@admin.pl | Admin123! | Administrator |
| bibliotekarz@biblioteka.pl | Bibl123! | Bibliotekarz |
| czytelnik@biblioteka.pl | User123! | Czytelnik |

---

## 7. Dalszy rozwój

Planowane funkcjonalności:
- [ ] Przedłużanie wypożyczeń
- [ ] System powiadomień (email/in-app)
- [ ] Płatności kar online
- [ ] Import książek z API zewnętrznych (Google Books, OpenLibrary)
- [ ] PWA (Progressive Web App)
- [ ] Tryb ciemny
- [ ] Testy jednostkowe i E2E

---

## 8. Licencja

Projekt edukacyjny - część pracy magisterskiej.

---

**Autor:** Student  
**Uczelnia:** Studia magisterskie  
**Data aktualizacji:** 2025
