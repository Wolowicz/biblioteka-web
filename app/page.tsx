"use client";
import { useMemo, useState } from "react";

type Book = { id: string; title: string; author: string; available: boolean };

const initial: Book[] = [
  { id: "1", title: "Pan Tadeusz", author: "A. Mickiewicz", available: true },
  { id: "2", title: "Quo Vadis", author: "H. Sienkiewicz", available: false },
  { id: "3", title: "Lalka", author: "B. Prus", available: true },
];

export default function Page() {
  const [q, setQ] = useState("");
  const [books, setBooks] = useState<Book[]>(initial);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return books.filter(b => b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s));
  }, [q, books]);

  const reserve = (b: Book) => {
    alert(b.available ? `Zarezerwowano: ${b.title}` : "Egzemplarz niedostępny");
  };

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Katalog</h1>
      <input
        className="w-full border p-3 rounded"
        placeholder="Szukaj tytułu lub autora…"
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <div className="space-y-3">
        {filtered.map(b => (
          <div key={b.id} className="border rounded p-4">
            <div className="font-semibold">{b.title}</div>
            <div className="text-sm text-gray-600">{b.author}</div>
            <div className="text-xs bg-gray-200 inline-block px-2 py-1 rounded mt-2">
              {b.available ? "Dostępna" : "Niedostępna"}
            </div>
            <button className="mt-3 bg-black text-white px-3 py-2 rounded" onClick={() => reserve(b)}>
              Zarezerwuj
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-600">Brak wyników</p>}
      </div>
    </main>
  );
}
