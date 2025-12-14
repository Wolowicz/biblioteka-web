/**
 * =============================================================================
 * CLIENT FILTER - Katalog książek
 * =============================================================================
 * 
 * Nowoczesny katalog książek inspirowany designem z załączonego HTML.
 * Zawiera nagłówek, wyszukiwarkę, filtry i siatkę książek z paginacją.
 */

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BookViewModel, ClientFilterProps } from "@/domain/types";

export type BookVM = BookViewModel;

// =============================================================================
// STAŁE
// =============================================================================

const PAGE_SIZE = 12;

const CATEGORY_VALUES = ["Wszystkie", "Fantastyka", "Klasyka", "Dla dzieci", "Informatyka", "Biznes", "Kryminał", "Romans"];
const STATUS_VALUES = ["Wszystkie", "Dostępne", "Niedostępne"];
const SORT_OPTIONS = [
  { value: "rating", label: "Popularność" },
  { value: "title-asc", label: "Tytuł A-Z" },
  { value: "title-desc", label: "Tytuł Z-A" },
  { value: "newest", label: "Najnowsze" },
];

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
  const [sortBy, setSortBy] = useState("rating");
  const [currentPage, setCurrentPage] = useState(1);

  // Dropdowny
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isAdmin = role === "ADMIN";

  // Filtrowanie
  const filteredBooks = useMemo(() => {
    let result = [...books];
    const searchLower = searchQuery.toLowerCase().trim();

    if (searchLower) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.authors.toLowerCase().includes(searchLower)
      );
    }

    if (category !== "Wszystkie") {
      result = result.filter((book) => {
        const bookCategory = (book as any).category || "";
        return bookCategory.toLowerCase().includes(category.toLowerCase());
      });
    }

    if (status !== "Wszystkie") {
      result = result.filter((book) =>
        status === "Dostępne" ? book.available : !book.available
      );
    }

    switch (sortBy) {
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title, "pl"));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title, "pl"));
        break;
      case "rating":
        result.sort((a, b) => (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0));
        break;
      case "newest":
        result.sort((a, b) => ((b as any).year || 0) - ((a as any).year || 0));
        break;
    }

    return result;
  }, [books, searchQuery, category, status, sortBy]);

  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Paginacja - wyświetlane strony
  const getVisiblePages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* NAGŁÓWEK - młodzieżowy gradient */}
      {/* ================================================================ */}
      <div className="relative py-8 px-6 -mx-4 sm:-mx-6 rounded-3xl overflow-hidden">
        {/* Tło gradientowe */}
        <div className={`absolute inset-0 ${isAdmin ? "bg-linear-to-br from-slate-800 via-indigo-900/50 to-slate-800" : "bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500"}`}></div>
        {/* Dekoracyjne elementy */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>📚</span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-lg">
              Katalog Książek
            </h1>
          </div>
          <p className="text-white/80 text-base max-w-xl">
            Odkrywaj niesamowite historie! 🚀 Znajdź swoją następną ulubioną książkę.
          </p>
          
          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <i className="fas fa-book text-yellow-300"></i>
              <span className="text-white font-bold">{books.length}</span>
              <span className="text-white/70 text-sm">książek</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <i className="fas fa-check-circle text-emerald-300"></i>
              <span className="text-white font-bold">{books.filter(b => b.available).length}</span>
              <span className="text-white/70 text-sm">dostępnych</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* WYSZUKIWARKA - młodzieżowa z gradientem */}
      {/* ================================================================ */}
      <div className="relative group">
        {/* Gradient border effect */}
        <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-300 blur-sm ${isAdmin ? "bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" : "bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"}`}></div>
        <div className={`
          relative flex items-center rounded-2xl h-14 overflow-hidden transition-all duration-300
          ${isAdmin 
            ? "bg-slate-800/90 ring-1 ring-white/10" 
            : "bg-white ring-1 ring-gray-200 group-focus-within:ring-0"
          }
        `}>
          <div className={`flex items-center justify-center pl-5 transition-colors ${searchQuery ? "text-indigo-500" : isAdmin ? "text-slate-400" : "text-slate-400"}`}>
            <i className={`fas fa-search text-lg ${searchQuery ? "animate-pulse" : ""}`}></i>
          </div>
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="🔍 Szukaj książki, autora... Co dziś przeczytasz?"
            className={`flex-1 h-full px-4 text-base outline-none bg-transparent ${isAdmin ? "text-white placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"}`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mr-4 p-2 rounded-full bg-linear-to-r from-rose-500 to-pink-500 text-white hover:scale-110 transition-transform shadow-lg shadow-rose-500/25"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* FILTRY - młodzieżowe kolorowe przyciski */}
      {/* ================================================================ */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Kategoria */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("category")}
            className={`
              flex h-11 items-center gap-2 rounded-full pl-4 pr-3 text-sm font-bold transition-all duration-300 hover:scale-105
              ${category !== "Wszystkie"
                ? "bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30" 
                : isAdmin 
                  ? "bg-slate-800/80 text-slate-300 hover:bg-slate-700 ring-1 ring-white/10" 
                  : "bg-white text-slate-700 hover:bg-gray-50 ring-1 ring-gray-200 hover:ring-purple-300 hover:text-purple-600"
              }
            `}
          >
            <i className={`fas fa-layer-group text-xs ${category !== "Wszystkie" ? "text-purple-200" : "text-purple-400"}`}></i>
            <span>{category === "Wszystkie" ? "Kategoria" : category}</span>
            <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${openDropdown === "category" ? "rotate-180" : ""}`}></i>
          </button>
          {openDropdown === "category" && (
            <div className={`absolute top-13 left-0 z-50 min-w-52 rounded-2xl shadow-2xl py-3 animate-in fade-in slide-in-from-top-2 duration-200 ${isAdmin ? "bg-slate-800 ring-1 ring-white/10" : "bg-white ring-1 ring-purple-100"}`}>
              {CATEGORY_VALUES.map((cat, idx) => {
                const catIcons: Record<string, string> = {
                  "Wszystkie": "fas fa-globe",
                  "Fantastyka": "fas fa-dragon",
                  "Klasyka": "fas fa-landmark",
                  "Dla dzieci": "fas fa-child",
                  "Informatyka": "fas fa-laptop-code",
                  "Biznes": "fas fa-briefcase",
                  "Kryminał": "fas fa-user-secret",
                  "Romans": "fas fa-heart"
                };
                const catColors: Record<string, string> = {
                  "Wszystkie": "text-slate-400",
                  "Fantastyka": "text-purple-500",
                  "Klasyka": "text-amber-500",
                  "Dla dzieci": "text-pink-500",
                  "Informatyka": "text-blue-500",
                  "Biznes": "text-emerald-500",
                  "Kryminał": "text-slate-600",
                  "Romans": "text-rose-500"
                };
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setCategory(cat); setOpenDropdown(null); setCurrentPage(1); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all duration-200 ${
                      category === cat 
                        ? "bg-linear-to-r from-purple-500 to-indigo-500 text-white mx-2 rounded-xl w-[calc(100%-16px)]"
                        : (isAdmin ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-purple-50 hover:text-purple-700")
                    }`}
                  >
                    <i className={`${catIcons[cat] || "fas fa-book"} text-sm ${category === cat ? "text-white" : catColors[cat]}`}></i>
                    <span className="font-medium">{cat}</span>
                    {category === cat && <i className="fas fa-check text-xs ml-auto"></i>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dostępność */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("status")}
            className={`
              flex h-11 items-center gap-2 rounded-full pl-4 pr-3 text-sm font-bold transition-all duration-300 hover:scale-105
              ${status === "Dostępne"
                ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                : status === "Niedostępne"
                  ? "bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30"
                  : isAdmin 
                    ? "bg-slate-800/80 text-slate-300 hover:bg-slate-700 ring-1 ring-white/10" 
                    : "bg-white text-slate-700 hover:bg-gray-50 ring-1 ring-gray-200 hover:ring-emerald-300 hover:text-emerald-600"
              }
            `}
          >
            <i className={`fas ${status === "Dostępne" ? "fa-check-circle" : status === "Niedostępne" ? "fa-clock" : "fa-filter"} text-xs`}></i>
            <span>{status === "Wszystkie" ? "Dostępność" : status}</span>
            <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${openDropdown === "status" ? "rotate-180" : ""}`}></i>
          </button>
          {openDropdown === "status" && (
            <div className={`absolute top-13 left-0 z-50 min-w-48 rounded-2xl shadow-2xl py-3 animate-in fade-in slide-in-from-top-2 duration-200 ${isAdmin ? "bg-slate-800 ring-1 ring-white/10" : "bg-white ring-1 ring-gray-100"}`}>
              {STATUS_VALUES.map((s) => {
                const statusConfig: Record<string, { icon: string; color: string; bg: string }> = {
                  "Wszystkie": { icon: "fas fa-globe", color: "text-slate-500", bg: "" },
                  "Dostępne": { icon: "fas fa-check-circle", color: "text-emerald-500", bg: "hover:bg-emerald-50" },
                  "Niedostępne": { icon: "fas fa-clock", color: "text-rose-500", bg: "hover:bg-rose-50" }
                };
                const cfg = statusConfig[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setStatus(s); setOpenDropdown(null); setCurrentPage(1); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all duration-200 ${
                      status === s 
                        ? `bg-linear-to-r ${s === "Dostępne" ? "from-emerald-500 to-teal-500" : s === "Niedostępne" ? "from-rose-500 to-pink-500" : "from-indigo-500 to-purple-500"} text-white mx-2 rounded-xl w-[calc(100%-16px)]`
                        : (isAdmin ? "text-slate-300 hover:bg-slate-700" : `text-slate-700 ${cfg.bg}`)
                    }`}
                  >
                    <i className={`${cfg.icon} text-sm ${status === s ? "text-white" : cfg.color}`}></i>
                    <span className="font-medium">{s}</span>
                    {status === s && <i className="fas fa-check text-xs ml-auto"></i>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sortowanie */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown("sort")}
            className={`
              flex h-11 items-center gap-2 rounded-full pl-4 pr-3 text-sm font-bold transition-all duration-300 hover:scale-105
              bg-linear-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30
            `}
          >
            <i className="fas fa-fire text-xs"></i>
            <span>{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
            <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${openDropdown === "sort" ? "rotate-180" : ""}`}></i>
          </button>
          {openDropdown === "sort" && (
            <div className={`absolute top-13 left-0 z-50 min-w-48 rounded-2xl shadow-2xl py-3 animate-in fade-in slide-in-from-top-2 duration-200 ${isAdmin ? "bg-slate-800 ring-1 ring-white/10" : "bg-white ring-1 ring-orange-100"}`}>
              {SORT_OPTIONS.map((opt) => {
                const sortIcons: Record<string, string> = {
                  "rating": "fas fa-fire",
                  "title-asc": "fas fa-sort-alpha-down",
                  "title-desc": "fas fa-sort-alpha-up",
                  "newest": "fas fa-sparkles"
                };
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setSortBy(opt.value); setOpenDropdown(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all duration-200 ${
                      sortBy === opt.value 
                        ? "bg-linear-to-r from-amber-400 to-orange-500 text-white mx-2 rounded-xl w-[calc(100%-16px)]"
                        : (isAdmin ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-orange-50 hover:text-orange-600")
                    }`}
                  >
                    <i className={`${sortIcons[opt.value]} text-sm ${sortBy === opt.value ? "text-white" : "text-orange-400"}`}></i>
                    <span className="font-medium">{opt.label}</span>
                    {sortBy === opt.value && <i className="fas fa-check text-xs ml-auto"></i>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Liczba wyników - badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isAdmin ? "bg-slate-800/60" : "bg-linear-to-r from-indigo-50 to-purple-50 ring-1 ring-indigo-100"}`}>
          <span className="text-lg">📖</span>
          <span className={`font-black text-lg bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>{filteredBooks.length}</span>
          <span className={`text-sm ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>książek</span>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SIATKA KSIĄŻEK - młodzieżowe karty */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {paginatedBooks.map((book, index) => (
          <Link
            href={`/books/${book.id}`}
            key={book.id}
            className="group block animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
          >
            {/* Karta z gradientowym obramowaniem na hover */}
            <div className="relative">
              {/* Gradient glow effect on hover */}
              <div className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md ${book.available ? "bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400" : "bg-linear-to-r from-rose-400 via-pink-400 to-purple-400"}`}></div>
              
              <div className={`
                relative rounded-2xl overflow-hidden transition-all duration-500 
                ${isAdmin 
                  ? "bg-slate-800/60 hover:bg-slate-800 ring-1 ring-white/5" 
                  : "bg-white ring-1 ring-gray-100"
                }
                group-hover:-translate-y-2 group-hover:shadow-2xl
              `}>
              {/* Okładka */}
              <div className="relative aspect-2/3 overflow-hidden">
                {book.coverUrl ? (
                  <>
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${book.coverUrl})` }}
                    />
                    {/* Gradient na hover */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                ) : (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center ${isAdmin ? "bg-linear-to-br from-slate-700 to-slate-800" : "bg-linear-to-br from-indigo-100 via-purple-100 to-pink-100"}`}>
                    {/* Dekoracyjne elementy */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-purple-200/50 rounded-full blur-lg"></div>
                    <div className="absolute bottom-8 left-4 w-6 h-6 bg-pink-200/50 rounded-full blur-lg"></div>
                    
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${isAdmin ? "bg-slate-600/50" : "bg-linear-to-br from-indigo-400 to-purple-500 shadow-lg shadow-purple-500/25"}`}>
                      <i className={`fas fa-book text-2xl ${isAdmin ? "text-slate-400" : "text-white"}`}></i>
                    </div>
                    <span className={`text-xs font-medium ${isAdmin ? "text-slate-500" : "text-purple-400"}`}>📖 Brak okładki</span>
                  </div>
                )}

                {/* Badge dostępności - młodzieżowy */}
                <div className="absolute top-2.5 right-2.5">
                  <div className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide backdrop-blur-md shadow-xl transition-all duration-300 group-hover:scale-110
                    ${book.available 
                      ? "bg-linear-to-r from-emerald-400 to-teal-500 text-white ring-2 ring-white/30" 
                      : "bg-linear-to-r from-rose-400 to-pink-500 text-white ring-2 ring-white/30"
                    }
                  `}>
                    <span className={`text-sm ${book.available ? "" : ""}`}>{book.available ? "✨" : "⏳"}</span>
                    {book.available ? "Dostępna" : "Niedostępna"}
                  </div>
                </div>

                {/* Przycisk na hover */}
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/95 backdrop-blur-sm text-indigo-600 font-semibold text-xs shadow-lg">
                    <i className="fas fa-arrow-right"></i>
                    <span>Zobacz więcej</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 h-24 flex flex-col">
                <h3 className={`font-semibold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors duration-200 ${isAdmin ? "text-white" : "text-slate-800"}`}>
                  {book.title}
                </h3>
                <p className={`text-xs line-clamp-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>
                  {book.authors}
                </p>
                
                {/* Rating */}
                <div className="mt-auto pt-1">
                  {book.averageRating && Number(book.averageRating) > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const rating = Number(book.averageRating) || 0;
                          return (
                            <i 
                              key={star} 
                              className={`text-[10px] ${star <= Math.round(rating) ? "fas fa-star text-amber-400" : "fas fa-star text-gray-200"}`}
                            ></i>
                          );
                        })}
                      </div>
                      <span className={`text-[10px] font-medium ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>
                        {Number(book.averageRating).toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className="fas fa-star text-[10px] text-gray-200"></i>
                        ))}
                      </div>
                      <span className={`text-[10px] ${isAdmin ? "text-slate-500" : "text-slate-400"}`}>–</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </Link>
        ))}

        {/* Brak wyników */}
        {paginatedBooks.length === 0 && (
          <div className={`col-span-full py-24 text-center ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>
            <div className={`w-20 h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center ${isAdmin ? "bg-slate-800" : "bg-linear-to-br from-indigo-100 to-purple-100"}`}>
              <i className={`fas fa-book-open text-3xl ${isAdmin ? "text-slate-600" : "text-indigo-400"}`}></i>
            </div>
            <p className={`font-bold text-xl mb-2 ${isAdmin ? "text-white" : "text-slate-800"}`}>Nic nie znaleziono 😔</p>
            <p className={`text-sm ${isAdmin ? "text-slate-500" : "text-slate-400"}`}>
              Spróbuj innych słów kluczowych lub zmień filtry
            </p>
            {(searchQuery || category !== "Wszystkie" || status !== "Wszystkie") && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setCategory("Wszystkie"); setStatus("Wszystkie"); setCurrentPage(1); }}
                className={`mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isAdmin 
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105" 
                    : "bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:scale-105 shadow-lg shadow-indigo-500/25"
                }`}
              >
                <i className="fas fa-redo text-xs"></i>
                Resetuj filtry
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* PAGINACJA - młodzieżowa */}
      {/* ================================================================ */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-8">
          {/* Poprzednia */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 ${
              isAdmin 
                ? "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white" 
                : "bg-white text-indigo-600 hover:bg-indigo-50 shadow-md hover:shadow-lg ring-1 ring-indigo-100"
            }`}
          >
            <i className="fas fa-arrow-left text-sm"></i>
          </button>

          {/* Numery stron */}
          <div className="flex items-center gap-2 bg-white rounded-2xl px-2 py-1 shadow-md ring-1 ring-gray-100">
            {getVisiblePages().map((page, idx) => (
              page === "..." ? (
                <span key={`dots-${idx}`} className="text-slate-400 px-2">•••</span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page as number)}
                  className={`flex items-center justify-center h-9 w-9 rounded-xl font-bold text-sm transition-all duration-300 ${
                    currentPage === page
                      ? "bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 scale-110"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          {/* Następna */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 ${
              isAdmin 
                ? "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white" 
                : "bg-white text-indigo-600 hover:bg-indigo-50 shadow-md hover:shadow-lg ring-1 ring-indigo-100"
            }`}
          >
            <i className="fas fa-arrow-right text-sm"></i>
          </button>
        </div>
      )}

      {/* Kliknięcie poza dropdownem zamyka go */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}
