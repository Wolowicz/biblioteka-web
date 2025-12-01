"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/index";

export default function ReserveButton({ bookId, available }: { bookId: number; available: boolean }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // --- WAŻNE: jeśli hook się jeszcze ładuje, nie pokazuj komunikatu "zaloguj się" ---
  if (isLoading) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-400 text-white"
      >
        Ładowanie...
      </button>
    );
  }

  const handleClick = async () => {
    if (!isAuthenticated || !user || !available || status === "loading") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Błąd");
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  // --- generowanie tekstu ---
  let buttonText = "Rezerwuj";

  if (!isAuthenticated) {
    buttonText = "Zaloguj się, aby rezerwować";
  } else if (!available) {
    buttonText = "Niedostępna";
  } else if (status === "loading") {
    buttonText = "Rezerwuję...";
  } else if (status === "success") {
    buttonText = "Zarezerwowano!";
  }

  const disabled =
    !available || status === "loading" || status === "success" || !isAuthenticated;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-xl text-sm font-semibold transition
        ${disabled ? "bg-gray-400 cursor-not-allowed text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}
      `}
    >
      {buttonText}
    </button>
  );
}
