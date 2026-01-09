# 📚 BiblioteQ - System Zarządzania Biblioteką

Nowoczesny, responsywny system zarządzania biblioteką zbudowany w technologii **Next.js 16** z **TypeScript**, **Tailwind CSS** i **MySQL**.

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-cyan)

---

## 📋 Spis Treści

- [Funkcjonalności](#-funkcjonalności)
- [Technologie](#️-technologie)
- [Instalacja](#-instalacja)
- [Struktura Projektu](#-struktura-projektu)
- [Schemat Bazy Danych](#️-schemat-bazy-danych)
- [API Documentation](#-api-documentation)
- [Bezpieczeństwo](#-bezpieczeństwo)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Funkcjonalności

### 👥 System Ról

#### **Czytelnik (READER)**
- 📖 **Katalog książek** - przeglądanie, filtrowanie, sortowanie
- ⭐ **Ulubione** - zapisywanie ulubionych książek
- 🔍 **Wyszukiwanie** - po tytule, autorze, ISBN, gatunku
- 📋 **Rezerwacje** - rezerwacja dostępnych książek online
- 📚 **Wypożyczenia** - przegląd aktywnych i historycznych wypożyczeń (uwaga: zwroty przyjmowane przez bibliotekarza w panelu)
- 📅 **Przedłużenia** - przedłużanie terminu zwrotu (max 2x)
- 💰 **Opłaty** - podgląd kar za przetrzymanie
- 📝 **Recenzje** - ocenianie i recenzowanie książek (1-5 ⭐)
- 👤 **Profil** - zarządzanie danymi osobowymi
- 🔔 **Powiadomienia** - alerty o zbliżających się terminach

#### **Bibliotekarz (LIBRARIAN)**
- 👥 **Użytkownicy** - zarządzanie czytelnikami
- 📦 **Obsługa wypożyczeń** - wydawanie i przyjmowanie książek
- 💵 **Opłaty** - naliczanie i zarządzanie karami
- 📊 **Statystyki** - podgląd aktywnych wypożyczeń i przetrzymań
- 🔍 **Wyszukiwanie** - szybkie wyszukiwanie książek i użytkowników
- 📋 **Rezerwacje** - obsługa kolejki rezerwacji

#### **Administrator (ADMIN)**
- 👑 **Wszystkie uprawnienia bibliotekarza**
- 📚 **Zarządzanie katalogiem** - dodawanie, edycja, usuwanie książek (soft delete)
- 👨‍💼 **Zarządzanie użytkownikami** - tworzenie kont, zmiana ról
- 🏷️ **Gatunki** - zarządzanie kategoriami książek
- 📊 **Zaawansowane statystyki** - wykresy, raporty, top listy
- 📜 **Logi systemowe** - historia akcji użytkowników
- ⚙️ **Konfiguracja** - ustawienia systemu

### 🎨 UI/UX Features

- ✨ **Nowoczesny design** - młodzieżowy styl z gradientami i animacjami
- 📱 **Responsywny** - mobile-first approach
- 🎭 **Smooth animations** - transitions, hover effects
- 💫 **Interactive components** - karty książek, modalne okna, toasty
- 🔐 **Bezpieczne logowanie** - z funkcją "Zapamiętaj mnie"
- 🌙 **User card** - szybki dostęp do profilu w prawym górnym rogu
- ⚡ **Fast loading** - SSR, optymalizacja obrazów
- 🎯 **Intuitive navigation** - przejrzysta nawigacja

### 📊 Statystyki (Panel Admina)

- 📈 **Wykres wypożyczeń** - trend w ostatnich 30 dniach
- 👤 **Top czytelnicy** - najbardziej aktywni użytkownicy
- 📖 **Popularne książki** - najczęściej wypożyczane
- 💰 **Statystyki opłat** - suma kar, rozliczenia
- 📉 **Przetrzymania** - lista książek po terminie
- 🎯 **Gatunki** - rozkład popularności kategorii

---

## 🛠️ Technologie

### Frontend
```json
{
  "next": "16.0.1",
  "react": "19",
  "typescript": "5.x",
  "tailwindcss": "4.0.0-alpha.25",
  "@fortawesome/fontawesome-free": "^6.7.1"
}
```

### Backend
```json
{
  "mysql2": "^3.11.5",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2"
}
```

### DevTools
- **Turbopack** - ultra-fast bundler (dev mode)
- **ESLint** - code linting
- **Console Ninja** - advanced debugging

---

## 📦 Instalacja

### 1️⃣ Wymagania Wstępne

- **Node.js** 18+ i npm/yarn
- **MySQL** 5.7+ lub **MariaDB** 10.3+
- **Git**

### 2️⃣ Klonowanie Repozytorium

```bash
git clone https://github.com/Wolowicz/biblioteka-web.git
cd biblioteka-web
```

### 3️⃣ Instalacja Zależności

```bash
npm install
# lub
yarn install
```

### 4️⃣ Konfiguracja Bazy Danych

**Utwórz bazę danych:**
```sql
CREATE DATABASE biblioteka CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Zaimportuj schemat:**
```bash
mysql -u root -p biblioteka < biblioteka14.12v2.sql
```

### 5️⃣ Zmienne Środowiskowe

Utwórz plik `.env.local` w głównym katalogu:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=twoje_haslo
DB_NAME=biblioteka

# JWT Secret (wygeneruj losowy string!)
JWT_SECRET=super_bezpieczny_losowy_klucz_minimum_32_znaki

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**🔒 WAŻNE:** Nigdy nie commituj `.env.local` do repozytorium!

### 6️⃣ Uruchomienie Aplikacji

**Development mode:**
```bash
npm run dev
```
Aplikacja dostępna na: **http://localhost:3000**

**Production mode:**
```bash
npm run build
npm start
```

---

## 📁 Struktura Projektu

```
biblioteka-web/
├── 📂 app/                          # Next.js App Router
│   ├── 📂 _components/              # Komponenty współdzielone
│   │   ├── AppShell.tsx             # Layout z nawigacją
│   │   ├── BackButton.tsx           # Przycisk powrotu
│   │   ├── ClientFilter.tsx         # Filtrowanie katalogu (client)
│   │   ├── ReserveButton.tsx        # Rezerwacja książki
│   │   ├── FavoriteButton.tsx       # Dodaj do ulubionych
│   │   ├── BookActions.tsx          # Akcje na książce
│   │   ├── BookRating.tsx           # Ocena książki (gwiazdki)
│   │   ├── ReviewForm.tsx           # Formularz recenzji
│   │   ├── ReviewsList.tsx          # Lista recenzji
│   │   ├── 📂 catalog/
│   │   │   └── CatalogContent.tsx   # Katalog książek
│   │   └── 📂 ui/
│   │       ├── Modal.tsx            # Komponent modal
│   │       └── Toast.tsx            # Powiadomienia toast
│   ├── 📂 admin/                    # Panel administratora
│   │   ├── page.tsx                 # Strona główna admina
│   │   └── AdminPanel.tsx           # Komponenty panelu
│   ├── 📂 librarian/                # Panel bibliotekarza
│   │   └── page.tsx                 # Obsługa wypożyczeń
│   ├── 📂 profile/                  # Profil użytkownika
│   │   └── page.tsx                 # Zakładki: Konto, Ulubione, Ustawienia
│   ├── 📂 books/[id]/               # Szczegóły książki
│   │   └── page.tsx                 # Dynamiczna strona książki
│   ├── 📂 borrowings/               # Wypożyczenia
│   │   ├── page.tsx
│   │   ├── BorrowingsClient.tsx
│   │   └── BorrowingsList.tsx
│   ├── 📂 welcome/                  # Logowanie/Rejestracja
│   │   └── page.tsx
│   ├── 📂 api/                      # API Routes (Backend)
│   │   ├── 📂 auth/
│   │   │   ├── login/route.ts       # POST /api/auth/login
│   │   │   ├── register/route.ts    # POST /api/auth/register
│   │   │   ├── logout/route.ts      # POST /api/auth/logout
│   │   │   └── session/route.ts     # GET /api/auth/session
│   │   ├── 📂 books/
│   │   │   ├── route.ts             # GET/POST /api/books
│   │   │   └── [id]/route.ts        # GET/PUT/DELETE /api/books/:id
│   │   ├── 📂 borrowings/
│   │   │   ├── route.ts             # GET /api/borrowings
│   │   │   ├── create/route.ts      # POST /api/borrowings/create
│   │   │   ├── return/route.ts      # POST /api/borrowings/return
│   │   │   ├── check/route.ts       # GET /api/borrowings/check
│   │   │   └── [id]/extend/route.ts # POST /api/borrowings/:id/extend
│   │   ├── 📂 favorites/
│   │   │   └── route.ts             # GET/POST/DELETE /api/favorites
│   │   ├── 📂 reviews/
│   │   │   └── route.ts             # GET/POST/DELETE /api/reviews
│   │   ├── 📂 profile/
│   │   │   └── route.ts             # GET/PUT /api/profile
│   │   ├── 📂 admin/
│   │   │   ├── stats/route.ts       # GET /api/admin/stats
│   │   │   ├── users/route.ts       # GET /api/admin/users
│   │   │   └── logs/route.ts        # GET /api/admin/logs
│   │   └── 📂 notifications/
│   │       └── route.ts             # GET /api/notifications
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Strona główna (katalog)
│   └── globals.css                  # Style globalne + animacje
├── 📂 domain/                       # Domain Logic
│   ├── 📂 models/                   # Modele danych
│   │   ├── Book.ts
│   │   ├── User.ts
│   │   └── Borrowing.ts
│   ├── 📂 types/                    # TypeScript types
│   │   ├── index.ts
│   │   └── database.ts
│   └── types.ts                     # Główne interfejsy
├── 📂 lib/                          # Utilities
│   ├── 📂 auth/
│   │   ├── index.ts                 # Client-side auth
│   │   ├── server.ts                # SSR auth
│   │   └── role-map.ts              # Role mapping
│   ├── db.ts                        # MySQL connection pool
│   └── 📂 ui/
│       └── theme.ts                 # Theme config
├── 📂 services/                     # Frontend API Services
│   ├── ApiService.ts                # Base API service
│   ├── AuthService.ts               # Auth operations
│   ├── BooksService.ts              # Books CRUD
│   └── BorrowingsService.ts         # Borrowings operations
├── 📂 public/                       # Static files
│   └── library-bg.jpg               # Background image
├── 📂 migrations/                   # SQL migrations
│   ├── 001_initial_schema.sql
│   └── 002_gatunki_ulubione_okladka.sql
├── biblioteka14.12v2.sql            # Pełny schemat bazy danych
├── .env.local                       # Environment variables (not in repo)
├── .gitignore
├── next.config.ts                   # Next.js config
├── tailwind.config.ts               # Tailwind config
├── tsconfig.json                    # TypeScript config
├── package.json
└── README.md
```

---

## 🗄️ Schemat Bazy Danych

### Główne Tabele

#### `Uzytkownicy` - Users
```sql
CREATE TABLE `Uzytkownicy` (
  `UzytkownikId` INT PRIMARY KEY AUTO_INCREMENT,
  `Imie` VARCHAR(50) NOT NULL,
  `Nazwisko` VARCHAR(50) NOT NULL,
  `Email` VARCHAR(100) UNIQUE NOT NULL,
  `HashedPassword` VARCHAR(255) NOT NULL,
  `Rola` ENUM('Czytelnik', 'Bibliotekarz', 'Administrator') DEFAULT 'Czytelnik',
  `DataRejestracji` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `IsDeleted` TINYINT(1) DEFAULT 0
);
```

#### `Ksiazki` - Books
```sql
CREATE TABLE `Ksiazki` (
  `KsiazkaId` INT PRIMARY KEY AUTO_INCREMENT,
  `Tytul` VARCHAR(300) NOT NULL,
  `numerISBN` VARCHAR(20),
  `Wydawnictwo` VARCHAR(200),
  `Rok` INT,
  `LiczbaEgzemplarzy` INT DEFAULT 0,
  `DostepneEgzemplarze` INT DEFAULT 0,
  `IsDeleted` TINYINT(1) DEFAULT 0
);
```

#### `Autorzy` - Authors
```sql
CREATE TABLE `Autorzy` (
  `AutorId` INT PRIMARY KEY AUTO_INCREMENT,
  `ImieNazwisko` VARCHAR(100) NOT NULL
);
```

#### `Wypozyczenia` - Borrowings
```sql
CREATE TABLE `Wypozyczenia` (
  `WypozyczenieId` INT PRIMARY KEY AUTO_INCREMENT,
  `UzytkownikId` INT NOT NULL,
  `KsiazkaId` INT NOT NULL,
  `DataWypozyczenia` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `DataPlanowanegoZwrotu` DATE NOT NULL,
  `DataZwrotu` DATE NULL,
  `Status` ENUM('ACTIVE', 'RETURNED', 'OVERDUE') DEFAULT 'ACTIVE',
  `LiczbaPrzedluzen` INT DEFAULT 0,
  FOREIGN KEY (`UzytkownikId`) REFERENCES `Uzytkownicy`(`UzytkownikId`),
  FOREIGN KEY (`KsiazkaId`) REFERENCES `Ksiazki`(`KsiazkaId`)
);
```

#### `Rezerwacje` - Reservations
```sql
CREATE TABLE `Rezerwacje` (
  `RezerwacjaId` INT PRIMARY KEY AUTO_INCREMENT,
  `UzytkownikId` INT NOT NULL,
  `KsiazkaId` INT NOT NULL,
  `DataRezerwacji` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `Status` ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
  FOREIGN KEY (`UzytkownikId`) REFERENCES `Uzytkownicy`(`UzytkownikId`),
  FOREIGN KEY (`KsiazkaId`) REFERENCES `Ksiazki`(`KsiazkaId`)
);
```

#### `gatunki` - Genres (nowa funkcjonalność)
```sql
CREATE TABLE `gatunki` (
  `GatunekId` INT PRIMARY KEY AUTO_INCREMENT,
  `Nazwa` VARCHAR(100) NOT NULL,
  `Ikona` VARCHAR(50),
  `Kolor` VARCHAR(100),
  `IsDeleted` TINYINT(1) DEFAULT 0
);
```

#### `ulubione` - Favorites (nowa funkcjonalność)
```sql
CREATE TABLE `ulubione` (
  `UlubioneId` INT PRIMARY KEY AUTO_INCREMENT,
  `UzytkownikId` INT NOT NULL,
  `KsiazkaId` INT NOT NULL,
  `DataDodania` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`UzytkownikId`) REFERENCES `Uzytkownicy`(`UzytkownikId`),
  FOREIGN KEY (`KsiazkaId`) REFERENCES `Ksiazki`(`KsiazkaId`)
);
```

#### `recenzje` - Reviews (nowa funkcjonalność)
```sql
CREATE TABLE `recenzje` (
  `RecenzjaId` INT PRIMARY KEY AUTO_INCREMENT,
  `UzytkownikId` INT NOT NULL,
  `KsiazkaId` INT NOT NULL,
  `Ocena` TINYINT CHECK (`Ocena` BETWEEN 1 AND 5),
  `Tresc` TEXT,
  `DataDodania` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`UzytkownikId`) REFERENCES `Uzytkownicy`(`UzytkownikId`),
  FOREIGN KEY (`KsiazkaId`) REFERENCES `Ksiazki`(`KsiazkaId`)
);
```

### Relacje Many-to-Many

- `KsiazkiAutorzy` - Książki ↔ Autorzy
- `ksiazki_gatunki` - Książki ↔ Gatunki

---

## 📡 API Documentation

### 🔐 Authentication

#### `POST /api/auth/register`
Rejestracja nowego użytkownika
```typescript
// Request Body
{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Response 200
{
  message: "Użytkownik zarejestrowany"
}
```

#### `POST /api/auth/login`
Logowanie użytkownika
```typescript
// Request Body
{
  email: string;
  password: string;
}

// Response 200
{
  user: {
    id: number;
    name: string;
    email: string;
    role: "READER" | "LIBRARIAN" | "ADMIN";
  }
}
```

#### `POST /api/auth/logout`
Wylogowanie (usuwa cookie sesji)
```typescript
// Response 200
{
  message: "Wylogowano pomyślnie"
}
```

#### `GET /api/auth/session`
Sprawdzenie aktywnej sesji
```typescript
// Response 200
{
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  }
}
```

---

### 📚 Books

#### `GET /api/books`
Lista wszystkich książek z filtrowaniem
```typescript
// Query Params
?search=string       // Szukaj w tytule/autorze
&available=boolean   // Tylko dostępne

// Response 200
{
  books: [
    {
      id: number;
      title: string;
      authors: string;
      isbn: string;
      publisher: string;
      year: number;
      available: boolean;
      genres: Array<{
        id: number;
        name: string;
        icon: string;
        color: string;
      }>;
    }
  ]
}
```

#### `GET /api/books/[id]`
Szczegóły pojedynczej książki
```typescript
// Response 200
{
  id: number;
  title: string;
  authors: string;
  isbn: string;
  publisher: string;
  year: number;
  available: boolean;
  genres: Array<Genre>;
}
```

#### `POST /api/books` (ADMIN only)
Dodanie nowej książki
```typescript
// Request Body
{
  title: string;
  authors: string[];
  isbn?: string;
  publisher?: string;
  year?: number;
  copies: number;
  genreIds?: number[];
}
```

---

### 📖 Borrowings

#### `GET /api/borrowings`
Lista wypożyczeń
```typescript
// Query Params
?userId=number       // Filtruj po użytkowniku
&status=string       // ACTIVE | RETURNED | OVERDUE
&all=boolean         // Admin: wszystkie wypożyczenia

// Response 200
{
  borrowings: [
    {
      id: number;
      bookTitle: string;
      borrowDate: string;
      dueDate: string;
      returnDate: string | null;
      status: "ACTIVE" | "RETURNED" | "OVERDUE";
      extensions: number;
    }
  ]
}
```

#### `POST /api/borrowings/create`
Wypożyczenie książki
```typescript
// Request Body
{
  bookId: number;
  userId?: number;  // Admin może wypożyczyć dla innego użytkownika
}

// Response 200
{
  borrowingId: number;
  dueDate: string;
}
```

#### `POST /api/borrowings/return`
Zwrot książki
```typescript
// Request Body
{
  borrowingId: number;
}

// Response 200
{
  message: "Książka zwrócona";
  fine?: number;  // Opłata za przetrzymanie
}
```

#### `POST /api/borrowings/[id]/extend`
Przedłużenie wypożyczenia
```typescript
// Response 200
{
  newDueDate: string;
  extensionsLeft: number;
}
```

---

### ⭐ Favorites

#### `GET /api/favorites`
Lista ulubionych książek użytkownika
```typescript
// Response 200
{
  favorites: Array<Book>;
}
```

#### `POST /api/favorites`
Dodaj do ulubionych
```typescript
// Request Body
{
  bookId: number;
}
```

#### `DELETE /api/favorites?bookId=X`
Usuń z ulubionych
```typescript
// Response 200
{
  message: "Usunięto z ulubionych"
}
```

---

### 📝 Reviews

#### `GET /api/reviews?bookId=X`
Recenzje książki
```typescript
// Response 200
{
  reviews: [
    {
      id: number;
      userName: string;
      rating: number;     // 1-5
      content: string;
      date: string;
      canDelete: boolean; // true jeśli to recenzja użytkownika
    }
  ];
  averageRating: number;
  totalReviews: number;
}
```

#### `POST /api/reviews`
Dodaj recenzję
```typescript
// Request Body
{
  bookId: number;
  rating: number;    // 1-5
  content: string;
}
```

#### `DELETE /api/reviews/[id]`
Usuń recenzję (tylko własną)

---

### 👤 Profile

#### `GET /api/profile`
Dane profilu użytkownika
```typescript
// Response 200
{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  registrationDate: string;
  stats: {
    totalBorrowings: number;
    activeBorrowings: number;
    totalFines: number;
  }
}
```

#### `PUT /api/profile`
Aktualizuj profil
```typescript
// Request Body
{
  firstName?: string;
  lastName?: string;
  email?: string;
}
```

---

### 🛡️ Admin Endpoints

#### `GET /api/admin/stats`
Statystyki systemu
```typescript
// Response 200
{
  totalUsers: number;
  totalBooks: number;
  activeLoans: number;
  overdueLoans: number;
  totalFines: number;
  topReaders: Array<{
    name: string;
    borrowings: number;
  }>;
  topBooks: Array<{
    title: string;
    borrowings: number;
  }>;
  borrowingsTrend: Array<{
    date: string;
    count: number;
  }>;
}
```

#### `GET /api/admin/users`
Lista użytkowników
```typescript
// Query Params
?role=string         // READER | LIBRARIAN | ADMIN
&search=string       // Szukaj po imieniu/emailu

// Response 200
{
  users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    activeBorrowings: number;
  }>
}
```

#### `GET /api/admin/logs`
Logi systemowe (last 100)
```typescript
// Response 200
{
  logs: Array<{
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }>
}
```

---

## 🔒 Bezpieczeństwo

### Authentication & Authorization
- ✅ **Hasła**: bcrypt hashing z 10 rounds
- ✅ **Sesje**: JWT tokens w HTTP-only cookies (7 dni ważności)
- ✅ **RBAC**: Role-based access control (3 role)
- ✅ **Session validation**: Sprawdzanie przy każdym zapytaniu API

### Data Protection
- ✅ **SQL Injection**: Prepared statements (mysql2)
- ✅ **XSS Protection**: React auto-escaping + sanityzacja inputów
- ✅ **CSRF**: SameSite cookies
- ✅ **Soft Delete**: Dane nie są fizycznie usuwane (`IsDeleted` flag)

### Password Requirements
```typescript
// Walidacja hasła przy rejestracji
- Min. 8 znaków
- Min. 1 wielka litera
- Min. 1 mała litera
- Min. 1 cyfra
- Min. 1 znak specjalny
```

### Environment Variables
```bash
# NIGDY nie commituj .env.local do repo!
# Zawiera wrażliwe dane: DB credentials, JWT secret
```

---

## 🐛 Troubleshooting

### Problem: Port 3000 zajęty
```bash
# Aplikacja automatycznie przełączy się na port 3001
# Lub zatrzymaj proces na porcie 3000:
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows (znajdź PID i kill)
```

### Problem: Błędy połączenia z bazą danych
```
# Symptom: `connect ECONNREFUSED 127.0.0.1:3306` lub podobny
# Przyczyny:
# - Serwer MySQL nie jest uruchomiony
# - Złe dane w `.env.local` (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME)
# - Firewall lub inna usługa blokuje port 3306

# 1) Sprawdź czy MySQL działa
systemctl status mysql        # Linux
brew services list            # macOS (Homebrew)
services.msc                  # Windows Services GUI

# 2) Sprawdź połączenie z terminala
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p
# Jeśli połączenie się nie udaje → sprawdź logi serwera MySQL

# 3) Szybkie uruchomienie lokalnego MySQL (Docker)
# Jeśli nie chcesz instalować MySQL lokalnie, możesz uruchomić kontener:

docker run --name biblioteka-db -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=biblioteka -p 3306:3306 -d mysql:5.7

# 4) Sprawdź zmienne w `.env.local` (przykład)
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=secret
# DB_NAME=biblioteka

# 5) Endpoint zdrowia
# Aplikacja wystawia GET /api/health  — sprawdza dostępność bazy
curl http://localhost:3000/api/health
# Oczekiwany rezultat: {"ok":true,"db":{"ok":true}}
```

### Problem: JSON_ARRAYAGG does not exist
```sql
-- Aplikacja automatycznie użyje GROUP_CONCAT jako fallback
-- Aby naprawić, zaktualizuj MySQL do 5.7.22+
SELECT VERSION();
```

### Problem: Cache/Build errors
```bash
# Wyczyść cache Next.js
rm -rf .next
npm run dev

# Reinstalacja node_modules
rm -rf node_modules package-lock.json
npm install
```

### Problem: Brak ikonek Font Awesome
```bash
# Sprawdź czy w layout.tsx jest:
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
```

### Problem: 401 Unauthorized przy API calls
```typescript
// Sprawdź czy sesja jest aktywna:
fetch('/api/auth/session').then(r => r.json()).then(console.log)

// Jeśli null, wyloguj i zaloguj ponownie
// Cookie mogło wygasnąć
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Don't forget to set up MySQL connection (PlanetScale, Railway, etc.)
```

### Docker
```dockerfile
# Dockerfile (example)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📈 Roadmap

- [ ] **Google OAuth** - Logowanie przez Google
- [ ] **E-booki** - Obsługa książek cyfrowych
- [ ] **Powiadomienia email** - Przypomnienia o zwrotach
- [ ] **Koszyk** - Wypożyczanie wielu książek naraz
- [ ] **QR Codes** - Skanowanie książek
- [ ] **Dark Mode** - Ciemny motyw
- [ ] **PWA** - Progressive Web App
- [ ] **Multi-language** - Obsługa języków (i18n)

---

## 🤝 Contributing

Pull requesty są mile widziane! Dla większych zmian, otwórz najpierw Issue aby przedyskutować propozycje.

### Development Workflow
```bash
# 1. Fork repo
# 2. Create feature branch
git checkout -b feature/AmazingFeature

# 3. Commit changes
git commit -m 'Add some AmazingFeature'

# 4. Push to branch
git push origin feature/AmazingFeature

# 5. Open Pull Request
```

---

## 📄 Licencja

Ten projekt został stworzony na potrzeby **projektu na studiach**.

---

## 👨‍💻 Autor

**Wolowicz** - [GitHub](https://github.com/Wolowicz)


---

[⬆ Back to Top](#-biblioteq---system-zarządzania-biblioteką)

</div>
