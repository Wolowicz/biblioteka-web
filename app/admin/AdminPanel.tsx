"use client";

import { panelUI } from "@/lib/ui/design";
import { UserSession } from "@/lib/auth-client";

export default function AdminPanel({ user }: { user: UserSession }) {
  const P = panelUI[user.role]; // 💛 najważniejsza poprawka!

  return (
    <div className={P.wrapper}>
      <h1 className={P.header}>Panel Zarządzania ({user.role})</h1>

      {/* Zarządzanie rolami */}
      <div className={P.card}>
        <h2 className={P.subheader}>Zarządzanie Użytkownikami</h2>

        <button className={P.button}>
          <i className="fas fa-users-cog mr-2" /> Zarządzaj Rolami
        </button>
      </div>

      {/* Logi systemowe */}
      <div className={P.card}>
        <h2 className={P.subheader}>Logi Systemowe (Audyt)</h2>

        <div className={P.item}>
          <p className={P.label}>Admin zalogował się do systemu</p>
          <p className={P.value}>Anna Admin – 16.11.2025, 21:57:31</p>
          <p className={P.label}>Typ: Logowanie</p>
        </div>
      </div>

      {/* Kosz */}
      <div className={P.dangerCard}>
        <h2 className={P.dangerHeader}>
          <i className="fas fa-trash mr-2" />
          Kosz (Soft Delete)
        </h2>

        <p className="text-red-600 mb-4">
          Trafiają tu soft-usunięte elementy. Możesz je przywrócić lub usunąć na stałe.
        </p>

        <button className={P.dangerButton}>
          <i className="fas fa-folder-open mr-2" /> Przeglądaj elementy
        </button>
      </div>
    </div>
  );
}
