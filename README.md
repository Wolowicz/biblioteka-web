
---

# BiblioteQ

1. Wprowadzenie
   Projekt „BiblioteQ” stanowi część systemu informatycznego przeznaczonego do zarządzania zasobami bibliotecznymi. Aplikacja została zaprojektowana jako moduł webowy, odpowiedzialny za obsługę interakcji użytkowników z funkcjonalnościami systemu bibliotecznego. Obejmują one logowanie, rejestrację, przeglądanie katalogu książek oraz wyświetlanie szczegółowych informacji bibliograficznych.

System został wykonany z wykorzystaniem technologii Next.js (React) z integracją z relacyjną bazą danych MySQL, co umożliwia stworzenie rozwiązania modularnego, skalowalnego i przystosowanego do dalszej rozbudowy.

2. Cel i zakres aplikacji
   Aplikacja ma na celu dostarczenie intuicyjnego i nowoczesnego interfejsu webowego umożliwiającego:

* rejestrację nowych użytkowników,
* logowanie oraz weryfikację poprawności hasła,
* przypisanie domyślnej roli użytkownika („czytelnik”),
* prezentację katalogu książek,
* wyświetlanie szczegółów wybranej pozycji,
* komunikację z bazą danych MySQL poprzez API.

Obecna wersja stanowi fundament systemu i jest przygotowana do integracji z modułami przeznaczonymi dla bibliotekarza i administratora.

3. Wykorzystane technologie
   Do realizacji projektu wykorzystano:

* Next.js 16 – framework oparty na React umożliwiający pracę z App Router,
* React 19 – biblioteka do budowy interfejsów użytkownika,
* TypeScript,
* TailwindCSS – mechanizm stylizacji oparty na klasach narzędziowych,
* MySQL – relacyjna baza danych,
* mysql2/promise – warstwa komunikacji z bazą,
* bcryptjs – hashowanie haseł,
* Node.js 20+.

Do zarządzania kodem źródłowym wykorzystano system Git oraz repozytorium GitHub.

4. Architektura aplikacji
   Aplikacja została zorganizowana zgodnie z architekturą modularną, obejmującą:

* warstwę prezentacji (komponenty Next.js),
* warstwę API (Route Handlers),
* warstwę logiki biznesowej (moduły w katalogu „lib”),
* warstwę danych (MySQL).

```
Struktura projektu: biblioteka-web/

│
├── app/                                # główna warstwa aplikacji (App Router)
│   │
│   ├── api/                            # warstwa API – obsługa logiki serwerowej
│   │   └── auth/                       # moduł uwierzytelniania
│   │       ├── login/
│   │       │   └── route.ts            # endpoint logowania (POST)
│   │       └── register/
│   │           └── route.ts            # endpoint rejestracji (POST)
│   │
│   ├── books/                          # moduł katalogu książek
│   │   └── [id]/                       # dynamiczny routing książek
│   │       └── page.tsx                # widok szczegółów książki
│   │
│   ├── login/
│   │   └── page.tsx                    # widok logowania
│   │
│   ├── register/
│   │   └── page.tsx                    # widok rejestracji
│   │
│   ├── layout.tsx                      # wspólny układ strony (layout root)
│   ├── page.tsx                        # strona główna aplikacji
│   └── globals.css                     # style globalne projektu
│
├── lib/                                # warstwa logiki aplikacji
│   ├── db.ts                           # konfiguracja połączenia z bazą MySQL
│   └── auth.ts                         # logika walidacji haseł i ról użytkowników
│
├── _components/                        # komponenty wielokrotnego użytku (UI logic)
│   ├── BackButton.tsx                  # komponent powrotu na poprzednią stronę
│   ├── ClientFilter.tsx                # komponent filtrów (wersja użytkownika)
│   └── ReserveButton.tsx               # logika przycisku „Zarezerwuj”
│
├── public/                             # zasoby publiczne projektu
│   ├── favicon.ico                     # ikona przeglądarki
│   └── biblio.png                      # grafika wykorzystywana jako favicon
│
├── .env.local                          # konfiguracja środowiskowa (dane dostępu)
├── .gitignore                          # pliki i katalogi ignorowane przez Git
├── package.json                        # zależności projektu i skrypty
├── tsconfig.json                       # konfiguracja TypeScript
└── README.md                           # dokumentacja projektu
```

5. Komunikacja z bazą danych
   Aplikacja wykorzystuje plik `.env.local` do konfiguracji połączenia:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=biblioteka

Połączenie realizowane jest przy użyciu mysql2/promise.
Komunikacja obejmuje m.in.:

* sprawdzanie istnienia użytkownika,
* zapisywanie nowego użytkownika,
* pobieranie danych książek,
* weryfikację hasła przy logowaniu.

6. Uwierzytelnianie i bezpieczeństwo
   Mechanizm logowania obejmuje:

* odczyt danych z formularza,
* walidację poprawności,
* porównanie hasła podanego z hashem zapisanym w bazie,
* zwrócenie danych użytkownika wraz z jego rolą.

Walidacja hasła uwzględnia wymagania:

* minimum 8 znaków,
* co najmniej jedna wielka litera,
* co najmniej jedna mała litera,
* co najmniej jedna cyfra,
* co najmniej jeden znak specjalny.

Rejestracja przypisuje użytkownikowi rolę „CZYTELNIK”.

7. Moduł książek
   Moduł katalogu obejmuje:

* pobieranie listy książek,
* wyświetlanie szczegółów pozycji,
* prezentację informacji bibliograficznych.

Dane pobierane są poprzez endpoint API odpowiedzialny za zapytanie do bazy.

8. Uruchamianie aplikacji
   Instalacja zależności:

npm install

Konfiguracja bazy danych poprzez plik `.env.local`.

Uruchamianie aplikacji:

npm run dev

Dostęp przez przeglądarkę:

[http://localhost:3000](http://localhost:3000)

9. Możliwości rozbudowy
   Projekt został przygotowany do implementacji kolejnych modułów, takich jak:

* pełny system wypożyczeń i zwrotów,
* panel użytkownika (zarządzanie profilem),
* panel bibliotekarza (magazyn, egzemplarze),
* panel administratora (zarządzanie użytkownikami, logi),
* system recenzji z moderacją,
* generowanie dokumentów PDF,
* historia działań użytkowników,
* kosz i przywracanie danych.

10. Podsumowanie
    BiblioteQ stanowi solidną podstawę systemu bibliotecznego, zapewniając niezbędne funkcjonalności w zakresie zarządzania użytkownikami oraz katalogiem książek. Architektura aplikacji umożliwia stopniową rozbudowę o kolejne moduły oraz integrację z bardziej zaawansowanymi funkcjami systemu bibliotecznego.

---