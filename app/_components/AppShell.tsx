/**
 * =============================================================================
 * APP SHELL - Główny layout aplikacji dla zalogowanych użytkowników
 * =============================================================================
 * 
 * Nowoczesna powłoka aplikacji z designem inspirowanym materiałami projektu.
 * Zawiera nagłówek z nawigacją i obszar głównej treści.
 * 
 * @packageDocumentation
 */

"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { authService } from "@/services";
import { roleUI } from "@/lib/ui/theme";
import type { UserRole, AppShellProps } from "@/domain/types";
import { ROLE_LABELS, ROLE_ICONS } from "@/domain/types";

// =============================================================================
// KOMPONENT GŁÓWNY
// =============================================================================

export default function AppShell({ user, children }: AppShellProps) {
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const role = user.role as UserRole;

  const handleLogout = useCallback(async () => {
    await authService.logout();
    router.push("/");
  }, [router]);

  // Style zależne od roli
  const isAdmin = role === "ADMIN";
  const isLibrarian = role === "LIBRARIAN";

  return (
    <div className={`min-h-screen ${isAdmin ? "bg-[#09090B] text-slate-300" : "bg-white"}`}>
      {/* ================================================================== */}
      {/* NAGŁÓWEK */}
      {/* ================================================================== */}
      <header className={`
        sticky top-0 z-40 backdrop-blur-xl border-b
        ${isAdmin 
          ? "bg-[#09090B]/80 border-white/5" 
          : isLibrarian 
            ? "bg-white/70 border-gray-100/50" 
            : "bg-white/70 border-gray-100/50"
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Lewa strona - Logo i nawigacja */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 ${isAdmin ? "bg-linear-to-tr from-indigo-500 to-purple-600" : "bg-indigo-600"} rounded-lg flex items-center justify-center text-white shadow-lg ${isAdmin ? "" : "shadow-indigo-500/30"}`}>
                <i className="fas fa-book text-sm" aria-hidden="true"></i>
              </div>
              <span className={`text-lg font-bold tracking-tight ${isAdmin ? "text-white" : "text-slate-900"}`}>
                BiblioteQ
              </span>
            </div>

            {/* Nawigacja w pill */}
            <nav className={`hidden md:flex items-center p-1 rounded-lg border ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-gray-100/50 border-gray-200/50"}`}>
              <button
                onClick={() => router.push("/")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isAdmin ? "text-white bg-slate-700" : "text-slate-900 bg-white shadow-sm ring-1 ring-black/5"}`}
              >
                Katalog
              </button>

              {role === "USER" && (
                <button
                  onClick={() => router.push("/borrowings")}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Moje wypożyczenia
                </button>
              )}

              {(role === "ADMIN" || role === "LIBRARIAN") && (
                <button
                  onClick={() => router.push("/admin")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isAdmin ? "text-slate-400 hover:text-white hover:bg-slate-700" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Panel zarządzania
                </button>
              )}
            </nav>
          </div>

          {/* Prawa strona - wyszukiwarka, powiadomienia, użytkownik */}
          <div className="flex items-center gap-4">
            {/* Wyszukiwarka (tylko katalog) */}
            <div className={`relative hidden sm:block group ${isAdmin ? "" : ""}`}>
              <i className={`fas fa-search absolute left-3 top-2.5 text-sm ${isAdmin ? "text-slate-500 group-focus-within:text-indigo-400" : "text-slate-400 group-focus-within:text-indigo-500"} transition-colors`} aria-hidden="true"></i>
              <input 
                type="text" 
                placeholder="Szukaj książek..." 
                className={`pl-9 pr-4 py-2 rounded-full text-sm w-48 lg:w-64 transition-all outline-none
                  ${isAdmin 
                    ? "bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10" 
                    : "bg-gray-100/50 border border-transparent hover:bg-gray-100 focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400"
                  }
                `}
              />
            </div>

            {/* Powiadomienia */}
            <button className={`relative p-2 transition-colors ${isAdmin ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}>
              <i className="fas fa-bell" aria-hidden="true"></i>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Badge użytkownika */}
            <div className={`
              hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
              ${isAdmin 
                ? "bg-slate-800 text-slate-200 border border-slate-700" 
                : "bg-gray-100 text-slate-700 border border-gray-200"
              }
            `}>
              <i className={ROLE_ICONS[role]} aria-hidden="true"></i>
              <span>{user.firstName} {user.lastName}</span>
            </div>

            {/* Przycisk wylogowania */}
            <button
              onClick={handleLogout}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isAdmin 
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20"
                }
                hover:-translate-y-0.5 active:translate-y-0
              `}
            >
              <i className="fas fa-sign-out-alt mr-2" aria-hidden="true"></i>
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* GŁÓWNA TREŚĆ */}
      {/* ================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
