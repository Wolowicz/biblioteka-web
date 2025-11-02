# 📚 Biblioteka Web App (Demo)

Aplikacja webowa będąca częścią projektu **systemu zarządzania biblioteką**.  
Pozwala przeglądać katalog książek, wyświetlać szczegóły pozycji oraz symulować proces rezerwacji.  
Projekt zrealizowany w ramach pracy inżynierskiej – **Uniwersytet Kazimierza Wielkiego**.  
Frontend oparty na **Next.js 16 (App Router)** z użyciem **TypeScript + TailwindCSS**.

---

## 🧩 Funkcjonalności (wersja demo)

- 🔍 Przeglądanie listy książek z filtrowaniem po tytule i autorze  
- 📘 Strona szczegółów książki (tytuł, autor, ISBN, wydawnictwo, rok, dostępność)  
- 🔙 Przycisk **Powrót** do katalogu  
- 🪄 Przycisk **„Zarezerwuj (demo)”** z komunikatem potwierdzającym  
- ⚙️ Mock API (`app/api/books`) — dane z pliku `books.ts`  
- 🌈 Stylowanie w TailwindCSS  

---

## ⚙️ Technologie

| Warstwa | Technologia |
|----------|--------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Stylowanie | TailwindCSS |
| Mock API | Next.js Route Handlers |
| Zarządzanie stanem | React Hooks (useState, useMemo) |
| Kontrola wersji | Git + GitHub |
| Środowisko | Node.js 20+ |

---

## 🚀 Uruchomienie projektu lokalnie

### 1️⃣ Sklonuj repozytorium
```bash
git clone https://github.com/Wolowicz/biblioteka-web.git
cd biblioteka-web
```

### 2️⃣ Zainstaluj zależności
```bash
npm install
```

### 3️⃣ Uruchom w trybie deweloperskim
```bash
npm run dev
```

Aplikacja dostępna będzie pod adresem:  
👉 http://localhost:3000

---

## 📂 Struktura projektu

```
app/
 ├── _components/
 │    ├── BackButton.tsx       # przycisk "Powrót"
 │    ├── ClientFilter.tsx     # filtrowanie książek
 │    └── ReserveButton.tsx    # przycisk "Zarezerwuj (demo)"
 │
 ├── _data/
 │    └── books.ts             # przykładowe dane książek
 │
 ├── api/
 │    └── books/
 │         ├── route.ts        # GET /api/books
 │         └── [id]/route.ts   # GET /api/books/[id]
 │
 ├── books/
 │    └── [id]/page.tsx        # strona szczegółów książki
 │
 ├── globals.css
 ├── layout.tsx
 └── page.tsx                  # strona główna katalogu
```

---

## 🧠 Jak to działa

- `/api/books` — zwraca listę książek (mock z pliku `books.ts`)
- `/api/books/[id]` — zwraca szczegóły jednej książki
- `/` — wyświetla katalog z wyszukiwarką
- `/books/[id]` — pokazuje dane książki i przyciski akcji
- przycisk **Zarezerwuj (demo)** wyświetla komunikat o powodzeniu

---

## 🔒 Bezpieczeństwo repozytorium

Repo nie zawiera:
```
node_modules/
.next/
.env.local
.vercel/
```

Wszystkie dane konfiguracyjne trzymane są lokalnie (lub w pliku `.env`, który jest ignorowany przez Git).

---

## 🗃️ Jak podłączyć bazę danych (MySQL + Prisma)

Poniżej instrukcja, jak zastąpić mock API prawdziwą bazą danych MySQL z użyciem ORM Prisma.

### 1️⃣ Instalacja Prisma i zależności
```bash
npm i prisma @prisma/client mysql2
npx prisma init
```

To utworzy folder `prisma/` i plik `.env`.

### 2️⃣ Konfiguracja połączenia z bazą
W pliku `.env`:
```
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/NAZWA_BAZY?connection_limit=5"
```

