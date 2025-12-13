/**
 * =============================================================================
 * CLIENT FILTER - Komponent filtrowania i wyświetlania katalogu książek
 * =============================================================================
 * 
 * Nowoczesny katalog książek z designem inspirowanym materiałami projektu.
 * Zawiera wyszukiwarkę, filtry kategorii, karty książek z efektami hover.
 * 
 * @packageDocumentation
 */

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BookViewModel, UserRole, ClientFilterProps } from "@/domain/types";
import ReserveButton from "./ReserveButton";

export type BookVM = BookViewModel;

// =============================================================================
// STAŁE
// =============================================================================

const PAGE_SIZE = 10;
const CATEGORY_OPTIONS = ["Wszystkie", "Fantastyka", "Klasyka", "Dla dzieci", "Informatyka", "Biznes"];
const STATUS_OPTIONS = ["Wszystkie", "Dostępne", "Niedostępne"];
const SORT_OPTIONS = ["Popularność", "Tytuł A-Z", "Tytuł Z-A"];

// =============================================================================
// KOMPONENT GŁÓWNY
// =============================================================================

export default function ClientFilter({
  books,
  showReserveButton,
  role,
}: ClientFilterProps) {
  // Stan
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("Wszystkie");
  const [status, setStatus] = useState("Wszystkie");
  const [sortBy, setSortBy] = useState("Popularność");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filtrowanie
  const filteredBooks = useMemo(() => {
    let result = books;
    const searchLower = searchQuery.toLowerCase();

    if (searchLower) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.authors.toLowerCase().includes(searchLower)
      );
    }

    if (status !== "Wszystkie") {
      result = result.filter((book) =>
        status === "Dostępne" ? book.available : !book.available
      );
    }

    if (sortBy === "Tytuł A-Z") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title, "pl"));
    } else if (sortBy === "Tytuł Z-A") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title, "pl"));
    }

    return result;
  }, [books, searchQuery, category, status, sortBy]);

  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const isAdmin = role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* KATEGORIE PILL */}
      {/* ================================================================ */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setCurrentPage(1); }}
            className={`
              shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all
              ${category === cat
                ? isAdmin
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                : isAdmin
                  ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                  : "bg-white border border-gray-200 hover:border-gray-300 text-slate-600 hover:bg-gray-50"
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* PASEK FILTRÓW */}
      {/* ================================================================ */}
      <div className={`p-4 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Wyszukiwarka */}
          <div className="relative flex-1 md:w-64">
            <i className={`fas fa-search absolute left-3 top-2.5 text-sm ${isAdmin ? "text-slate-500" : "text-slate-400"}`} aria-hidden="true"></i>
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Szukaj po tytule, autorze..."
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs transition-all outline-none
                ${isAdmin
                  ? "bg-slate-900 border border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500"
                  : "bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500"
                }
              `}
            />
          </div>

          {/* Filtr statusu */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all outline-none cursor-pointer
              ${isAdmin
                ? "bg-slate-900 border border-slate-600 text-white"
                : "bg-white border border-gray-200 text-slate-700"
              }
            `}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>

          {/* Sortowanie */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all outline-none cursor-pointer
              ${isAdmin
                ? "bg-slate-900 border border-slate-600 text-white"
                : "bg-white border border-gray-200 text-slate-700"
              }
            `}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Widok grid/list */}
        <div className={`flex p-1 rounded-lg ${isAdmin ? "bg-slate-900" : "bg-gray-100/80"}`}>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded ${viewMode === "grid" ? (isAdmin ? "bg-slate-700 text-white" : "bg-white text-slate-900 shadow-sm") : (isAdmin ? "text-slate-400" : "text-slate-500")}`}
          >
            <i className="fas fa-th-large" aria-hidden="true"></i>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded ${viewMode === "list" ? (isAdmin ? "bg-slate-700 text-white" : "bg-white text-slate-900 shadow-sm") : (isAdmin ? "text-slate-400" : "text-slate-500")}`}
          >
            <i className="fas fa-list" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {/* Nagłówek z liczbą wyników */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${isAdmin ? "text-white" : "text-slate-900"}`}>
            Popularne książki
          </h2>
          <p className={`text-xs mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>
            Znaleziono {filteredBooks.length} pozycji
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SIATKA KSIĄŻEK */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {paginatedBooks.map((book) => (
          <div key={book.id} className="group flex flex-col gap-3 cursor-pointer">
            {/* Okładka */}
            <div className={`
              relative aspect-2/3 rounded-2xl overflow-hidden shadow-md transition-all duration-300
              ${isAdmin
                ? "bg-slate-800 border border-slate-700 group-hover:shadow-xl group-hover:shadow-indigo-500/10"
                : "bg-gray-100 border border-gray-100 group-hover:shadow-xl group-hover:shadow-indigo-900/10"
              }
            `}>
              <img
                src={book.coverUrl || "/biblio.png"}
                alt={`Okładka: ${book.title}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Overlay z przyciskami akcji */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <Link
                  href={`/books/${book.id}`}
                  className="px-4 py-2 rounded-full bg-white text-slate-900 text-xs font-semibold shadow-lg hover:bg-gray-100 transition-all"
                >
                  Zobacz więcej
                </Link>
              </div>

              {/* Badge dostępności */}
              <div className="absolute top-2 right-2">
                <span className={`
                  px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-md
                  ${book.available
                    ? "bg-green-500/90 text-white"
                    : "bg-red-500/90 text-white"
                  }
                `}>
                  {book.available ? "Dostępna" : "Wypożyczona"}
                </span>
              </div>
            </div>

            {/* Tytuł i autor */}
            <div>
              <h3 className={`font-semibold text-sm leading-tight group-hover:text-indigo-600 transition-colors ${isAdmin ? "text-gray-100" : "text-slate-900"}`}>
                {book.title}
              </h3>
              <p className={`text-xs mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>
                {book.authors}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mt-2 text-amber-400">
                <i className="fas fa-star text-xs" aria-hidden="true"></i>
                <i className="fas fa-star text-xs" aria-hidden="true"></i>
                <i className="fas fa-star text-xs" aria-hidden="true"></i>
                <i className="fas fa-star text-xs" aria-hidden="true"></i>
                <i className="far fa-star text-xs" aria-hidden="true"></i>
                <span className={`text-[10px] ml-1 ${isAdmin ? "text-slate-500" : "text-slate-400"}`}>4.0</span>
              </div>
            </div>

            {/* Przyciski akcji pod kartą */}
            <div className="flex items-center gap-2 mt-auto">
              {role === "USER" && (
                <ReserveButton bookId={book.id} available={book.available} />
              )}

              {role === "LIBRARIAN" && (
                <button className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center gap-1">
                  <i className="fas fa-cog" aria-hidden="true"></i>
                  Zarządzaj
                </button>
              )}

              {role === "ADMIN" && (
                <>
                  <button className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1">
                    <i className="fas fa-edit" aria-hidden="true"></i>
                    Edytuj
                  </button>
                  <button className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white" title="Usuń">
                    <i className="fas fa-trash text-xs" aria-hidden="true"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {paginatedBooks.length === 0 && (
          <div className={`col-span-full py-16 text-center ${isAdmin ? "text-slate-400" : "text-gray-500"}`}>
            <i className="fas fa-search text-4xl mb-4 opacity-50" aria-hidden="true"></i>
            <p className="font-medium">Brak wyników dla podanych kryteriów</p>
            <p className="text-sm mt-1 opacity-75">Spróbuj zmienić filtry wyszukiwania</p>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* PAGINACJA */}
      {/* ================================================================ */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${isAdmin
                ? "bg-slate-800 border border-slate-700 text-white hover:bg-slate-700"
                : "bg-white border shadow hover:bg-gray-50"
              }
            `}
          >
            <i className="fas fa-chevron-left" aria-hidden="true"></i>
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`
                px-4 py-2 rounded-full transition-all
                ${currentPage === i + 1
                  ? isAdmin
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-900 text-white shadow"
                  : isAdmin
                    ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                    : "bg-white border shadow hover:bg-gray-100"
                }
              `}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${isAdmin
                ? "bg-slate-800 border border-slate-700 text-white hover:bg-slate-700"
                : "bg-white border shadow hover:bg-gray-50"
              }
            `}
          >
            <i className="fas fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      )}
    </div>
  );
}
