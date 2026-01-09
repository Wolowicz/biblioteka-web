/**
 * =============================================================================
 * ADMIN LAYOUT - Premium Dark Mode Layout (Stripe/Revolut Style)
 * =============================================================================
 * 
 * Nowoczesny, minimalistyczny layout dla administratora z:
 * - Dark mode (czarne tło, białe akcenty)
 * - Sidebar z nawigacją do 6 głównych sekcji
 * - Animacje i efekty premium
 * - Responsywność mobile-first
 * 
 * @packageDocumentation
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { UserSession } from "@/domain/types";

interface AdminLayoutProps {
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

export function AdminLayout({ user, children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(0);

  // Nawigacja admina - 7 głównych sekcji
  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "fa-chart-line",
      path: "/admin/dashboard",
    },
    {
      id: "users",
      label: "Użytkownicy",
      icon: "fa-users",
      path: "/admin/users",
    },
    {
      id: "borrowings",
      label: "Wypożyczenia & Kary",
      icon: "fa-book-reader",
      path: "/admin/borrowings",
    },
    {
      id: "inventory",
      label: "Ewidencja Książek",
      icon: "fa-books",
      path: "/admin/inventory",
    },
    {
      id: "audit",
      label: "Logi i Audyt",
      icon: "fa-shield-alt",
      path: "/admin/audit",
    },
    {
      id: "reviews",
      label: "Moderacja Recenzji",
      icon: "fa-comment-dots",
      path: "/admin/reviews",
    },
    {
      id: "settings",
      label: "Ustawienia",
      icon: "fa-cog",
      path: "/admin/settings",
    },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/welcome");
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#141414] border-r border-gray-800 transition-all duration-300 z-50 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <i className="fas fa-shield-alt text-xl" aria-hidden="true"></i>
              </div>
              <div>
                <h1 className="font-bold text-lg">BiblioteQ</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg mx-auto">
              <i className="fas fa-shield-alt text-xl" aria-hidden="true"></i>
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
                  ? "bg-linear-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30"
                  : "hover:bg-gray-800/50"
              }`}
            >
              <i className={`fas ${item.icon} text-lg ${isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-white"}`} aria-hidden="true"></i>
              {sidebarOpen && (
                <>
                  <span className={`font-medium ${isActive(item.path) ? "text-white" : "text-gray-300"}`}>
                    {item.label}
                  </span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-4 right-4 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
        >
          <i className={`fas fa-chevron-${sidebarOpen ? "left" : "right"}`} aria-hidden="true"></i>
        </button>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Bar */}
        <header className="h-16 bg-[#141414] border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {navItems.find((item) => isActive(item.path))?.label || "Dashboard"}
            </h2>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
              <i className="fas fa-bell" aria-hidden="true"></i>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Card */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
                {user?.firstName?.[0] || "?"}{user?.lastName?.[0] || "?"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.firstName || "User"} {user?.lastName || ""}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {user?.role === "ADMIN" ? "Administrator" : "Bibliotekarz"}
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
        <footer className="px-6 py-4 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>BiblioteQ Admin Panel v1.0 © 2026 • Dark Mode Enabled</p>
        </footer>
      </div>
    </div>
  );
}