W repozytorium dodaj przykładowy plik `.env.example`:
```
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DBNAME
```

### 3️⃣ Modele Prisma (schema.prisma)
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Ksiazki {
  KsiazkaId           Int      @id @default(autoincrement())
  numerISBN           String?  @db.VarChar(20)
  Tytul               String   @db.VarChar(300)
  Wydawnictwo         String?  @db.VarChar(200)
  Rok                 Int?
  iloscStron          Int?
  LiczbaEgzemplarzy   Int
  DostepneEgzemplarze Int
  autorzy             KsiazkiAutorzy[]

  @@map("Ksiazki")
}

model Autorzy {
  AutorId   Int              @id @default(autoincrement())
  Imie      String           @db.VarChar(255)
  Nazwisko  String           @db.VarChar(255)
  ksiazki   KsiazkiAutorzy[]

  @@map("Autorzy")
}

model KsiazkiAutorzy {
  KsiazkaId Int
  AutorId   Int
  ksiazka   Ksiazki @relation(fields: [KsiazkaId], references: [KsiazkaId])
  autor     Autorzy @relation(fields: [AutorId], references: [AutorId])
  @@id([KsiazkaId, AutorId])
  @@map("KsiazkiAutorzy")
}
```

Jeśli baza już istnieje:
```bash
npx prisma db pull
npx prisma generate
```
Jeśli dopiero tworzysz schemat:
```bash
npx prisma migrate dev --name init
```

### 4️⃣ Przykładowe API z Prisma

**`app/api/books/route.ts`**
```ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.ksiazki.findMany({
    select: {
      KsiazkaId: true,
      Tytul: true,
      DostepneEgzemplarze: true,
      autorzy: { select: { autor: { select: { Imie: true, Nazwisko: true }}}}
    },
    orderBy: { Tytul: "asc" }
  });

  const data = rows.map(r => ({
    id: r.KsiazkaId,
    title: r.Tytul,
    authors: r.autorzy.map(a => `${a.autor.Imie} ${a.autor.Nazwisko}`).join(", "),
    available: r.DostepneEgzemplarze > 0
  }));

  return NextResponse.json(data);
}
```

**`app/api/books/[id]/route.ts`**
```ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }

  const r = await prisma.ksiazki.findUnique({
    where: { KsiazkaId: numericId },
    select: {
      KsiazkaId: true, Tytul: true, numerISBN: true,
      Wydawnictwo: true, Rok: true, DostepneEgzemplarze: true,
      autorzy: { select: { autor: { select: { Imie: true, Nazwisko: true }}}}
    }
  });

  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: r.KsiazkaId,
    title: r.Tytul,
    isbn: r.numerISBN,
    publisher: r.Wydawnictwo,
    year: r.Rok,
    authors: r.autorzy.map(a => `${a.autor.Imie} ${a.autor.Nazwisko}`).join(", "),
    available: r.DostepneEgzemplarze > 0
  });
}
```

### 5️⃣ Użycie w Next.js (Server Components)
W komponentach serwerowych zawsze buduj **pełny URL**:
```ts
import { headers } from "next/headers";
const h = await headers();
const host = h.get("host")!;
const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
const url = `${protocol}://${host}/api/books`;
```

### 6️⃣ Na produkcji (np. Vercel)
W ustawieniach projektu (Settings → Environment Variables) dodaj:
```
DATABASE_URL = mysql://USER:PASSWORD@HOST:3306/NAZWA_BAZY
```

---

## 👩‍💻 Autorzy
**Patrycja Wołowicz i Rafał Grabowski**  
Projekt  – Uniwersytet Kazimierza Wielkiego  
Repozytorium: [github.com/Wolowicz/biblioteka-web](https://github.com/Wolowicz/biblioteka-web)

---

## 📜 Licencja
Projekt demonstracyjny – wyłącznie do celów edukacyjnych.
