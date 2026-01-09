# 📖 Dokumentacja Techniczna BiblioteQ

## Spis Treści

1. [Architektura Systemu](#architektura-systemu)
2. [Przepływ Danych](#przepływ-danych)
3. [Autoryzacja i Sesje](#autoryzacja-i-sesje)
4. [Komponenty](#komponenty)
5. [API Routes](#api-routes)
6. [Baza Danych](#baza-danych)
7. [Optymalizacje](#optymalizacje)

---

## Architektura Systemu

### Stack Technologiczny

```
┌─────────────────────────────────────────┐
│           Next.js 16 (App Router)       │
├─────────────────────────────────────────┤
│  React 19  │  TypeScript  │  Tailwind   │
├─────────────────────────────────────────┤
│         Server Components (SSR)         │
│         Client Components (CSR)         │
├─────────────────────────────────────────┤
│           API Routes (Serverless)       │
├─────────────────────────────────────────┤
│      MySQL 5.7+ (mysql2/promise)        │
└─────────────────────────────────────────┘
```

### Separacja Komponentów

**Server Components (SSR):**
- `app/page.tsx` - Strona główna z katalogiem
- `app/books/[id]/page.tsx` - Szczegóły książki
- `app/admin/page.tsx` - Panel admina
- Pobierają dane bezpośrednio z bazy danych

**Client Components (CSR):**
- `_components/ClientFilter.tsx` - Filtry katalogu
- `_components/FavoriteButton.tsx` - Dodaj do ulubionych
- `_components/ReviewForm.tsx` - Formularz recenzji
- Interaktywne UI, useState, useEffect

---

## Przepływ Danych

### 1. Strona Główna (Katalog Książek)

```mermaid
sequenceDiagram
    Browser->>Next.js SSR: GET /
    Next.js SSR->>getUserSessionSSR(): Sprawdź sesję
    getUserSessionSSR()-->>Next.js SSR: user | null
    
    alt Użytkownik niezalogowany
        Next.js SSR-->>Browser: <WelcomePage />
    else Użytkownik zalogowany
        Next.js SSR->>MySQL: SELECT books with genres
        MySQL-->>Next.js SSR: books[]
        Next.js SSR-->>Browser: <AppShell><ClientFilter books={books} /></AppShell>
        Browser->>Browser: Client-side filtering
    end
```

**Kod:**
```typescript
// app/page.tsx
export default async function Page() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    return <WelcomePage />;
  }
  
  const books = await getBooks(); // SSR fetch
  
  return (
    <AppShell user={user}>
      <ClientFilter books={books} role={user.role} />
    </AppShell>
  );
}
```

### 2. System Ulubionych

```
[Client] FavoriteButton click
    ↓
POST /api/favorites { bookId }
    ↓
Walidacja sesji JWT
    ↓
INSERT INTO ulubione (UzytkownikId, KsiazkaId)
    ↓
Response 200 { message: "Dodano" }
    ↓
[Client] Odśwież UI (optimistic update)
```

### 3. Dodawanie Recenzji

```
[Client] ReviewForm submit
    ↓
POST /api/reviews { bookId, rating, content }
    ↓
Sprawdź czy użytkownik wypożyczył książkę
    ↓
INSERT INTO recenzje
    ↓
Przelicz średnią ocenę książki
    ↓
Response 200 { review }
    ↓
[Client] Dodaj recenzję do listy bez reload
```

---

## Autoryzacja i Sesje

### JWT Token Structure

```json
{
  "id": 123,
  "email": "user@example.com",
  "role": "READER",
  "iat": 1702564800,
  "exp": 1703169600
}
```

### Session Flow

```typescript
// lib/auth/server.ts
export async function getUserSessionSSR() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.query(
      "SELECT * FROM Uzytkownicy WHERE UzytkownikId = ? AND IsDeleted = 0",
      [decoded.id]
    );
    
    if (users.length === 0) return null;
    
    return mapUserData(users[0]);
  } catch (error) {
    return null;
  }
}
```

### Cookie Configuration

```typescript
{
  httpOnly: true,      // Niedostępne dla JavaScript
  secure: true,        // Tylko HTTPS (produkcja)
  sameSite: "lax",     // CSRF protection
  maxAge: 7 * 24 * 60 * 60 // 7 dni
}
```

### Role-Based Access Control

```typescript
// lib/auth/role-map.ts
const rolePermissions = {
  READER: ["read:books", "create:borrowing", "create:review"],
  LIBRARIAN: ["read:all", "create:borrowing", "manage:borrowings"],
  ADMIN: ["*"] // wszystkie uprawnienia
};

export function hasPermission(role: string, permission: string): boolean {
  if (role === "ADMIN") return true;
  return rolePermissions[role]?.includes(permission) || false;
}
```

---

## Komponenty

### 1. AppShell - Layout z Nawigacją

**Ścieżka:** `app/_components/AppShell.tsx`

**Funkcjonalność:**
- Responsywny layout z sidebar (desktop) i bottom nav (mobile)
- Karta użytkownika w prawym górnym rogu
- Nawigacja zależna od roli
- Wylogowanie

**Struktura:**
```tsx
<div className="flex h-screen">
  {/* Desktop Sidebar */}
  <aside className="hidden lg:flex">
    <Navigation items={navItems} />
  </aside>
  
  {/* Main Content */}
  <main className="flex-1 overflow-auto">
    <header>
      <UserCard user={user} onLogout={handleLogout} />
    </header>
    <div className="container">
      {children}
    </div>
  </main>
  
  {/* Mobile Bottom Nav */}
  <nav className="lg:hidden fixed bottom-0">
    <BottomNav items={navItems} />
  </nav>
</div>
```

### 2. ClientFilter - Katalog Książek

**Ścieżka:** `app/_components/ClientFilter.tsx`

**State Management:**
```typescript
const [search, setSearch] = useState("");
const [sortBy, setSortBy] = useState("title-asc");
const [showAvailable, setShowAvailable] = useState(false);

const filteredBooks = useMemo(() => {
  let result = [...books];
  
  // Filtrowanie po tytule/autorze
  if (search) {
    result = result.filter(book => 
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.authors.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Filtrowanie dostępności
  if (showAvailable) {
    result = result.filter(book => book.available);
  }
  
  // Sortowanie
  result.sort((a, b) => {
    switch (sortBy) {
      case "title-asc": return a.title.localeCompare(b.title);
      case "title-desc": return b.title.localeCompare(a.title);
      default: return 0;
    }
  });
  
  return result;
}, [books, search, sortBy, showAvailable]);
```

### 3. FavoriteButton - Ulubione

**Ścieżka:** `app/_components/FavoriteButton.tsx`

**Optimistic Updates:**
```typescript
const [isFavorite, setIsFavorite] = useState(initialState);
const [loading, setLoading] = useState(false);

async function toggleFavorite() {
  setLoading(true);
  
  // Optimistic update
  const previousState = isFavorite;
  setIsFavorite(!isFavorite);
  
  try {
    if (isFavorite) {
      await fetch("/api/favorites?bookId=" + bookId, { method: "DELETE" });
    } else {
      await fetch("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ bookId })
      });
    }
  } catch (error) {
    // Rollback on error
    setIsFavorite(previousState);
    toast.error("Błąd operacji");
  } finally {
    setLoading(false);
  }
}
```

### 4. ReviewsSection - Recenzje

**Ścieżka:** `app/_components/ReviewsSection.tsx`

**Komponenty:**
- `BookRating` - Gwiazdki (1-5)
- `ReviewForm` - Formularz dodawania recenzji
- `ReviewsList` - Lista recenzji z paginacją

**Struktura:**
```tsx
<section>
  <header>
    <BookRating rating={averageRating} total={totalReviews} />
    {canReview && <ReviewForm onSubmit={handleSubmit} />}
  </header>
  
  <ReviewsList 
    reviews={reviews} 
    onDelete={handleDelete}
    currentUserId={user.id}
  />
  
  {hasMore && <LoadMoreButton onClick={loadMore} />}
</section>
```

---

## API Routes

### Request/Response Pattern

**Standard Response Format:**
```typescript
// Success
{
  data?: any;
  message?: string;
}

// Error
{
  error: string;
}
```

### Middleware Pattern

```typescript
// app/api/books/route.ts
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
  
  // 3. Walidacja body
  const body = await request.json();
  if (!body.title || !body.authors) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  
  // 4. Operacja na bazie
  try {
    const [result] = await pool.query(
      "INSERT INTO Ksiazki (Tytul, ...) VALUES (?, ...)",
      [body.title, ...]
    );
    
    return NextResponse.json({ 
      message: "Książka dodana",
      bookId: result.insertId 
    });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

### Error Handling

```typescript
// Centralized error handler
function handleDBError(error: any) {
  console.error("Database Error:", error);
  
  if (error.code === "ER_DUP_ENTRY") {
    return NextResponse.json({ 
      error: "Rekord już istnieje" 
    }, { status: 409 });
  }
  
  if (error.code === "ER_NO_REFERENCED_ROW") {
    return NextResponse.json({ 
      error: "Nieprawidłowe ID referencji" 
    }, { status: 400 });
  }
  
  return NextResponse.json({ 
    error: "Błąd serwera" 
  }, { status: 500 });
}
```

---

## Baza Danych

### Connection Pool

```typescript
// lib/db.ts
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
```

### Query Patterns

**Prepared Statements (Security):**
```typescript
// ✅ BEZPIECZNE - Prepared statement
const [rows] = await pool.query(
  "SELECT * FROM Ksiazki WHERE KsiazkaId = ?",
  [bookId]
);

// ❌ NIEBEZPIECZNE - SQL Injection
const [rows] = await pool.query(
  `SELECT * FROM Ksiazki WHERE KsiazkaId = ${bookId}`
);
```

**Transactions:**
```typescript
const connection = await pool.getConnection();

try {
  await connection.beginTransaction();
  
  // Operacja 1: Wypożycz książkę
  await connection.query(
    "INSERT INTO Wypozyczenia (UzytkownikId, KsiazkaId, ...) VALUES (?, ?, ...)",
    [userId, bookId, ...]
  );
  
  // Operacja 2: Zmniejsz dostępność
  await connection.query(
    "UPDATE Ksiazki SET DostepneEgzemplarze = DostepneEgzemplarze - 1 WHERE KsiazkaId = ?",
    [bookId]
  );
  
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

### Indexes

```sql
-- Performance optimization
CREATE INDEX idx_wypozyczenia_user ON Wypozyczenia(UzytkownikId);
CREATE INDEX idx_wypozyczenia_book ON Wypozyczenia(KsiazkaId);
CREATE INDEX idx_wypozyczenia_status ON Wypozyczenia(Status);
CREATE INDEX idx_ksiazki_isbn ON Ksiazki(numerISBN);
CREATE INDEX idx_uzytkownicy_email ON Uzytkownicy(Email);
```

---

## Optymalizacje

### 1. Server-Side Rendering (SSR)

**Dlaczego SSR?**
- ⚡ Szybsze pierwsze ładowanie (FCP)
- 🔍 Lepsze SEO
- 📱 Lepsza wydajność na słabych urządzeniach

**Przykład:**
```typescript
// app/page.tsx - Server Component
export default async function Page() {
  // Wykonuje się na serwerze
  const books = await getBooks();
  
  // HTML z danymi wysyłany do klienta
  return <CatalogContent books={books} />;
}
```

### 2. Lazy Loading

```typescript
// Dynamic imports dla ciężkich komponentów
const AdminPanel = dynamic(() => import("./AdminPanel"), {
  loading: () => <Skeleton />,
  ssr: false
});
```

### 3. Memoization

```typescript
// useMemo dla drogich obliczeń
const filteredBooks = useMemo(() => {
  return books.filter(/* ... */).sort(/* ... */);
}, [books, filters]);

// useCallback dla funkcji w zależnościach
const handleSearch = useCallback((query: string) => {
  setSearch(query);
}, []);
```

### 4. Database Query Optimization

**Problem: N+1 Queries**
```typescript
// ❌ Wolne - 1 + N zapytań
const books = await getBooks();
for (const book of books) {
  book.authors = await getAuthors(book.id);  // N zapytań
}

// ✅ Szybkie - 1 zapytanie z JOIN
const books = await pool.query(`
  SELECT 
    k.*,
    GROUP_CONCAT(a.ImieNazwisko SEPARATOR ', ') AS authors
  FROM Ksiazki k
  LEFT JOIN KsiazkiAutorzy ka ON ka.KsiazkaId = k.KsiazkaId
  LEFT JOIN Autorzy a ON a.AutorId = ka.AutorId
  GROUP BY k.KsiazkaId
`);
```

### 5. Caching Strategy

```typescript
// Next.js cache control
export const revalidate = 60; // Cache przez 60 sekund

// ISR (Incremental Static Regeneration)
export async function generateStaticParams() {
  const books = await getAllBookIds();
  return books.map(book => ({ id: book.id.toString() }));
}
```

---

## Testing (Przyszłość)

### Unit Tests
```typescript
// __tests__/components/FavoriteButton.test.tsx
import { render, fireEvent, waitFor } from "@testing-library/react";
import FavoriteButton from "@/app/_components/FavoriteButton";

describe("FavoriteButton", () => {
  it("toggles favorite state on click", async () => {
    const { getByRole } = render(<FavoriteButton bookId={1} />);
    const button = getByRole("button");
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toHaveClass("text-red-500");
    });
  });
});
```

### API Tests
```typescript
// __tests__/api/favorites.test.ts
import { POST } from "@/app/api/favorites/route";

describe("POST /api/favorites", () => {
  it("adds book to favorites", async () => {
    const request = new Request("http://localhost/api/favorites", {
      method: "POST",
      body: JSON.stringify({ bookId: 1 })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.message).toBe("Dodano do ulubionych");
  });
});
```

---

## Monitoring & Logs

### Server Logs
```typescript
// Centralized logging
function logAction(action: string, userId: number, details: string) {
  console.log(`[${new Date().toISOString()}] ${action} by User ${userId}: ${details}`);
  
  // Opcjonalnie: zapis do tabeli logs
  pool.query(
    "INSERT INTO system_logs (action, user_id, details, timestamp) VALUES (?, ?, ?, NOW())",
    [action, userId, details]
  );
}

// Użycie
logAction("BOOK_BORROWED", user.id, `Book ID: ${bookId}`);
```

### Error Tracking
```typescript
// Integracja z Sentry (przykład)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

try {
  // Code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

---

## Deployment Checklist

- [ ] Ustawione zmienne środowiskowe w produkcji
- [ ] JWT_SECRET losowy i bezpieczny (min. 32 znaki)
- [ ] Database connection pool skonfigurowany
- [ ] HTTPS włączony (secure cookies)
- [ ] CORS skonfigurowany dla produkcji
- [ ] Build przechodzi bez błędów (`npm run build`)
- [ ] Database migracje wykonane
- [ ] Backup bazy danych
- [ ] Monitoring i logi włączone
- [ ] Rate limiting na API endpoints

---

**Autor:** Wolowicz  
**Data:** 14 grudnia 2024  
**Wersja dokumentacji:** 1.0
