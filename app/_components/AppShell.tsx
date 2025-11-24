// AppShell.tsx
"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserSession, clearUserSession } from "@/lib/auth-client";

// Design System
import {
  roleUI,
  headerUI,
  sidebarUI,
  headerLight,
  headerMid, 
  sidebarLight,
  panelUI,
} from "@/lib/ui/design";

import BorrowingsPanel from "../user/BorrowingsPanel";
import AdminPanel from "../admin/AdminPanel";

type ViewName = "catalog" | "borrowings" | "admin" | "reviews";

// =======================
// HEADER
// =======================
const Header = ({
  user,
  view,
  onViewChange,
}: {
  user: UserSession;
  view: ViewName;
  onViewChange: (view: ViewName) => void;
}) => {
  const router = useRouter();
  
  
  let H = headerUI; // default admin

if (user.role === "USER") {
  H = headerLight;
} else if (user.role === "LIBRARIAN") {
  H = headerMid;
}


  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}

    clearUserSession();
    router.push("/");
  }, [router]);

  const tabs = [
    { label: "Katalog", view: "catalog", roles: ["USER", "LIBRARIAN", "ADMIN"] },
    { label: "Moje wypożyczenia", view: "borrowings", roles: ["USER"] },
    { label: "Recenzje", view: "reviews", roles: ["USER", "LIBRARIAN", "ADMIN"] },
    { label: "Panel admina", view: "admin", roles: ["ADMIN"] },
  ];

  return (
    <header className={H.wrapper}>
      <div className="flex items-center gap-3">
        <Image src="/biblio.png" width={34} height={34} alt="logo" />
        <h1 className={H.logo}>BiblioteQ</h1>
      </div>

      <nav className="hidden md:flex gap-2">
  {tabs
    .filter((t) => t.roles.includes(user.role))
    .map((t) => {

      let base = "";
      let active = "";

      if (user.role === "USER") {
        base = "text-gray-700 hover:bg-gray-200";
        active = "bg-indigo-600 text-white shadow";
      }

      if (user.role === "LIBRARIAN") {
        base = "text-gray-800 hover:bg-gray-300";
        active = "bg-gray-300 text-gray-900 shadow";
      }

      if (user.role === "ADMIN") {
        base = "text-white/80 hover:bg-white/10";
        active = "bg-white/20 text-white shadow";
      }

      return (
        <button
          key={t.view}
          onClick={() => onViewChange(t.view as ViewName)}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            view === t.view ? active : base
          }`}
        >
          {t.label}
        </button>
      );
    })}
</nav>

      <div className={H.userMenu}>
        <button className={H.iconBtn}>
          <i className="fas fa-bell"></i>
        </button>

        <span className={H.roleBadge}>{user.role}</span>

        <button onClick={handleLogout} className={H.logoutBtn}>
          <i className="fas fa-sign-out-alt" />
          <span>Wyloguj</span>
        </button>
      </div>
    </header>
  );
};

// =======================
// SIDEBAR
// =======================
const Sidebar = ({ user }: { user: UserSession }) => {
  // ⬅️ KLUCZOWA ZMIANA: Jeśli rola to LIBRARIAN lub USER, używamy jasnej wersji Sidebara.
  const S = user.role === "ADMIN" ? sidebarUI : sidebarLight;

  return (
    <aside className={S.wrapper}>
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
    </aside>
  );
};

// =======================
// GŁÓWNY UKŁAD
// =======================
export default function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: UserSession;
}) {
  const [view, setView] = useState<ViewName>("catalog");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie…
      </div>
    );
  }

  const P = panelUI[user.role];
  const isPrivileged = user.role === "ADMIN" || user.role === "LIBRARIAN";

  return (
    <div className={roleUI[user.role].background}>
      <Header user={user} view={view} onViewChange={setView} />

      <main className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Sidebar user={user} />
        </div>

        {/* Content */}
        <section className={isPrivileged ? "lg:col-span-3" : "lg:col-span-4"}>
          {view === "catalog" && children}

          {view === "borrowings" && user.role === "USER" && (
            <BorrowingsPanel userRole={user.role} />
          )}

          {view === "reviews" && (
            <div className={P.card}>
              <h2 className={P.header}>Recenzje (do zrobienia)</h2>
              <p className={P.label}>Tu będą recenzje użytkowników</p>
            </div>
          )}

          {view === "admin" &&
            (isPrivileged ? (
              <AdminPanel user={user} />
            ) : (
              <p className="text-red-500">Brak dostępu</p>
            ))}
        </section>

        {/* Right Panel */}
        {isPrivileged && (
          <aside className="lg:col-span-1">
            <div className={P.card}>
              <h2 className={P.header}>Szybkie Akcje</h2>
              <p className={P.label}>Rola: {user.role}</p>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}