// app/page.tsx
import ClientFilter, { type BookVM } from "./_components/ClientFilter";
import AppShell from "./_components/AppShell";
import { headers } from "next/headers";
import { getUserSessionSSR } from "@/lib/auth-server";
import WelcomePage from "./welcome/page";
import { UserRole } from "@/lib/auth-client";

// Pobieranie książek z API
async function getBooks(): Promise<BookVM[]> {
  const h = await headers();
  const host = h.get("host")!;
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/api/books`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    console.error("Failed to fetch books:", res.status, await res.text());
    return [];
  }
  return res.json();
}

// Katalog owinięty w prosty wrapper
function CatalogContent({
  books,
  userRole,
}: {
  books: BookVM[];
  userRole: UserRole;
}) {
  const showReserveButton = userRole === "USER";

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Katalog Książek</h2>

<ClientFilter
  books={books}
  showReserveButton={showReserveButton}
  role={userRole}          // ⬅⬅⬅ TO BYŁO POMINIĘTE
/>
    </div>
  );
}


// Główna strona
export default async function Page() {
  const user = await getUserSessionSSR();

  if (!user) {
    return <WelcomePage />;
  }

  const books = await getBooks();

  return (
    <AppShell user={user}>
      <CatalogContent books={books} userRole={user.role} />
    </AppShell>
  );
}
