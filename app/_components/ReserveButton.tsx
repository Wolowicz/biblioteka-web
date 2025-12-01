"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/index";
import { reserveUI } from "@/lib/ui/theme";

export default function ReserveButton({
  bookId,
  available,
}: {
  bookId: number;
  available: boolean;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleClick = async () => {
    if (!isAuthenticated || !user || !available || status === "loading")
      return;

    setStatus("loading");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      if (!res.ok) {
        const errorData = await res.json();

        if (res.status === 401) {
          alert("Musisz być zalogowana, aby rezerwować.");
        }

        throw new Error(errorData.error || "Błąd rezerwacji");
      }

      await new Promise((r) => setTimeout(r, 500));
      setStatus("success");
    } catch (_) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const isBlocked =
    !available || status === "loading" || status === "success" || isLoading;

  const isNotLoggedIn = !isAuthenticated || isLoading;

  let buttonText = "Zarezerwuj";

  if (isLoading) buttonText = "Ładowanie…";
  else if (isNotLoggedIn) buttonText = "Zaloguj się, aby rezerwować";
  else if (status === "loading") buttonText = "Rezerwuję…";
  else if (status === "success") buttonText = "Zarezerwowano!";
  else if (!available) buttonText = "Niedostępna";

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isBlocked || isNotLoggedIn}
        className={reserveUI.base}
      >
        {buttonText}
      </button>

      {status === "success" && (
        <p className={reserveUI.success}>Zarezerwowano pomyślnie!</p>
      )}

      {status === "error" && (
        <p className={reserveUI.error}>Błąd rezerwacji. Spróbuj ponownie.</p>
      )}
    </div>
  );
}
