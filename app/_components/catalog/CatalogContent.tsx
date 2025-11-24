"use client";

import React, { useState, useMemo } from "react";
import { catalogUI } from "@/lib/ui/design";
import Link from "next/link";
import { UserRole } from "@/lib/auth-client";

interface Book {
  id: number;
  Tytul: string;
  Autor: string;
  Dostepna: boolean;
  Kategoria?: string;
}

export default function CatalogContent({
  books,
  userRole,
}: {
  books: Book[];
  userRole: UserRole;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const C = catalogUI[userRole]; // <<< kluczowe

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchSearch =
        book.Tytul.toLowerCase().includes(search.toLowerCase()) ||
        book.Autor.toLowerCase().includes(search.toLowerCase());

      const matchCategory = !category || book.Kategoria === category;
      return matchSearch && matchCategory;
    });
  }, [books, search, category]);

  return (
    <div className={C.wrapper}>
      {/* Pasek wyszukiwania */}
      <div className={C.searchRow}>
        <input
          type="text"
          placeholder="Szukaj książek..."
          className={C.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className={C.searchInput}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Wszystkie kategorie</option>
          <option value="Fantastyka">Fantastyka</option>
          <option value="Historia">Historia</option>
        </select>
      </div>

      {/* Siatka kart */}
      <div className={C.grid}>
        {filteredBooks.map((book) => (
          <div key={book.id} className={C.card}>
            <h3 className={C.title}>{book.Tytul}</h3>
            <p className={C.author}>Autor: {book.Autor}</p>

            <span className={C.badge}>
              {book.Dostepna ? "Dostępna" : "Niedostępna"}
            </span>

            <div className={C.footerRow}>
              <Link href={`/books/${book.id}`} className={C.btnGhost}>
                Szczegóły
              </Link>

              {book.Dostepna && (
                <button className={C.btnPrimary}>Wypożycz</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <p className="text-gray-600 text-center mt-12">
          Brak wyników wyszukiwania
        </p>
      )}
    </div>
  );
}
