Wprowadzenie
Projekt „BiblioteQ” stanowi część systemu informatycznego przeznaczonego do zarządzania zasobami bibliotecznymi. Aplikacja została zaprojektowana jako moduł webowy, odpowiedzialny za obsługę interakcji użytkowników z funkcjonalnościami systemu bibliotecznego. Obejmują one logowanie, rejestrację, przeglądanie katalogu książek oraz wyświetlanie szczegółowych informacji bibliograficznych.

System został wykonany z wykorzystaniem technologii Next.js (React) z integracją z relacyjną bazą danych MySQL, co umożliwia stworzenie rozwiązania modularnego, skalowalnego i przystosowanego do dalszej rozbudowy.

Cel i zakres aplikacji
Aplikacja ma na celu dostarczenie intuicyjnego i nowoczesnego interfejsu webowego umożliwiającego:

rejestrację nowych użytkowników,

logowanie oraz weryfikację poprawności hasła,

przypisanie domyślnej roli użytkownika („czytelnik”),

prezentację katalogu książek,

wyświetlanie szczegółów wybranej pozycji,

komunikację z bazą danych MySQL poprzez API.

Obecna wersja stanowi fundament systemu i jest przygotowana do integracji z modułami przeznaczonymi dla bibliotekarza i administratora.

Wykorzystane technologie
Do realizacji projektu wykorzystano:

Next.js 16 – framework oparty na React umożliwiający pracę z App Router,

React 19 – biblioteka do budowy interfejsów użytkownika,

TypeScript,

TailwindCSS – mechanizm stylizacji oparty na klasach narzędziowych,

MySQL – relacyjna baza danych,

mysql2/promise – warstwa komunikacji z bazą,

bcryptjs – hashowanie haseł,

Node.js 20+.

Do zarządzania kodem źródłowym wykorzystano system Git oraz repozytorium GitHub.

Architektura aplikacji
Aplikacja została zorganizowana zgodnie z architekturą modularną, obejmującą:

warstwę prezentacji (komponenty Next.js),

warstwę API (Route Handlers),

warstwę logiki biznesowej (moduły w katalogu „lib”),

warstwę danych (MySQL).

Struktura projektu:

app/
├── api/
│ └── auth/
│ ├── login/route.ts
│ └── register/route.ts
├── login/page.tsx
├── register/page.tsx
├── books/
│ └── [id]/page.tsx
├── layout.tsx
├── page.tsx
└── globals.css

lib/
├── db.ts
└── auth.ts

_components/
├── BackButton.tsx
├── ClientFilter.tsx
└── ReserveButton.tsx

Komunikacja z bazą danych
Aplikacja wykorzystuje plik .env.local do konfiguracji połączenia:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=biblioteka

Połączenie realizowane jest przy użyciu mysql2/promise.
Komunikacja obejmuje m.in.:

sprawdzanie istnienia użytkownika,

zapisywanie nowego użytkownika,

pobieranie danych książek,

weryfikację hasła przy logowaniu.

Uwierzytelnianie i bezpieczeństwo
Mechanizm logowania obejmuje:

odczyt danych z formularza,

walidację poprawności,

porównanie hasła podanego z hashem zapisanym w bazie,

zwrócenie danych użytkownika wraz z jego rolą.

Walidacja hasła uwzględnia wymagania:

minimum 8 znaków,

co najmniej jedna wielka litera,

co najmniej jedna mała litera,

co najmniej jedna cyfra,

co najmniej jeden znak specjalny.

Rejestracja przypisuje użytkownikowi rolę „CZYTELNIK”.

Moduł książek
Moduł katalogu obejmuje:

pobieranie listy książek,

wyświetlanie szczegółów pozycji,

prezentację informacji bibliograficznych.

Dane pobierane są poprzez endpoint API odpowiedzialny za zapytanie do bazy.

Uruchamianie aplikacji
Instalacja zależności:

npm install

Konfiguracja bazy danych poprzez plik .env.local.

Uruchamianie aplikacji:

npm run dev

Dostęp przez przeglądarkę:

http://localhost:3000

Możliwości rozbudowy
Projekt został przygotowany do implementacji kolejnych modułów, takich jak:

pełny system wypożyczeń i zwrotów,

panel użytkownika (zarządzanie profilem),

panel bibliotekarza (magazyn, egzemplarze),

panel administratora (zarządzanie użytkownikami, logi),

system recenzji z moderacją,

generowanie dokumentów PDF,

historia działań użytkowników,

kosz i przywracanie danych.

Podsumowanie
BiblioteQ stanowi solidną podstawę systemu bibliotecznego, zapewniając niezbędne funkcjonalności w zakresie zarządzania użytkownikami oraz katalogiem książek. Architektura aplikacji umożliwia stopniową rozbudowę o kolejne moduły oraz integrację z bardziej zaawansowanymi funkcjami systemu bibliotecznego.