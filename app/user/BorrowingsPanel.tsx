"use client";

import { theme } from "@/lib/ui/theme";
import { UserRole } from "@/lib/auth/index";

export default function BorrowingsPanel({
  userRole,
}: {
  userRole: UserRole;
}) {
  // wybieramy theme zależnie od roli
  const T =
    userRole === "ADMIN"
      ? theme.admin
      : userRole === "LIBRARIAN"
      ? theme.librarian
      : theme.user;

  return (
    <div className="space-y-8">

      {/* NAGŁÓWEK */}
      <div className={`${T.card} p-6 rounded-2xl shadow-md`}>
        <h1 className="text-2xl font-bold">Moje Wypożyczenia i Kary</h1>
        <p className="opacity-70 mt-1 text-sm">
          Przegląd aktualnych wypożyczeń oraz historii.
        </p>
      </div>

      {/* PRZYKŁADOWA KSIĄŻKA */}
      <div className={`${T.card} p-6 rounded-2xl shadow-md`}>
        <h2 className="text-xl font-semibold">Lalka</h2>

        <p className="opacity-80 mt-2">Autor: Bolesław Prus</p>
        <p className="opacity-80">Wypożyczono: 24.11.2025</p>
        <p className="opacity-80">Termin zwrotu: 24.12.2025</p>

        <div
          className={`flex justify-between items-center mt-4 pt-4 border-t ${
            userRole === "ADMIN"
              ? "border-gray-700"
              : userRole === "LIBRARIAN"
              ? "border-gray-500"
              : "border-gray-300"
          }`}
        >
          <span
            className={`font-semibold ${
              userRole === "ADMIN"
                ? "text-blue-300"
                : userRole === "LIBRARIAN"
                ? "text-indigo-700"
                : "text-blue-700"
            }`}
          >
            AKTYWNE
          </span>

          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow flex items-center gap-2"
          >
            <i className="fas fa-file-pdf"></i>
            Dokument PDF
          </button>
        </div>
      </div>
    </div>
  );
}
