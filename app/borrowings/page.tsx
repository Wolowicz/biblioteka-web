/**
 * =============================================================================
 * BORROWINGS PAGE - Strona wypożyczeń użytkownika
 * =============================================================================
 * 
 * Nowoczesna strona SSR wyświetlająca listę wypożyczeń.
 * 
 * @packageDocumentation
 */

import { headers } from "next/headers";
import { getUserSessionSSR } from "@/lib/auth/server";
import BorrowingsList from "./BorrowingsList";
import BackButton from "@/app/_components/BackButton";
import type { BorrowingData } from "@/domain/types";

async function getBorrowings(): Promise<BorrowingData[]> {
  const h = await headers();
  const host = h.get("host")!;
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const apiUrl = `${protocol}://${host}/api/borrowings`;

  const res = await fetch(apiUrl, {
    cache: "no-store",
    credentials: "include",
    headers: { Cookie: h.get("cookie") || "" }
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function BorrowingsPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-lock text-4xl text-gray-400 mb-4" aria-hidden="true"></i>
          <p className="text-lg font-semibold text-gray-900">Wymagane logowanie</p>
          <p className="text-gray-500 mt-1">Musisz być zalogowany, aby zobaczyć swoje wypożyczenia.</p>
        </div>
      </div>
    );
  }

  const borrowings = await getBorrowings();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nawigacja */}
        <BackButton />

        {/* Nagłówek */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Moje Wypożyczenia
          </h1>
          <p className="mt-2 text-slate-500">
            Przeglądaj swoje aktualne i historyczne wypożyczenia
          </p>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <i className="fas fa-book text-blue-600" aria-hidden="true"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{borrowings.length}</p>
                <p className="text-xs text-slate-500">Wszystkich</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <i className="fas fa-clock text-green-600" aria-hidden="true"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {borrowings.filter(b => !b.returnedDate).length}
                </p>
                <p className="text-xs text-slate-500">Aktywnych</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <i className="fas fa-check text-gray-600" aria-hidden="true"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {borrowings.filter(b => b.returnedDate).length}
                </p>
                <p className="text-xs text-slate-500">Zwróconych</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <i className="fas fa-exclamation-triangle text-red-600" aria-hidden="true"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {borrowings.filter(b => !b.returnedDate && new Date(b.dueDate) < new Date()).length}
                </p>
                <p className="text-xs text-slate-500">Po terminie</p>
              </div>
            </div>
          </div>
        </div>

        {/* Zakładki */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm mb-6 w-fit">
          <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium">
            Wszystkie
          </button>
          <button className="px-4 py-2 rounded-lg text-slate-500 hover:bg-gray-100 text-sm font-medium transition-colors">
            Aktualne
          </button>
          <button className="px-4 py-2 rounded-lg text-slate-500 hover:bg-gray-100 text-sm font-medium transition-colors">
            Historia
          </button>
        </div>

        {/* Lista */}
        <BorrowingsList borrowings={borrowings} />
      </div>
    </div>
  );
}
