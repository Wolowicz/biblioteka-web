// app/_components/ClientFilter.tsx
"use client";//filtrownie po stronie klienta

import { useMemo, useState } from "react";
import Link from "next/link";
import { bookCardStyles } from "@/lib/ui/styles"; // Importujemy scentralizowane style

export type BookVM = { id: number; title: string; authors: string; available: boolean };
//Typ TypeScript opisujący widok książki (VM = ViewModel)

export default function ClientFilter({ books }: { books: BookVM[] }) {
  const [q, setQ] = useState(""); //q – aktualna wartość wpisana przez użytkownika w polu wyszukiwania.
  const filtered = useMemo(() => { //zapamiętuje wynik, aby nie filtrować książek po każdym drobiazgu.
    const s = q.toLowerCase();
    return books.filter(
      b => b.title.toLowerCase().includes(s) || b.authors.toLowerCase().includes(s)
    );
  }, [q, books]);

  return (
    <>
      <input
        className={bookCardStyles.input} // ⬅️ Użycie stałej
        placeholder="Szukaj tytułu lub autora…"
        value={q}
        onChange={e => setQ(e.target.value)}
        //każde wpisanie znaku aktualizuje q, a to z kolei uruchamia useMemo i filtruje wyniki
      />
      <div className="space-y-3">
        {filtered.map(b => (
          //Wyświetlamy listę przefiltrowanych książek.
          <div key={b.id} className={bookCardStyles.wrapper}> 
            <div className={bookCardStyles.title}>{b.title}</div> 
            <div className={bookCardStyles.authors}>{b.authors}</div> 
            <span className={bookCardStyles.badgeAvailable}> 
              {b.available ? "Dostępna" : "Niedostępna"}
            </span>
            <div>
              <Link className={bookCardStyles.link} href={`/books/${b.id}`}> 
                Szczegóły
              </Link>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className={bookCardStyles.noResults}>Brak wyników</p>} 
      </div>
    </>
  );
}