/**
 * =============================================================================
 * BOOK DETAILS PAGE - Strona szczegółów książki
 * =============================================================================
 * 
 * Nowoczesna strona SSR wyświetlająca pełne informacje o książce.
 * 
 * @packageDocumentation
 */

import BackButton from "../../_components/BackButton";
import ReserveButton from "../../_components/ReserveButton";
import { getUserSessionSSR } from "@/lib/auth/server";
import { headers } from "next/headers";
import type { BookDetails, UserRole } from "@/domain/types";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailsPage({ params }: BookPageProps) {
  const { id } = await params;
  const bookId = Number(id);

  if (!Number.isFinite(bookId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4" aria-hidden="true"></i>
          <p className="text-red-600 font-semibold">Niepoprawne ID książki.</p>
        </div>
      </div>
    );
  }

  const user = await getUserSessionSSR();
  const role: UserRole = user?.role ?? "USER";
  const isAdmin = role === "ADMIN";

  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const apiUrl = `${protocol}://${host}/api/books/${bookId}`;

  const res = await fetch(apiUrl, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className={`min-h-screen p-6 ${isAdmin ? "bg-[#09090B]" : "bg-gray-50"}`}>
        <BackButton />
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <i className={`fas fa-book-open text-6xl mb-6 ${isAdmin ? "text-slate-600" : "text-gray-300"}`} aria-hidden="true"></i>
          <p className={`text-xl font-semibold ${isAdmin ? "text-white" : "text-gray-900"}`}>
            Nie znaleziono książki
          </p>
          <p className={`mt-2 ${isAdmin ? "text-slate-400" : "text-gray-500"}`}>
            Sprawdź czy podany adres jest prawidłowy
          </p>
        </div>
      </div>
    );
  }

  const book: BookDetails = await res.json();

  return (
    <div className={`min-h-screen ${isAdmin ? "bg-[#09090B]" : "bg-gray-50"}`}>
      {/* Nawigacja */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BackButton />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ================================================================ */}
          {/* LEWA KOLUMNA - OKŁADKA */}
          {/* ================================================================ */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              {/* Okładka */}
              <div className={`aspect-2/3 rounded-2xl overflow-hidden shadow-2xl ${isAdmin ? "shadow-indigo-500/10" : "shadow-slate-200"}`}>
                <img
                  src={book.coverUrl || "/biblio.png"}
                  alt={`Okładka: ${book.title}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Przyciski akcji */}
              <div className="mt-6 space-y-3">
                <ReserveButton bookId={book.id} available={book.available} />
                
                <button className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all
                  ${isAdmin 
                    ? "bg-slate-800 border border-slate-700 text-white hover:bg-slate-700" 
                    : "bg-white border border-gray-200 text-slate-700 hover:bg-gray-50"
                  }
                `}>
                  <i className="far fa-heart" aria-hidden="true"></i>
                  Dodaj do ulubionych
                </button>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* PRAWA KOLUMNA - SZCZEGÓŁY */}
          {/* ================================================================ */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Nagłówek */}
            <div>
              {/* Badge kategorii */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${isAdmin ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-indigo-100 text-indigo-700"}`}>
                  Fantastyka
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${isAdmin ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-100 text-purple-700"}`}>
                  Przygoda
                </span>
              </div>

              <h1 className={`text-3xl lg:text-4xl font-bold tracking-tight ${isAdmin ? "text-white" : "text-slate-900"}`}>
                {book.title}
              </h1>
              <p className={`text-xl mt-2 font-medium ${isAdmin ? "text-indigo-400" : "text-indigo-600"}`}>
                {book.authors}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex text-amber-400 text-lg">
                  <i className="fas fa-star" aria-hidden="true"></i>
                  <i className="fas fa-star" aria-hidden="true"></i>
                  <i className="fas fa-star" aria-hidden="true"></i>
                  <i className="fas fa-star" aria-hidden="true"></i>
                  <i className="far fa-star" aria-hidden="true"></i>
                </div>
                <span className={`text-sm ${isAdmin ? "text-slate-400" : "text-gray-600"}`}>
                  4.7 / 5 (1,283 ocen)
                </span>
              </div>
            </div>

            {/* Informacje o książce */}
            <div className={`p-6 rounded-2xl border ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isAdmin ? "text-white" : "text-slate-900"}`}>
                Informacje o książce
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Rok wydania", value: book.year },
                  { label: "Wydawnictwo", value: book.publisher },
                  { label: "ISBN", value: book.isbn },
                  { label: "Liczba stron", value: "288" },
                ].map((item, i) => (
                  <div key={i}>
                    <p className={`text-xs ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>{item.label}</p>
                    <p className={`font-medium ${isAdmin ? "text-white" : "text-slate-900"}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status dostępności */}
            <div className={`p-5 rounded-2xl flex justify-between items-center
              ${book.available
                ? isAdmin 
                  ? "bg-emerald-500/10 border border-emerald-500/20" 
                  : "bg-green-50 border border-green-200"
                : isAdmin 
                  ? "bg-red-500/10 border border-red-500/20" 
                  : "bg-red-50 border border-red-200"
              }
            `}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${book.available ? (isAdmin ? "bg-emerald-500/20" : "bg-green-100") : (isAdmin ? "bg-red-500/20" : "bg-red-100")}`}>
                  <i className={`fas ${book.available ? "fa-check" : "fa-times"} ${book.available ? (isAdmin ? "text-emerald-400" : "text-green-600") : (isAdmin ? "text-red-400" : "text-red-600")}`} aria-hidden="true"></i>
                </div>
                <div>
                  <p className={`font-semibold ${book.available ? (isAdmin ? "text-emerald-400" : "text-green-800") : (isAdmin ? "text-red-400" : "text-red-800")}`}>
                    {book.available ? "Dostępna" : "Niedostępna"}
                  </p>
                  <p className={`text-sm ${book.available ? (isAdmin ? "text-emerald-400/70" : "text-green-600") : (isAdmin ? "text-red-400/70" : "text-red-600")}`}>
                    {book.available ? "Możesz wypożyczyć od zaraz!" : "Aktualnie brak egzemplarzy"}
                  </p>
                </div>
              </div>
            </div>

            {/* Opis */}
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isAdmin ? "text-white" : "text-slate-900"}`}>
                Opis książki
              </h3>
              <p className={`leading-relaxed ${isAdmin ? "text-slate-300" : "text-gray-700"}`}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>

            {/* Pliki do pobrania */}
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isAdmin ? "text-white" : "text-slate-900"}`}>
                Pliki do pobrania
              </h3>
              <div className={`p-4 rounded-xl border flex items-center justify-between ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${isAdmin ? "bg-red-500/10" : "bg-red-100"}`}>
                    <i className={`fas fa-file-pdf text-xl ${isAdmin ? "text-red-400" : "text-red-500"}`} aria-hidden="true"></i>
                  </div>
                  <div>
                    <p className={`font-semibold ${isAdmin ? "text-white" : "text-slate-900"}`}>Fragment – Rozdział 1.pdf</p>
                    <p className={`text-xs ${isAdmin ? "text-slate-400" : "text-gray-500"}`}>2.4 MB</p>
                  </div>
                </div>
                <button className={`px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${isAdmin 
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white" 
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                  }
                `}>
                  Podgląd
                </button>
              </div>
            </div>

            {/* Recenzje */}
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isAdmin ? "text-white" : "text-slate-900"}`}>
                Recenzje
              </h3>

              {/* Formularz recenzji */}
              <div className={`p-5 rounded-xl border mb-6 ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}`}>
                <p className={`font-medium mb-3 ${isAdmin ? "text-white" : "text-slate-900"}`}>Dodaj swoją recenzję</p>
                <textarea
                  className={`w-full p-3 rounded-lg border h-24 text-sm transition-all outline-none resize-none
                    ${isAdmin
                      ? "bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500"
                      : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    }
                  `}
                  placeholder="Napisz swoją opinię o tej książce..."
                ></textarea>
                <button className={`mt-3 px-5 py-2 rounded-lg font-medium text-sm transition-all
                  ${isAdmin 
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white" 
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                  }
                `}>
                  Dodaj recenzję
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
