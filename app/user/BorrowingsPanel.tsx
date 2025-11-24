"use client";

import { panelUI, roleUI } from "@/lib/ui/design";
import { UserRole } from "@/lib/auth-client";

export default function BorrowingsPanel({
  userRole,
}: {
  userRole: UserRole;
}) {
  const P = panelUI[userRole];   // poprawne typowanie
  const R = roleUI[userRole];    // poprawne typowanie

  return (
    <div className={P.wrapper}>
      <h1 className={P.header}>Moje Wypożyczenia i Kary</h1>

      <div className={P.card}>
        <h2 className={P.subheader}>Lalka</h2>

        <p className={P.label}>Autor: Bolesław Prus</p>
        <p className={P.label}>Wypożyczono: 24.11.2025</p>
        <p className={P.label}>Termin zwrotu: 24.12.2025</p>

        <div
          className={`flex justify-between mt-4 pt-4 ${
            userRole === "USER"
              ? "border-t border-gray-300"
              : "border-t border-white/20"
          }`}
        >
          <span
            className={
              userRole === "USER"
                ? "text-blue-700 font-semibold"
                : "text-blue-300 font-semibold"
            }
          >
            AKTYWNE
          </span>

          <button className={P.button}>
            <i className="fas fa-file-pdf mr-2" /> Dokument PDF
          </button>
        </div>
      </div>
    </div>
  );
}
