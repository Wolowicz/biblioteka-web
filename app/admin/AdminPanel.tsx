/**
 * =============================================================================
 * ADMIN PANEL - Panel zarządzania dla administratorów
 * =============================================================================
 * 
 * Nowoczesny panel administracyjny z ciemnym motywem i statystykami.
 * 
 * @packageDocumentation
 */

"use client";

import type { AdminPanelProps } from "@/domain/types";

// =============================================================================
// KOMPONENT GŁÓWNY
// =============================================================================

export default function AdminPanel({ user }: AdminPanelProps) {
  const role = user.role;
  const isAdmin = role === "ADMIN";

  return (
    <div className="space-y-8">
      {/* ================================================================ */}
      {/* NAGŁÓWEK Z STATUSEM */}
      {/* ================================================================ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isAdmin ? "text-white" : "text-slate-900"}`}>
            Panel Zarządzania
          </h1>
          <p className={`text-sm mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>
            Witaj, {user.firstName} {user.lastName}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${isAdmin ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-green-100 text-green-700"}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System aktywny
        </div>
      </div>

      {/* ================================================================ */}
      {/* STATYSTYKI */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Karta: Użytkownicy */}
        <div className={`p-6 rounded-2xl border ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${isAdmin ? "bg-indigo-500/10" : "bg-indigo-100"}`}>
              <i className={`fas fa-users ${isAdmin ? "text-indigo-400" : "text-indigo-600"}`} aria-hidden="true"></i>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isAdmin ? "bg-emerald-500/10 text-emerald-400" : "bg-green-100 text-green-700"}`}>
              +12% ↑
            </span>
          </div>
          <p className={`text-3xl font-bold ${isAdmin ? "text-white" : "text-slate-900"}`}>1,284</p>
          <p className={`text-sm mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Aktywnych użytkowników</p>
        </div>

        {/* Karta: Książki */}
        <div className={`p-6 rounded-2xl border ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${isAdmin ? "bg-blue-500/10" : "bg-blue-100"}`}>
              <i className={`fas fa-book ${isAdmin ? "text-blue-400" : "text-blue-600"}`} aria-hidden="true"></i>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isAdmin ? "bg-emerald-500/10 text-emerald-400" : "bg-green-100 text-green-700"}`}>
              +5% ↑
            </span>
          </div>
          <p className={`text-3xl font-bold ${isAdmin ? "text-white" : "text-slate-900"}`}>8,456</p>
          <p className={`text-sm mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Książek w katalogu</p>
        </div>

        {/* Karta: Wypożyczenia */}
        <div className={`p-6 rounded-2xl border ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${isAdmin ? "bg-purple-500/10" : "bg-purple-100"}`}>
              <i className={`fas fa-exchange-alt ${isAdmin ? "text-purple-400" : "text-purple-600"}`} aria-hidden="true"></i>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isAdmin ? "bg-amber-500/10 text-amber-400" : "bg-yellow-100 text-yellow-700"}`}>
              -3% ↓
            </span>
          </div>
          <p className={`text-3xl font-bold ${isAdmin ? "text-white" : "text-slate-900"}`}>342</p>
          <p className={`text-sm mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Aktywnych wypożyczeń</p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SZYBKIE AKCJE */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className={`p-4 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${isAdmin ? "bg-slate-800/50 border-slate-700 hover:border-indigo-500/50" : "bg-white border-gray-200 hover:border-indigo-300"}`}>
          <i className={`fas fa-user-plus text-lg mb-2 ${isAdmin ? "text-indigo-400" : "text-indigo-600"}`} aria-hidden="true"></i>
          <p className={`font-medium ${isAdmin ? "text-white" : "text-slate-900"}`}>Dodaj użytkownika</p>
          <p className={`text-xs mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Nowe konto</p>
        </button>

        <button className={`p-4 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${isAdmin ? "bg-slate-800/50 border-slate-700 hover:border-blue-500/50" : "bg-white border-gray-200 hover:border-blue-300"}`}>
          <i className={`fas fa-book-medical text-lg mb-2 ${isAdmin ? "text-blue-400" : "text-blue-600"}`} aria-hidden="true"></i>
          <p className={`font-medium ${isAdmin ? "text-white" : "text-slate-900"}`}>Dodaj książkę</p>
          <p className={`text-xs mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Nowa pozycja</p>
        </button>

        <button className={`p-4 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${isAdmin ? "bg-slate-800/50 border-slate-700 hover:border-purple-500/50" : "bg-white border-gray-200 hover:border-purple-300"}`}>
          <i className={`fas fa-chart-line text-lg mb-2 ${isAdmin ? "text-purple-400" : "text-purple-600"}`} aria-hidden="true"></i>
          <p className={`font-medium ${isAdmin ? "text-white" : "text-slate-900"}`}>Raporty</p>
          <p className={`text-xs mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Statystyki</p>
        </button>

        <button className={`p-4 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${isAdmin ? "bg-slate-800/50 border-slate-700 hover:border-amber-500/50" : "bg-white border-gray-200 hover:border-amber-300"}`}>
          <i className={`fas fa-cog text-lg mb-2 ${isAdmin ? "text-amber-400" : "text-amber-600"}`} aria-hidden="true"></i>
          <p className={`font-medium ${isAdmin ? "text-white" : "text-slate-900"}`}>Ustawienia</p>
          <p className={`text-xs mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Konfiguracja</p>
        </button>
      </div>

      {/* ================================================================ */}
      {/* OSTATNIA AKTYWNOŚĆ */}
      {/* ================================================================ */}
      <div className={`rounded-2xl border overflow-hidden ${isAdmin ? "bg-slate-800/30 border-slate-700" : "bg-white border-gray-200"}`}>
        <div className={`px-6 py-4 border-b ${isAdmin ? "border-slate-700" : "border-gray-100"}`}>
          <h2 className={`font-semibold ${isAdmin ? "text-white" : "text-slate-900"}`}>Ostatnia aktywność</h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          {/* Przykładowe wpisy */}
          {[
            { icon: "fa-user-plus", color: "indigo", text: "Nowy użytkownik zarejestrowany", time: "2 min temu", user: "Jan Kowalski" },
            { icon: "fa-book", color: "blue", text: "Wypożyczono książkę", time: "15 min temu", user: "Anna Nowak" },
            { icon: "fa-check-circle", color: "emerald", text: "Zwrócono książkę", time: "1 godz. temu", user: "Piotr Wiśniewski" },
            { icon: "fa-star", color: "amber", text: "Nowa recenzja", time: "2 godz. temu", user: "Maria Kowalczyk" },
          ].map((item, i) => (
            <div key={i} className={`px-6 py-4 flex items-center gap-4 ${isAdmin ? "hover:bg-slate-700/30" : "hover:bg-gray-50"} transition-colors`}>
              <div className={`p-2 rounded-lg ${isAdmin ? `bg-${item.color}-500/10` : `bg-${item.color}-100`}`}>
                <i className={`fas ${item.icon} ${isAdmin ? `text-${item.color}-400` : `text-${item.color}-600`}`} aria-hidden="true"></i>
              </div>
              <div className="flex-1">
                <p className={`font-medium text-sm ${isAdmin ? "text-white" : "text-slate-900"}`}>{item.text}</p>
                <p className={`text-xs ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>{item.user}</p>
              </div>
              <span className={`text-xs ${isAdmin ? "text-slate-500" : "text-slate-400"}`}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* KOSZ */}
      {/* ================================================================ */}
      <div className={`p-6 rounded-2xl border ${isAdmin ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-200"}`}>
        <h2 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${isAdmin ? "text-red-400" : "text-red-700"}`}>
          <i className="fas fa-trash" aria-hidden="true"></i>
          Kosz
        </h2>
        <p className={`text-sm mb-4 ${isAdmin ? "text-red-300/70" : "text-red-600"}`}>
          Elementy usunięte logicznie. Możesz je przywrócić lub usunąć trwale.
        </p>
        <button className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${isAdmin ? "bg-red-500/20 hover:bg-red-500/30 text-red-400" : "bg-red-100 hover:bg-red-200 text-red-700"}`}>
          <i className="fas fa-folder-open" aria-hidden="true"></i>
          Przeglądaj kosz
        </button>
      </div>
    </div>
  );
}
