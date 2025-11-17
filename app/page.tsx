// app/page.tsx
import ClientFilter, { type BookVM } from "./_components/ClientFilter";
import { headers } from "next/headers";

async function getBooks(): Promise<BookVM[]> {//Funkcja serwerowa do pobierania listy książek.
  // pełny URL na serwerze
  const h = await headers();
  const host = h.get("host")!;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/api/books`;

  const res = await fetch(url, { cache: "no-store" });//Pobieram książki z backendu.
  if (!res.ok) throw new Error("Failed to load books");
  return res.json();
}

export default async function Page() {
  const books = await getBooks();
  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Katalog</h1>
      <ClientFilter books={books} />
    </main>
  );//Serwerowy komponent strony głównej.Potem przekazuję listę książek do ClientFilter, który robi wyszukiwarkę.
}
