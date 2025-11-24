// app/_components/ReserveButton.tsx
"use client";

import { useState } from "react";
import { reserveButtonStyles } from "@/lib/ui/styles";
// ⬅️ NOWOŚĆ: Importujemy hook autoryzacyjny do pobrania ID użytkownika
import { useAuth } from "@/lib/hooks"; 

export default function ReserveButton({
  bookId,
  available,
}: {
  bookId: number; // identyfikator książki
  available: boolean;
}) {
  const { user, isAuthenticated, isLoading } = useAuth(); // ⬅️ Pobieramy dane sesji

  const [status, setStatus] =
    useState<"idle" | "loading" | "success" | "error">("idle");
    
  // ⬅️ ZMIENIONA FUNKCJA DO OBSŁUGI RZECZYWISTEJ REZERWACJI
  const handleClick = async () => {
    if (!isAuthenticated || !user || !available || status === "loading") return;
    
    setStatus("loading");

    try {
      // Wysłanie rzeczywistego żądania POST do API
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookId: bookId, 
          userId: user.id // ⬅️ Przekazujemy ID zalogowanego użytkownika
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Błąd rezerwacji");
      }
      
      // Sukces: symulujemy lekkie opóźnienie, aby pokazać stan "success"
      await new Promise((r) => setTimeout(r, 500)); 
      setStatus("success");
      
      // Opcjonalnie: odśwież stronę, aby zaktualizować stan dostępności książki
      // window.location.reload(); 

    } catch (err) {
      console.error("Reservation failed:", err);
      setStatus("error");
      // Można ustawić error message z powrotem na idle po chwili, aby umożliwić ponowną próbę
      setTimeout(() => setStatus("idle"), 3000); 
    }
  };

  // ⬅️ Aktualizacja logiki blokowania przycisku
  const isBlocked = !available || status === "loading" || status === "success" || isLoading;
  const isNotLoggedIn = !isAuthenticated || isLoading;

  let buttonText = "Zarezerwuj";
  let buttonTitle = available ? "Tworzy rezerwację/wypożyczenie" : "Brak dostępnych egzemplarzy";

  if (isLoading) {
      buttonText = "Ładowanie...";
      buttonTitle = "Trwa weryfikacja sesji.";
  } else if (isNotLoggedIn) {
      buttonText = "Zaloguj się, aby rezerwować";
      buttonTitle = "Musisz być zalogowany, aby rezerwować.";
  } else if (status === "loading") {
      buttonText = "Rezerwuję...";
  } else if (status === "success") {
      buttonText = "Zarezerwowano!";
      buttonTitle = "Pomyślnie zarezerwowano książkę.";
  } else if (!available) {
      buttonText = "Niedostępna";
      buttonTitle = "Brak dostępnych egzemplarzy.";
  }


  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isBlocked || isNotLoggedIn}
        className={reserveButtonStyles.base}
        title={buttonTitle}
      >
        {buttonText}
      </button>

      {status === "success" && (
        <p className={reserveButtonStyles.successMessage}>
          Zarezerwowano pomyślnie! Status zaktualizowany w bazie.
        </p>
      )}
      
      {status === "error" && (
          <p className="mt-2 text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 text-sm">
              Błąd rezerwacji. Spróbuj ponownie.
          </p>
      )}
    </div>
  );
}