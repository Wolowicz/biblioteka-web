// app/page.tsx
import { headers } from "next/headers";
import { getUserSessionSSR } from "@/lib/auth/server";
import WelcomePage from "./welcome/page";
import AppShell from "./_components/AppShell";
import ClientFilter from "./_components/ClientFilter";
import type { BookVM } from "./_components/ClientFilter";


// Pobieranie książek z API
async function getBooks(): Promise<BookVM[]> {
  const h = await headers();
  const host = h.get("host")!;
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/api/books`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    console.error("BOOK API ERROR:", res.status);
    return [];
  }

  return res.json();
}

export default async function Page() {
  // Sesja użytkownika (SSR)
  const user = await getUserSessionSSR();

  // Niezalogowany → strona powitalna
  if (!user) {
    return <WelcomePage />;
  }

  // Zalogowany → pobieramy książki
  const books = await getBooks();

  return (
    <AppShell user={user}>
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Katalog Książek
        </h2>

        <ClientFilter
          books={books}
          showReserveButton={user.role === "USER"}
          role={user.role}
        />
      </div>
    </AppShell>
  );
}
