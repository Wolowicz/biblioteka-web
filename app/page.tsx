/**
 * =============================================================================
 * HOME PAGE - Strona główna aplikacji
 * =============================================================================
 * 
 * Główna strona aplikacji bibliotecznej. Jest to Server Component (SSR),
 * który decyduje co wyświetlić na podstawie stanu autoryzacji użytkownika.
 * 
 * Logika routingu:
 * - Niezalogowany użytkownik → strona powitalna (WelcomePage)
 * - Admin/Bibliotekarz → przekierowanie na /admin/dashboard
 * - Zalogowany użytkownik → katalog książek (AppShell + ClientFilter)
 * 
 * Przepływ danych:
 * 1. Pobierz sesję użytkownika z cookie (SSR)
 * 2. Jeśli brak sesji → renderuj WelcomePage
 * 3. Jeśli ADMIN lub LIBRARIAN → redirect("/admin/dashboard")
 * 4. Jeśli sesja istnieje → pobierz książki z API
 * 5. Renderuj AppShell z katalogiem książek
 * 
 * Zależności:
 * - @/lib/auth/server - pobieranie sesji SSR
 * - @/domain/types - typy danych (BookViewModel)
 * - ./welcome/page - strona powitalna
 * - ./_components/AppShell - główny layout dla zalogowanych
 * - ./_components/ClientFilter - filtrowanie i wyświetlanie książek
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserSessionSSR } from "@/lib/auth/server";
import WelcomePage from "./welcome/page";
import AppShell from "./_components/AppShell";
import ClientFilter from "./_components/ClientFilter";
import type { BookViewModel } from "@/domain/types";

// =============================================================================
// FUNKCJE POMOCNICZE (SERVER-SIDE)
// =============================================================================

/**
 * Pobiera listę wszystkich książek z API.
 * 
 * Funkcja jest wywoływana po stronie serwera (SSR) i używa
 * bezwzględnego URL zbudowanego z nagłówka Host.
 * 
 * @returns Promise z tablicą książek lub pustą tablicą w przypadku błędu
 * 
 * Uwagi:
 * - cache: "no-store" - zawsze pobiera świeże dane
 * - W development używa http://, w produkcji https://
 * - W przypadku błędu loguje do konsoli i zwraca pustą tablicę
 */
async function getBooks(): Promise<BookViewModel[]> {
  // Pobierz nagłówki żądania (potrzebne do zbudowania URL)
  const h = await headers();
  const host = h.get("host")!;
  
  // Ustal protokół na podstawie środowiska
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  // Zbuduj pełny URL do API
  const url = `${protocol}://${host}/api/books`;

  try {
    // Wykonaj żądanie do API
    const res = await fetch(url, { cache: "no-store" });

    // Sprawdź czy odpowiedź jest poprawna
    if (!res.ok) {
      console.error("BOOK API ERROR:", res.status);
      return [];
    }

    // Parsuj dane JSON
    const data = await res.json();
    
    // Zwróć tablicę książek z obiektu odpowiedzi
    return data.books || data || [];
  } catch (error) {
    // Obsłuż błąd sieciowy
    console.error("BOOK API NETWORK ERROR:", error);
    return [];
  }
}

// =============================================================================
// KOMPONENT STRONY
// =============================================================================

/**
 * Główna strona aplikacji.
 * 
 * Server Component - cała logika wykonuje się na serwerze.
 * 
 * @returns JSX strony (WelcomePage lub AppShell z katalogiem)
 */
export default async function Page() {
  // ---------------------------------------------------------------------------
  // 1. POBIERZ SESJĘ UŻYTKOWNIKA (z cookie)
  // ---------------------------------------------------------------------------
  const user = await getUserSessionSSR();

  // ---------------------------------------------------------------------------
  // 2. ROUTING NA PODSTAWIE AUTORYZACJI
  // ---------------------------------------------------------------------------
  
  // Niezalogowany użytkownik → strona powitalna
  if (!user) {
    return <WelcomePage />;
  }

  // Admin lub Bibliotekarz → przekieruj na dashboard
  if (user.role === "ADMIN" || user.role === "LIBRARIAN") {
    redirect("/admin/dashboard");
  }

  // ---------------------------------------------------------------------------
  // 3. ZALOGOWANY UŻYTKOWNIK → POBIERZ DANE I RENDERUJ KATALOG
  // ---------------------------------------------------------------------------
  
  // Pobierz listę książek z API
  const books = await getBooks();

  return (
    <AppShell user={user}>
      {/* Komponent filtrowania i wyświetlania książek (Client Component) */}
      <ClientFilter
        books={books}
        showReserveButton={user.role === "READER"}
        role={user.role}
      />
    </AppShell>
  );
}
