// app/page.tsx
import ClientFilter, { type BookVM } from "./_components/ClientFilter";
import AppShell from "./_components/AppShell";
import { headers } from "next/headers";
import AuthRedirect from "./_components/AuthRedirect"; // ⬅️ NOWOŚĆ: Utworzymy ten komponent do obsługi przekierowania

// ⬅️ Funkcja serwerowa do pobierania listy książek (używa już API)
async function getBooks(): Promise<BookVM[]> {
  // pełny URL na serwerze
  const h = await headers();
  const host = h.get("host")!;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/api/books`;

  // Pobieram książki z backendu.
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    console.error("Failed to fetch books:", res.status, await res.text());
    // Jeśli nie można załadować, zwracamy pustą listę zamiast błędu
    return []; 
  }
  return res.json();
}

// ⬅️ Komponent Katalogu do owinięcia logiki ładowania
function CatalogContent({ books }: { books: BookVM[] }) {
    return (
        <div className="space-y-4">
            <ClientFilter books={books} />
        </div>
    );
}

// ⬅️ Główny komponent strony głównej
export default async function Page() {
  // 1. POBIERANIE DANYCH (Asynchronicznie po stronie serwera)
  const books = await getBooks();

  // 2. WERYFIKACJA AUTORYZACJI:
  // Zamiast weryfikować tutaj (bo to komponent serwerowy),
  // użyjemy AuthRedirect (komponent kliencki), który sprawdzi sesję.

  return (
    // AuthRedirect sprawdzi, czy użytkownik jest zalogowany. 
    // Jeśli nie, przekieruje do /login i przerwie renderowanie AppShell.
    <AuthRedirect>
        {/* ⬅️ Przekazujemy dane z bazy do komponentu klienckiego */}
        <AppShell> 
            <CatalogContent books={books} />
        </AppShell>
    </AuthRedirect>
  );
}