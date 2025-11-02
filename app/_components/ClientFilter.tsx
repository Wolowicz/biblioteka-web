"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type BookVM = { id: number; title: string; authors: string; available: boolean };

export default function ClientFilter({ books }: { books: BookVM[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return books.filter(
      b => b.title.toLowerCase().includes(s) || b.authors.toLowerCase().includes(s)
    );
  }, [q, books]);

  return (
    <>
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
            <div className="text-sm text-gray-600">{b.authors}</div>
            <span className="text-xs bg-gray-200 inline-block px-2 py-1 rounded mt-2">
              {b.available ? "Dostępna" : "Niedostępna"}
            </span>
            <div>
              <Link className="mt-3 inline-block underline" href={`/books/${b.id}`}>
                Szczegóły
              </Link>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-600">Brak wyników</p>}
      </div>
    </>
  );
}
