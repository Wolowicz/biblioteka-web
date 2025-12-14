/**
 * =============================================================================
 * BORROWINGS PAGE - Strona wypożyczeń użytkownika
 * =============================================================================
 * 
 * Nowoczesna strona SSR wyświetlająca listę wypożyczeń z pełną interaktywnością.
 * 
 * @packageDocumentation
 */

import { headers } from "next/headers";
import { getUserSessionSSR } from "@/lib/auth/server";
import BorrowingsClient from "./BorrowingsClient";
import { AppShell } from "@/app/_components/AppShell";
import type { BorrowingData } from "@/domain/types";
import Link from "next/link";

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
  const data = await res.json();
  return data.borrowings || data || [];
}

export default async function BorrowingsPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white shadow-lg flex items-center justify-center">
            <i className="fas fa-lock text-4xl text-slate-400" aria-hidden="true"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Wymagane logowanie</h1>
          <p className="text-slate-500 mb-6 max-w-md">
            Musisz być zalogowany, aby zobaczyć swoje wypożyczenia.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl btn-interactive"
          >
            <i className="fas fa-sign-in-alt" aria-hidden="true"></i>
            Zaloguj się
          </Link>
        </div>
      </div>
    );
  }

  const borrowings = await getBorrowings();

  return (
    <AppShell>
      {/* Nagłówek */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <i className="fas fa-book-reader text-2xl text-white" aria-hidden="true"></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Moje Wypożyczenia
            </h1>
            <p className="mt-1 text-slate-500">
              Zarządzaj swoimi aktualnymi i historycznymi wypożyczeniami
            </p>
          </div>
        </div>
      </div>

      {/* Główna zawartość */}
      <BorrowingsClient initialBorrowings={borrowings} />
    </AppShell>
  );
}
