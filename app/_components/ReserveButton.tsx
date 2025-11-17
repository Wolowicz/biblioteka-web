"use client";

import { useState } from "react";//Importujemy hook useState.Hook pozwala stworzyć zmienne „żyjące” wewnątrz komponentu — tutaj będzie to stan przycisku (np. idle, loading, success).

export default function ReserveButton({
  bookId,
  available,
}: {
  bookId: number; //identyfikator książki
  available: boolean;
}) {
  const [status, setStatus] =
    useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClick = async () => {
    if (!available || status === "loading") return;
    setStatus("loading");

    // póki co DEMO: udajemy żądanie do API, fakowe obietnica do połączenia z bazą (to do wysłanie fetch POST do /api/reservations)
    await new Promise((r) => setTimeout(r, 700));

    setStatus("success");
  };

  const disabled = !available || status === "loading" || status === "success";
//Przycisk jest zablokowany, gdy:książka jest niedostępna

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
          Zarezerwowano (demo)
        </p>
      )}
    </div>
  );
}
