"use client";

import { useState } from "react";

export default function ReserveButton({
  bookId,
  available,
}: {
  bookId: number;
  available: boolean;
}) {
  const [status, setStatus] =
    useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClick = async () => {
    if (!available || status === "loading") return;
    setStatus("loading");

    // 🧪 DEMO: udajemy żądanie do API
    await new Promise((r) => setTimeout(r, 700));

    // 💬 W prawdziwej wersji tu poszłoby:
    // fetch("/api/reservations", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ bookId }),
    // });

    setStatus("success");
  };

  const disabled = !available || status === "loading" || status === "success";

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={disabled}
        className="mt-4 bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        title={
          available
            ? "Demo: tu byłaby rezerwacja"
            : "Brak dostępnych egzemplarzy"
        }
      >
        {status === "loading"
          ? "Rezerwuję…"
          : status === "success"
          ? "Zarezerwowano"
          : available
          ? "Zarezerwuj (demo)"
          : "Niedostępna"}
      </button>

      {status === "success" && (
        <p className="mt-2 text-green-700 bg-green-100 border border-green-300 rounded px-3 py-2">
          ✅ Zarezerwowano (demo)
        </p>
      )}
    </div>
  );
}
