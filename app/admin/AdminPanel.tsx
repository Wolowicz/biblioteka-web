"use client";

import { theme } from "@/lib/ui/theme";
import { UserSession } from "@/lib/auth/index";

export default function AdminPanel({ user }: { user: UserSession }) {
  const role = user.role;

  // ADMIN ma dark-theme, inni nie powinni tutaj trafić
  const T =
    role === "ADMIN"
      ? theme.admin
      : role === "LIBRARIAN"
      ? theme.librarian
      : theme.user;

  return (
    <div className="space-y-8">

      {/* ---- NAGŁÓWEK PANELU ---- */}
      <div className={`${T.card} p-6 rounded-2xl`}>
        <h1 className="text-3xl font-bold">
          Panel Zarządzania — {user.firstName} {user.lastName}
        </h1>
        <p className="opacity-80 mt-1">Rola: {user.role}</p>
      </div>

      {/* ---- ZARZĄDZANIE UŻYTKOWNIKAMI ---- */}
      <div className={`${T.card} p-6 rounded-2xl`}>
        <h2 className="text-xl font-bold mb-4">Zarządzanie użytkownikami</h2>

        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-2"
        >
          <i className="fas fa-users-cog"></i>
          Zarządzaj rolami
        </button>
      </div>

      {/* ---- LOGI SYSTEMOWE ---- */}
      <div className={`${T.card} p-6 rounded-2xl`}>
        <h2 className="text-xl font-bold mb-4">Logi systemowe</h2>

        <div className="space-y-2 opacity-90">
          <p>Admin zalogował się do systemu</p>
          <p className="font-medium">Anna Admin — 16.11.2025, 21:57:31</p>
          <p className="opacity-75">Typ: Logowanie</p>
        </div>
      </div>

      {/* ---- KOSZ (SOFT DELETE) ---- */}
      <div className="p-6 rounded-2xl bg-red-100 dark:bg-red-900 border border-red-300">
        <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
          <i className="fas fa-trash"></i>
          Kosz (Soft Delete)
        </h2>

        <p className="text-red-700 dark:text-red-300 mb-4">
          Tu znajdują się elementy usunięte logicznie (soft delete).
          Możesz je przywrócić lub usunąć trwale.
        </p>

        <button
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center gap-2"
        >
          <i className="fas fa-folder-open"></i>
          Przeglądaj elementy
        </button>
      </div>
    </div>
  );
}
