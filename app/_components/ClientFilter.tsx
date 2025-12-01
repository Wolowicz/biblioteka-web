"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UserRole } from "@/lib/auth/index";
import ReserveButton from "./ReserveButton";

export type BookVM = {
  id: number;
  title: string;
  authors: string;
  available: boolean;
  coverUrl?: string;
};

export default function ClientFilter({
  books,
  showReserveButton,
  role,
}: {
  books: BookVM[];
  showReserveButton: boolean;
  role: UserRole;
}) {
  const [q, setQ] = useState("");

  // Filtry
  const [category, setCategory] = useState("Wszystkie");
  const [status, setStatus] = useState("Wszystkie");
  const [sort, setSort] = useState("Popularność");

  // Paginacja
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filtrowanie i sortowanie
  const filtered = useMemo(() => {
    let result = books;
    const s = q.toLowerCase();

    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(s) ||
        b.authors.toLowerCase().includes(s)
    );

    if (status !== "Wszystkie") {
      result = result.filter((b) =>
        status === "Dostępne" ? b.available : !b.available
      );
    }

    if (sort === "Tytuł A-Z") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sort === "Tytuł Z-A") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [books, q, category, status, sort]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // ---------- THEME DLA RÓL ----------
  const isAdmin = role === "ADMIN";
  const isLibrarian = role === "LIBRARIAN";
  const isUser = role === "USER";

  const cardClass = `
    group relative p-5 rounded-2xl shadow-xl border backdrop-blur-sm transition-all
    ${isAdmin ? "bg-[#282828]/70 border-gray-600" : ""}
    ${isLibrarian ? "bg-white/90 border-gray-300" : ""}
    ${isUser ? "bg-white/95 border-gray-200" : ""}
    hover:shadow-2xl hover:-translate-y-1
  `;

  const titleTheme = isAdmin ? "text-gray-100" : "text-gray-900";
  const authorTheme = isAdmin ? "text-gray-400" : "text-gray-600";
  const linkTheme = isAdmin ? "text-blue-300" : "text-blue-600";

  return (
    <div className="space-y-8">

      {/* WYSZUKIWARKA */}
      <div className="relative">
        <i className="fas fa-search absolute left-4 top-4 text-gray-500"></i>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj po tytule, autorze lub ISBN..."
          className="w-full px-12 py-3 rounded-xl border border-gray-300 focus:ring-blue-600 focus:border-blue-600 bg-white shadow-sm text-gray-900"
        />
      </div>

      {/* FILTRY */}
      <div className="flex flex-wrap gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 shadow-sm"
        >
          <option>Wszystkie</option>
          <option>Fantastyka</option>
          <option>Klasyka</option>
          <option>Dla dzieci</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 shadow-sm"
        >
          <option>Wszystkie</option>
          <option>Dostępne</option>
          <option>Niedostępne</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 shadow-sm"
        >
          <option>Popularność</option>
          <option>Tytuł A-Z</option>
          <option>Tytuł Z-A</option>
        </select>
      </div>

      {/* LISTA KSIĄŻEK */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">

        {paginated.map((b) => (
          <div key={b.id} className={cardClass}>

            {/* OKŁADKA */}
            <div
              className="
                w-full h-56 rounded-xl overflow-hidden
                bg-linear-to-br from-gray-100 to-gray-200
                flex items-center justify-center text-gray-400 text-sm
              "
            >
              <img
  src={b.coverUrl || "/biblio.png"}
  alt={b.title}
  className="object-cover w-full h-full transition-transform group-hover:scale-105"
/>

            </div>

            {/* TYTUŁ + AUTOR */}
            <h3 className={`mt-4 font-semibold text-lg leading-tight ${titleTheme}`}>
              {b.title}
            </h3>

            <p className={`text-sm mt-1 opacity-80 ${authorTheme}`}>
              {b.authors}
            </p>

            {/* STATUS */}
            <span
              className={`
                inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full
                ${b.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
              `}
            >
              {b.available ? "Dostępna" : "Niedostępna"}
            </span>

            {/* AKCJE */}
            {/* AKCJE */}
<div className="flex items-center justify-between mt-5">

  {/* Szczegóły */}
  <Link
    href={`/books/${b.id}`}
    className={`text-sm font-medium hover:underline ${linkTheme}`}
  >
    Szczegóły
  </Link>

  <div className="flex items-center gap-2">

    {/* USER */}


{role === "USER" && (
  <ReserveButton bookId={b.id} available={b.available} />
)}


    {/* LIBRARIAN */}
    {role === "LIBRARIAN" && (
      <button
        className="
          px-3 py-1.5 rounded-lg text-xs font-semibold 
          bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-1
        "
      >
        <i className="fas fa-cog text-sm"></i>
        Zarządzaj
      </button>
    )}

    {/* ADMIN */}
    {role === "ADMIN" && (
      <>
        {/* EDYTUJ - mały */}
        <button
          className="
            px-3 py-1.5 rounded-lg text-xs font-semibold 
            bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1
          "
        >
          <i className="fas fa-edit text-sm"></i>
          Edytuj
        </button>

        {/* USUŃ - tylko ikona */}
        <button
          className="
            p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white 
            flex items-center justify-center
          "
          onClick={() => confirm("Usunąć książkę?")}
          title="Usuń"
        >
          <i className="fas fa-trash text-sm"></i>
        </button>
      </>
    )}
  </div>

</div>

          </div>
        ))}

        {paginated.length === 0 && (
          <p className="text-center text-gray-500 col-span-full py-10">
            Brak wyników
          </p>
        )}
      </div>

      {/* PAGINACJA */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 rounded-full bg-white border shadow hover:bg-gray-50"
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`
                px-4 py-2 rounded-full
                ${
                  page === i + 1
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white border shadow hover:bg-gray-100"
                }
              `}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-2 rounded-full bg-white border shadow hover:bg-gray-50"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
