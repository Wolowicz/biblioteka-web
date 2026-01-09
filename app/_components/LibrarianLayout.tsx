/**
 * =============================================================================
 * LIBRARIAN LAYOUT - Grey Mode Layout for Librarians
 * =============================================================================
 * 
 * Panel bibliotekarza z szarym motywem (jasniejszy od dark mode admina):
 * - Grey mode (#1F1F23 tło, #2D2D35 sidebar)
 * - Sidebar z nawigacją do głównych sekcji bibliotekarza
 * - Animacje i efekty premium
 * - Responsywność mobile-first
 * 
 * @packageDocumentation
 */

"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { UserSession } from "@/domain/types";

interface LibrarianLayoutProps {
  user: UserSession;
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export default function LibrarianLayout({ user, children }: LibrarianLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Nawigacja bibliotekarza - 5 głównych sekcji
  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "fa-home",
      path: "/librarian",
    },
    {
      id: "borrowings",
      label: "Wypożyczenia & Kary",
      icon: "fa-book-reader",
      path: "/librarian/borrowings",
    },
    {
      id: "inventory",
      label: "Ewidencja Książek",
      icon: "fa-books",
      path: "/librarian/inventory",
    },
    {
      id: "reviews",
      label: "Akceptacja Recenzji",
      icon: "fa-star-half-alt",
      path: "/librarian/reviews",
    },
    {
      id: "settings",
      label: "Ustawienia Konta",
      icon: "fa-user-cog",
      path: "/librarian/settings",
    },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/welcome");
  };

  const isActive = (path: string) => {
    if (path === "/librarian") {
      return pathname === "/librarian";
    }
    return pathname === path || pathname?.startsWith(path + "/");
  };

  return (
    <div className="min-h-screen bg-[#1F1F23] text-gray-100">
      {/* Sidebar - Grey mode (lighter than admin) */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#2D2D35] border-r border-gray-700/50 transition-all duration-300 z-50 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700/50">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <i className="fas fa-book-open text-lg text-white" aria-hidden="true"></i>
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">BiblioteQ</h1>
                <p className="text-xs text-gray-400">Panel Bibliotekarza</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto">
              <i className="fas fa-book-open text-lg text-white" aria-hidden="true"></i>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive(item.path)
                  ? "bg-linear-to-brrom-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20"
                  : "hover:bg-gray-700/50"
              }`}
            >
              <i 
                className={`fas ${item.icon} text-lg ${
                  isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-white"
                }`} 
                aria-hidden="true"
              ></i>
              {sidebarOpen && (
                <>
                  <span className={`font-medium ${isActive(item.path) ? "text-white" : "text-gray-300"}`}>
                    {item.label}
                  </span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Separator */}
        <div className="mx-4 my-4 border-t border-gray-700/50"></div>

        {/* Quick Info */}
        {sidebarOpen && (
          <div className="px-4">
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <i className="fas fa-info-circle" aria-hidden="true"></i>
                <span>Pomoc</span>
              </div>
              <p className="text-xs text-gray-500">
                Zarządzaj wypożyczeniami, książkami i recenzjami z tego panelu.
              </p>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-4 right-4 w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center transition-colors"
        >
          <i className={`fas fa-chevron-${sidebarOpen ? "left" : "right"} text-gray-400`} aria-hidden="true"></i>
        </button>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Bar */}
        <header className="h-16 bg-[#2D2D35] border-b border-gray-700/50 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              {navItems.find((item) => isActive(item.path))?.label || "Dashboard"}
            </h2>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center transition-colors">
              <i className="fas fa-bell text-gray-300" aria-hidden="true"></i>
            </button>

            {/* User Card */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600/30">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white">
                {user?.firstName?.[0] || "?"}{user?.lastName?.[0] || "?"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">{user?.firstName || "User"} {user?.lastName || ""}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Bibliotekarz
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 text-gray-400 hover:text-white transition-colors"
                title="Wyloguj"
              >
                <i className="fas fa-sign-out-alt" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-700/50 text-center text-sm text-gray-500">
          <p>BiblioteQ Panel Bibliotekarza v1.0 © 2026 • Grey Mode</p>
        </footer>
      </div>
    </div>
  );
}
