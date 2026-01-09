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

import React, { useCallback, useEffect, useState, ReactNode, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

import { authService } from "@/services";
import { roleUI } from "@/lib/ui/theme";
import type { UserRole, AppShellProps, UserSession } from "@/domain/types";
import { ROLE_LABELS, ROLE_ICONS } from "@/domain/types";

// =============================================================================
// WRAPPER Z AUTO-FETCH UŻYTKOWNIKA
// =============================================================================

export function AppShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await authService.getSession();
        if (result.success && result.data?.user) {
          setUser(result.data.user);
        } else {
          router.push("/welcome");
        }
      } catch {
        router.push("/welcome");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AppShellInner user={user}>{children}</AppShellInner>;
}

// =============================================================================
// KOMPONENT GŁÓWNY
// =============================================================================

export default function AppShellInner({ user, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Zamykanie menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const role = user.role as UserRole;

  const handleLogout = useCallback(async () => {
    setUserMenuOpen(false);
    await authService.logout();
    router.push("/");
  }, [router]);

  // Style zależne od roli
  const isAdmin = role === "ADMIN";
  const isLibrarian = role === "LIBRARIAN";

  // Funkcja sprawdzająca aktywną stronę
  const isActivePath = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  // Style dla przycisku nawigacji
  const getNavButtonStyle = (path: string) => {
    const active = isActivePath(path);
    if (isAdmin) {
      return active 
        ? "text-white bg-slate-700" 
        : "text-slate-400 hover:text-white hover:bg-slate-700";
    }
    return active 
      ? "text-slate-900 bg-white shadow-sm ring-1 ring-black/5" 
      : "text-slate-500 hover:text-slate-900";
  };

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
          {/* Lewa strona - Logo (klikalne) */}
          <button
            type="button"
            onClick={() => router.push(isAdmin ? "/admin" : "/")}
            className="flex items-center gap-2.5 group"
          >
            <div className={`w-8 h-8 ${isAdmin ? "bg-linear-to-tr from-indigo-500 to-purple-600" : "bg-indigo-600"} rounded-lg flex items-center justify-center text-white shadow-lg ${isAdmin ? "" : "shadow-indigo-500/30"} group-hover:scale-105 transition-transform`}>
              <i className="fas fa-book text-sm" aria-hidden="true"></i>
            </div>
            <span className={`text-lg font-bold tracking-tight ${isAdmin ? "text-white" : "text-slate-900"} group-hover:text-indigo-600 transition-colors`}>
              BiblioteQ
            </span>
          </button>

          {/* Środek - nawigacja dla LIBRARIAN/ADMIN */}
          {(role === "LIBRARIAN" || role === "ADMIN") && (
            <nav className={`hidden md:flex items-center p-1 rounded-lg border ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-gray-100/50 border-gray-200/50"}`}>
              {role === "LIBRARIAN" && (
                <button
                  onClick={() => router.push("/librarian")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getNavButtonStyle("/librarian")}`}
                >
                  Panel bibliotekarza
                </button>
              )}
              {role === "ADMIN" && (
                <>
                  <button
                    onClick={() => router.push("/admin")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getNavButtonStyle("/admin")}`}
                  >
                    Panel admina
                  </button>
                  <button
                    onClick={() => router.push("/admin/books")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getNavButtonStyle("/admin/books")}`}
                  >
                    Książki
                  </button>
                  <button
                    onClick={() => router.push("/admin/users")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getNavButtonStyle("/admin/users")}`}
                  >
                    Użytkownicy
                  </button>
                  <button
                    onClick={() => router.push("/admin/logs")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getNavButtonStyle("/admin/logs")}`}
                  >
                    Logi
                  </button>
                  <button
                    onClick={() => router.push("/librarian")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getNavButtonStyle("/librarian")}`}
                  >
                    Wypożyczenia
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Prawa strona - powiadomienia, użytkownik */}
          <div className="flex items-center gap-3">
            {/* Powiadomienia */}
            <button className={`relative p-2.5 rounded-xl transition-all ${isAdmin ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-900 hover:bg-gray-100"}`}>
              <i className="fas fa-bell" aria-hidden="true"></i>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Menu użytkownika */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
                  ${isAdmin 
                    ? "bg-slate-800 text-slate-200 border border-slate-700 hover:border-indigo-500 hover:bg-slate-700" 
                    : "bg-white text-slate-700 border border-gray-200 hover:border-indigo-400 hover:bg-gray-50 shadow-sm"
                  }
                  ${userMenuOpen ? (isAdmin ? "border-indigo-500 bg-slate-700" : "border-indigo-400 bg-gray-50") : ""}
                `}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isAdmin ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"}`}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="hidden sm:block text-left">
                  <div className={`font-semibold ${isAdmin ? "text-white" : "text-slate-900"}`}>{user.firstName} {user.lastName}</div>
                  <div className={`text-xs ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>{ROLE_LABELS[role]}</div>
                </div>
                <i className={`fas fa-chevron-down text-xs transition-transform ${userMenuOpen ? "rotate-180" : ""} ${isAdmin ? "text-slate-400" : "text-slate-400"}`} aria-hidden="true"></i>
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-xl border shadow-xl overflow-hidden z-50 ${isAdmin ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
                  {/* Nagłówek z danymi użytkownika */}
                  <div className={`px-4 py-3 border-b ${isAdmin ? "border-slate-700 bg-slate-800/50" : "border-gray-100 bg-gray-50/50"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${isAdmin ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"}`}>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <div className={`font-semibold ${isAdmin ? "text-white" : "text-slate-900"}`}>{user.firstName} {user.lastName}</div>
                        <div className={`text-xs ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>{user.email || ROLE_LABELS[role]}</div>
                      </div>
                    </div>
                  </div>

                  {/* Opcje menu */}
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); router.push("/profile"); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isAdmin ? "text-slate-300 hover:bg-slate-700 hover:text-white" : "text-slate-700 hover:bg-gray-100"}`}
                    >
                      <i className="fas fa-user w-4 text-center" aria-hidden="true"></i>
                      Mój profil
                    </button>
                    {role === "ADMIN" && (
                      <>
                        <button
                          onClick={() => router.push("/admin")}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getNavButtonStyle("/admin")}`}
                        >
                          Panel admina
                        </button>
                        <button
                          onClick={() => router.push("/admin/books")}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getNavButtonStyle("/admin/books")}`}
                        >
                          Książki
                        </button>
                        <button
                          onClick={() => router.push("/admin?tab=users")}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getNavButtonStyle("/admin?tab=users")}`}
                        >
                          Użytkownicy
                        </button>
                        <button
                          onClick={() => router.push("/admin?tab=logs")}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getNavButtonStyle("/admin?tab=logs")}`}
                        >
                          Logi
                        </button>
                        <button
                          onClick={() => router.push("/librarian")}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getNavButtonStyle("/librarian")}`}
                        >
                          Wypożyczenia
                        </button>
                      </>
                    )}
                    {role === "READER" && (
                      <>
                        <button
                          type="button"
                          onClick={() => { setUserMenuOpen(false); router.push("/profile?tab=borrowings"); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isAdmin ? "text-slate-300 hover:bg-slate-700 hover:text-white" : "text-slate-700 hover:bg-gray-100"}`}
                        >
                          <i className="fas fa-book w-4 text-center" aria-hidden="true"></i>
                          Moje wypożyczenia
                        </button>
                        <button
                          type="button"
                          onClick={() => { setUserMenuOpen(false); router.push("/profile?tab=fines"); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isAdmin ? "text-slate-300 hover:bg-slate-700 hover:text-white" : "text-slate-700 hover:bg-gray-100"}`}
                        >
                          <i className="fas fa-receipt w-4 text-center" aria-hidden="true"></i>
                          Kary
                        </button>
                        <button
                          type="button"
                          onClick={() => { setUserMenuOpen(false); router.push("/profile?tab=reviews"); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isAdmin ? "text-slate-300 hover:bg-slate-700 hover:text-white" : "text-slate-700 hover:bg-gray-100"}`}
                        >
                          <i className="fas fa-star w-4 text-center" aria-hidden="true"></i>
                          Recenzje
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); router.push("/profile?tab=settings"); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isAdmin ? "text-slate-300 hover:bg-slate-700 hover:text-white" : "text-slate-700 hover:bg-gray-100"}`}
                    >
                      <i className="fas fa-cog w-4 text-center" aria-hidden="true"></i>
                      Ustawienia
                    </button>
                  </div>

                  {/* Separator i wylogowanie */}
                  <div className={`border-t py-2 ${isAdmin ? "border-slate-700" : "border-gray-100"}`}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isAdmin ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" : "text-red-600 hover:bg-red-50"}`}
                    >
                      <i className="fas fa-sign-out-alt w-4 text-center" aria-hidden="true"></i>
                      Wyloguj się
                    </button>
                  </div>
                </div>
              )}
            </div>
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
