/**
 * =============================================================================
 * BOOK DETAILS PAGE - Strona szczegółów książki
 * =============================================================================
 * 
 * Nowoczesna strona SSR wyświetlająca pełne informacje o książce.
 * 
 * @packageDocumentation
 */

import { AppShell } from "../../_components/AppShell";
import BookActions from "../../_components/BookActions";
import BookRating from "../../_components/BookRating";
import ReviewsSection from "../../_components/ReviewsSection";
import FavoriteButton from "../../_components/FavoriteButton";
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
      <AppShell>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4" aria-hidden="true"></i>
            <p className="text-red-600 font-semibold">Niepoprawne ID książki.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const user = await getUserSessionSSR();
  const role: UserRole = user?.role ?? "READER";
  const isAdmin = role === "ADMIN";

  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const apiUrl = `${protocol}://${host}/api/books/${bookId}`;

  const res = await fetch(apiUrl, { cache: "no-store" });

  if (!res.ok) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <i className={`fas fa-book-open text-6xl mb-6 ${isAdmin ? "text-slate-600" : "text-gray-300"}`} aria-hidden="true"></i>
          <p className={`text-xl font-semibold ${isAdmin ? "text-white" : "text-gray-900"}`}>
            Nie znaleziono książki
          </p>
          <p className={`mt-2 ${isAdmin ? "text-slate-400" : "text-gray-500"}`}>
            Sprawdź czy podany adres jest prawidłowy
          </p>
        </div>
      </AppShell>
    );
  }

  const book: BookDetails = await res.json();

  return (
    <AppShell>
      {/* Dekoracyjne tło */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 -z-10 opacity-5 pointer-events-none"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ================================================================ */}
        {/* LEWA KOLUMNA - OKŁADKA Z EFEKTAMI */}
        {/* ================================================================ */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-auto">
            {/* Okładka z glow effect */}
            <div className="relative group">
              {/* Glow za okładką */}
              <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-50 transition-all duration-500 group-hover:opacity-80 ${book.available ? "bg-linear-to-br from-emerald-400 to-teal-400" : "bg-linear-to-br from-purple-400 to-pink-400"}`}></div>
              
              <div className={`relative aspect-3/4 rounded-3xl overflow-hidden shadow-lg ring-2 max-h-[36vh] sm:max-h-[44vh] lg:max-h-[64vh] ${book.available ? "ring-emerald-400/20" : "ring-purple-400/20"} transition-transform duration-500 group-hover:scale-[1.01]`}>
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={`Okładka: ${book.title}`}
                    className="w-full h-full object-cover transition-transform duration-700 sm:group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <i className="fas fa-book-open text-4xl mb-2" aria-hidden="true"></i>
                      <p className="text-sm font-medium">Brak okładki</p>
                    </div>
                  </div>
                )
                
                {/* Overlay gradient na hover */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Badge dostępności na okładce */}
                <div className="absolute top-4 right-4">
                  <div className={`px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md shadow-xl flex items-center gap-2 ${book.available ? "bg-emerald-500/90 text-white" : "bg-rose-500/90 text-white"}`}>
                    <span className="text-lg">{book.available ? "✨" : "⏳"}</span>
                    {book.available ? "Dostępna!" : "Wypożyczona"}
                  </div>
                </div>
              </div>
            </div>

            {/* Przyciski akcji - młodzieżowe */}
            <div className="mt-8 space-y-3">
              <BookActions bookId={book.id} available={book.available} variant="full" />
              
              <FavoriteButton bookId={book.id} isAdmin={isAdmin} />
              
              {/* Share button */}
              <button className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]
                ${isAdmin 
                  ? "bg-slate-800/50 text-slate-400 hover:text-white" 
                  : "bg-white border border-gray-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                }
              `}>
                <i className="fas fa-share-alt" aria-hidden="true"></i>
                Udostępnij znajomym
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* PRAWA KOLUMNA - SZCZEGÓŁY Z ANIMACJAMI */}
        {/* ================================================================ */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Nagłówek z efektami */}
          <div className="relative">
            {/* Dekoracyjne elementy */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-purple-200/30 rounded-full blur-2xl"></div>
            <div className="absolute top-10 -right-4 w-16 h-16 bg-pink-200/30 rounded-full blur-2xl"></div>
            
            {/* Badge kategorii - z bazy danych */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {book.genres && Array.isArray(book.genres) && book.genres.length > 0 ? (
                book.genres.map((genre: any) => (
                  <span 
                    key={genre.id}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold bg-linear-to-r ${genre.color || "from-indigo-500 to-purple-600"} text-white shadow-lg flex items-center gap-1.5`}
                  >
                    <i className={`${genre.icon || "fas fa-book"} text-[10px]`}></i>
                    {genre.name}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                  Brak przypisanego gatunku
                </span>
              )}
            </div>

            <h1 className={`text-3xl lg:text-5xl font-black tracking-tight ${isAdmin ? "text-white" : "bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent"}`}>
              {book.title}
            </h1>
            <p className={`text-xl mt-3 font-semibold flex items-center gap-2 ${isAdmin ? "text-indigo-400" : "text-indigo-600"}`}>
              <i className="fas fa-feather-alt text-sm opacity-70"></i>
              {book.authors}
            </p>

            {/* Rating - dynamiczna średnia */}
            <BookRating bookId={book.id} isAdmin={isAdmin} />
          </div>

          {/* Informacje o książce - karty */}
          <div className={`p-6 rounded-3xl border-2 ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-linear-to-br from-white to-indigo-50/30 border-indigo-100"}`}>
            <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 ${isAdmin ? "text-white" : "text-slate-900"}`}>
              <span className="text-xl">📖</span>
              Informacje o książce
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Rok wydania", value: book.year, icon: "fas fa-calendar", color: "from-blue-400 to-cyan-500" },
                { label: "Wydawnictwo", value: book.publisher, icon: "fas fa-building", color: "from-purple-400 to-indigo-500" },
                { label: "ISBN", value: book.isbn, icon: "fas fa-barcode", color: "from-emerald-400 to-teal-500" },
                { label: "Liczba stron", value: "288", icon: "fas fa-file-alt", color: "from-amber-400 to-orange-500" },
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${isAdmin ? "bg-slate-900/50 hover:bg-slate-900" : "bg-white hover:shadow-indigo-500/10"}`}>
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${item.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <i className={`${item.icon} text-white text-sm`}></i>
                  </div>
                  <p className={`text-[10px] uppercase tracking-wider font-medium ${isAdmin ? "text-slate-500" : "text-slate-400"}`}>{item.label}</p>
                  <p className={`font-bold text-sm mt-0.5 ${isAdmin ? "text-white" : "text-slate-900"}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status dostępności - animowany */}
          <div className={`relative p-6 rounded-3xl flex justify-between items-center overflow-hidden transition-all duration-300 hover:scale-[1.01]
            ${book.available
              ? "bg-linear-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200" 
              : "bg-linear-to-r from-rose-50 to-pink-50 border-2 border-rose-200"
            }
          `}>
            {/* Dekoracyjne tło */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 ${book.available ? "bg-emerald-300" : "bg-rose-300"}`}></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${book.available ? "bg-linear-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30" : "bg-linear-to-br from-rose-400 to-pink-500 shadow-rose-500/30"}`}>
                <span className="text-2xl">{book.available ? "✅" : "⏰"}</span>
              </div>
              <div>
                <p className={`font-black text-lg ${book.available ? "text-emerald-700" : "text-rose-700"}`}>
                  {book.available ? "Dostępna do wypożyczenia! 🎉" : "Aktualnie niedostępna"}
                </p>
                <p className={`text-sm font-medium ${book.available ? "text-emerald-600" : "text-rose-600"}`}>
                  {book.available ? "Kliknij 'Rezerwuj' i odbierz w bibliotece" : "Zapisz się na listę oczekujących"}
                </p>
              </div>
            </div>
            
            {book.available && (
              <div className="hidden sm:flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-700 font-bold text-sm">Teraz!</span>
              </div>
            )}
          </div>

          {/* Opis - rozbudowany */}
          <div className="relative">
            <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full bg-linear-to-b from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="pl-6">
              <h3 className={`text-xl font-black mb-4 flex items-center gap-2 ${isAdmin ? "text-white" : "text-slate-900"}`}>
                <span>📝</span> O czym jest ta książka?
              </h3>
              <p className={`leading-relaxed text-base ${isAdmin ? "text-slate-300" : "text-gray-600"}`}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <button className={`mt-4 text-sm font-bold flex items-center gap-2 transition-all hover:gap-3 ${isAdmin ? "text-indigo-400" : "text-indigo-600"}`}>
                Czytaj więcej
                <i className="fas fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>

          {/* Pliki do pobrania - ładniejsze */}
          <div>
            <h3 className={`text-xl font-black mb-4 flex items-center gap-2 ${isAdmin ? "text-white" : "text-slate-900"}`}>
              <span>📁</span> Pliki do pobrania
            </h3>
            <div className={`group p-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-300 hover:scale-[1.01] ${isAdmin ? "bg-slate-800/50 border-slate-700 hover:border-indigo-500/50" : "bg-linear-to-r from-white to-rose-50/50 border-rose-100 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/10"}`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform">
                  <i className="fas fa-file-pdf text-2xl text-white" aria-hidden="true"></i>
                </div>
                <div>
                  <p className={`font-bold ${isAdmin ? "text-white" : "text-slate-900"}`}>Fragment – Rozdział 1.pdf</p>
                  <p className={`text-xs flex items-center gap-2 ${isAdmin ? "text-slate-400" : "text-gray-500"}`}>
                    <span>📄 2.4 MB</span>
                    <span>•</span>
                    <span>Bezpłatny podgląd</span>
                  </p>
                </div>
              </div>
              <button className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 bg-linear-to-r from-slate-800 to-slate-900 text-white hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 flex items-center gap-2">
                <i className="fas fa-eye"></i>
                Podgląd
              </button>
            </div>
          </div>

          {/* Recenzje */}
          <ReviewsSection bookId={book.id} isAdmin={isAdmin} currentUserId={user?.id ? Number(user.id) : undefined} />

        </div>
      </div>
    </AppShell>
  );
}
