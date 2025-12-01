"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserSession, clearUserSession, UserRole } from "@/lib/auth-client";

import { headerUI, sidebarUI, roleUI, panelUI } from "@/lib/ui/design";

import BorrowingsPanel from "../user/BorrowingsPanel";
import AdminPanel from "../admin/AdminPanel";

type ViewName = "catalog" | "borrowings" | "admin" | "reviews";

export default function AppShell({
  user,
  children,
}: {
  user?: UserSession;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [view, setView] = useState<ViewName>("catalog");

  // brak usera → ładowanie
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie…
      </div>
    );
  }

  // ---------------------------------------------
  // BEZPIECZNY WYBÓR ROLI (typowany!)
  // ---------------------------------------------
  const availableRoles: UserRole[] = ["USER", "ADMIN", "LIBRARIAN"];

  const roleKey: UserRole =
    availableRoles.includes(user.role as UserRole)
      ? (user.role as UserRole)
      : "USER";

  // ---------------------------------------------
  // UI zależne od roli — zawsze poprawne
  // ---------------------------------------------
  const H = headerUI[roleKey];
  const S = sidebarUI[roleKey];
  const P = panelUI[roleKey];
  const background = roleUI[roleKey].background;


  // Mapowanie ról na polskie nazwy (bez nowego modułu)
const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  LIBRARIAN: "Bibliotekarz",
  USER: "Czytelnik",
};

// Opcjonalne ikonki do ról
const ROLE_ICONS: Record<UserRole, string> = {
  ADMIN: "fas fa-user-shield",
  LIBRARIAN: "fas fa-book",
  USER: "fas fa-user",
};



  const isPrivileged = roleKey === "ADMIN" || roleKey === "LIBRARIAN";

  const tabs = [
    { label: "Katalog", view: "catalog", roles: ["USER", "LIBRARIAN", "ADMIN"] },
    { label: "Moje wypożyczenia", view: "borrowings", roles: ["USER"] },
    { label: "Recenzje", view: "reviews", roles: ["USER", "LIBRARIAN", "ADMIN"] },
    { label: "Panel admina", view: "admin", roles: ["ADMIN"] },
  ];

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    clearUserSession();
    router.push("/");
  }, [router]);

  return (
    <div className={background}>
      {/* ---------------- HEADER ---------------- */}
      <header className={H.wrapper}>
        <div className="flex items-center gap-3">
          <Image src="/biblio.png" alt="logo" width={34} height={34} />
          <h1 className={H.logo}>BiblioteQ</h1>
        </div>

        <nav className="hidden md:flex gap-2">
          {tabs
            .filter((t) => t.roles.includes(roleKey))
            .map((t) => (
              <button
                key={t.view}
                onClick={() => setView(t.view as ViewName)}
                className={view === t.view ? H.tabActive : H.tabBase}
              >
                {t.label}
              </button>
            ))}
        </nav>

        <div className={H.userMenu}>
          <button className={H.iconBtn}>
            <i className="fas fa-bell"></i>
          </button>

          <span className={H.roleBadge}>
          <i className={`${ROLE_ICONS[roleKey]} mr-1`} />
          {user.firstName} {user.lastName} — {ROLE_LABELS[roleKey]}
          </span>


          <button onClick={handleLogout} className={H.logoutBtn}>
            <i className="fas fa-sign-out-alt" />
            <span>Wyloguj</span>
          </button>
        </div>
      </header>

      {/* ---------------- LAYOUT ---------------- */}
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
        {/* ---- Sidebar ---- */}
        <aside className="lg:col-span-1">
          <div className={S.wrapper}>
            <h2 className={S.section}>Kategorie</h2>
            <div className="space-y-1">
              <div className={S.item}>Fantastyka</div>
              <div className={S.item}>Historia</div>
            </div>

            <h2 className={S.section}>Sortowanie</h2>
            <div className={S.toggle}>
              <span className="text-sm">Najnowsze</span>
              <input type="checkbox" className="hidden" defaultChecked />
            </div>

            <div className={S.toggle}>
              <span className="text-sm">Ocena</span>
              <input type="checkbox" className="hidden" />
            </div>
          </div>
        </aside>

        {/* ---- Content ---- */}
        <section className={isPrivileged ? "lg:col-span-3" : "lg:col-span-4"}>
          {view === "catalog" && children}

          {view === "borrowings" && roleKey === "USER" && (
            <BorrowingsPanel userRole={roleKey} />
          )}

          {view === "reviews" && (
            <div className={P.card}>
              <h2 className={P.header}>Recenzje (do zrobienia)</h2>
              <p className={P.label}>Tu będą recenzje użytkowników.</p>
            </div>
          )}

          {view === "admin" &&
            (isPrivileged ? (
              <AdminPanel user={user} />
            ) : (
              <p className="text-red-500">Brak dostępu.</p>
            ))}
        </section>

        {/* ---- Right Panel ---- */}
        {isPrivileged && (
          <aside className="lg:col-span-1">
            <div className={P.card}>
              <h2 className={P.header}>Szybkie Akcje</h2>
              <p className={P.label}>Rola: {roleKey}</p>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
