// app/borrowings/page.tsx
import { headers } from "next/headers";
import { getUserSessionSSR } from "@/lib/auth/server";
import BorrowingsList from "./BorrowingsList";
import BackButton from "@/app/_components/BackButton";

async function getBorrowings() {
  const h = await headers();
  const host = h.get("host")!;
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${protocol}://${host}/api/borrowings`, {
  cache: "no-store",
  credentials: "include",
  headers: {
    Cookie: h.get("cookie") || ""
  }
});



  if (!res.ok) return [];

  return res.json();
}

export default async function BorrowingsPage() {
    const user = await getUserSessionSSR();
  if (!user) return <div className="p-6">Musisz być zalogowana.</div>;

  const borrowings = await getBorrowings();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      <BackButton />

      <h1 className="text-4xl font-extrabold tracking-tight mt-6">
        Moje Wypożyczenia
      </h1>
      <p className="mt-2 text-gray-600">
        Przeglądaj swoje aktualne i historyczne wypożyczenia.
      </p>

      {/* Zakładki */}
      <div className="mt-6 flex items-center gap-3 bg-white border rounded-xl p-1 shadow-sm">
        <button className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
          Aktualne
        </button>
        <button className="px-4 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
          Historia
        </button>
      </div>

      {/* Lista wypożyczeń */}
      <BorrowingsList borrowings={borrowings} />
    </div>
  );
}
