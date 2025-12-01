"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { UserSession, UserRole, authLogout } from "@/lib/auth/index";
import { theme, roleUI, themeMap } from "@/lib/ui/theme";


export default function AppShell({
  user,
  children,
}: {
  user: UserSession;
  children: React.ReactNode;
}) {
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie…
      </div>
    );
  }

  const role = user.role as UserRole;
  const T = theme[themeMap[role]];

  const ROLE_LABELS: Record<UserRole, string> = {
    ADMIN: "Administrator",
    LIBRARIAN: "Bibliotekarz",
    USER: "Czytelnik",
  };

  const ROLE_ICONS: Record<UserRole, string> = {
    ADMIN: "fas fa-user-shield",
    LIBRARIAN: "fas fa-book",
    USER: "fas fa-user",
  };

  const handleLogout = useCallback(async () => {
    await authLogout();
    router.push("/");
  }, [router]);

  return (
    <div className={`${roleUI[role].background}`}>

      {/* HEADER */}
      <header
        className={`w-full shadow-sm sticky top-0 z-50 transition
          ${
            role === "ADMIN"
              ? "bg-[#141414] border-b border-[#333]"
              : role === "LIBRARIAN"
              ? "bg-[#eaeaea] border-b border-gray-300"
              : "bg-white"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* LEWO */}
          <div className="flex items-center gap-4">
            <Image src="/biblio.png" alt="logo" width={28} height={28} />

            <h1
              className={`text-xl font-bold ${
                role === "ADMIN" ? "text-white" : "text-gray-900"
              }`}
            >
              BiblioteQ
            </h1>

            {/* NAV */}
            <nav className="hidden md:flex gap-8 ml-10">
              <button
                onClick={() => router.push("/")}
                className="text-sm font-medium hover:text-blue-600"
              >
                Katalog
              </button>

              {role === "USER" && (
                <button
                  onClick={() => router.push("/borrowings")}
                  className="text-sm font-medium hover:text-blue-600"
                >
                  Moje wypożyczenia
                </button>
              )}

              {role === "ADMIN" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="text-sm font-medium hover:text-blue-600"
                >
                  Panel admina
                </button>
              )}
            </nav>
          </div>

          {/* PRAWO */}
          <div className="flex items-center gap-4">
            <i
              className={`fas fa-bell ${
                role === "ADMIN"
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-blue-600"
              } cursor-pointer`}
            ></i>

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2
                ${
                  role === "ADMIN"
                    ? "bg-[#222] text-gray-200 border border-[#333]"
                    : "bg-gray-200 border border-gray-300"
                }`}
            >
              <i className={ROLE_ICONS[role]}></i>
              {user.firstName} {user.lastName} — {ROLE_LABELS[role]}
            </span>

            <button
              onClick={handleLogout}
              className={`px-4 py-2 rounded-full transition font-bold
                ${
                  role === "ADMIN"
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : role === "LIBRARIAN"
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
            >
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      {/* TREŚĆ */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
