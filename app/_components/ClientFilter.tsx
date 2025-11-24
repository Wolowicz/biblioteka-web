"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { catalogUI } from "@/lib/ui/design";
import ReserveButton from "./ReserveButton";
import { UserRole } from "@/lib/auth-client";

export type BookVM = {
  id: number;
  title: string;
  authors: string;
  available: boolean;
};

export default function ClientFilter({
  books,
  showReserveButton,
  role, // ⬅⬅⬅ poprawny props
}: {
  books: BookVM[];
  showReserveButton: boolean;
  role: UserRole;
}) {
  const [q, setQ] = useState("");

  // ⬅⬅⬅ KLUCZOWA POPRAWKA
  const C = catalogUI[role];

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(s) ||
        b.authors.toLowerCase().includes(s)
    );
  }, [books, q]);

  return (
    <div className={C.wrapper}>
      {/* Pasek wyszukiwania */}
      <div className={C.searchRow}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj po tytule lub autorze..."
          className={C.searchInput}
        />
      </div>

      <div className={C.grid}>
        {filtered.map((b) => (
          <div key={b.id} className={C.card}>
            <h3 className={C.title}>{b.title}</h3>
            <p className={C.author}>{b.authors}</p>

            <span className={C.badge}>
              {b.available ? "Dostępna" : "Niedostępna"}
            </span>

            <div className={C.footerRow}>
              <Link href={`/books/${b.id}`} className={C.btnGhost}>
                Szczegóły
              </Link>

              {showReserveButton && (
                <ReserveButton bookId={b.id} available={b.available} />
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-600 text-center mt-8">Brak wyników</p>
      )}
    </div>
  );
}
