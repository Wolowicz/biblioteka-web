"use client";

/**
 * =============================================================================
 * BOOK ACTIONS - Przyciski akcji dla książki (Rezerwuj/Oddaj)
 * =============================================================================
 * 
 * Komponent sprawdzający status wypożyczenia i wyświetlający odpowiednie przyciski.
 * 
 * @packageDocumentation
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/index";

interface BookActionsProps {
  bookId: number;
  available: boolean;
  variant?: "full" | "compact";
}

export default function BookActions({ bookId, available, variant = "full" }: BookActionsProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [hasBorrowed, setHasBorrowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [actionType, setActionType] = useState<"reserve" | "return" | null>(null);

  // Sprawdź status wypożyczenia przy montowaniu i gdy zmieni się auth
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      setIsLoading(false);
      setHasBorrowed(false);
      return;
    }

    checkBorrowingStatus();
  }, [bookId, isAuthenticated, authLoading]);

  const checkBorrowingStatus = async () => {
    try {
      const res = await fetch(`/api/borrowings/check?bookId=${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setHasBorrowed(data.hasBorrowed);
      }
    } catch {
      console.error("Błąd sprawdzania wypożyczenia");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!isAuthenticated || hasBorrowed || !available || actionStatus === "loading") return;

    setActionStatus("loading");
    setActionType("reserve");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      if (!res.ok) {
        throw new Error("Błąd rezerwacji");
      }

      setActionStatus("success");
      setHasBorrowed(true);
    } catch {
      setActionStatus("error");
      setTimeout(() => setActionStatus("idle"), 3000);
    }
  };

  const handleReturn = async () => {
    if (!isAuthenticated || !hasBorrowed || actionStatus === "loading") return;

    setActionStatus("loading");
    setActionType("return");

    try {
      const res = await fetch("/api/borrowings/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      if (!res.ok) {
        throw new Error("Błąd oddawania");
      }

      setActionStatus("success");
      setHasBorrowed(false);
      
      // Reset status po 2 sekundach
      setTimeout(() => {
        setActionStatus("idle");
        setActionType(null);
      }, 2000);
    } catch {
      setActionStatus("error");
      setTimeout(() => setActionStatus("idle"), 3000);
    }
  };

  // Podczas ładowania auth lub statusu
  if (authLoading || isLoading) {
    return (
      <div className={`${variant === "full" ? "space-y-3" : "flex gap-2"}`}>
        <button
          disabled
          className={`
            ${variant === "full" ? "w-full py-3" : "flex-1 py-1.5 px-3"} 
            rounded-xl text-sm font-semibold bg-gray-300 text-gray-500 animate-pulse
          `}
        >
          Ładowanie...
        </button>
      </div>
    );
  }

  // Niezalogowany użytkownik
  if (!isAuthenticated) {
    return (
      <div className={`${variant === "full" ? "space-y-3" : "flex gap-2"}`}>
        <button
          disabled
          className={`
            ${variant === "full" ? "w-full py-3" : "flex-1 py-1.5 px-3"} 
            rounded-xl text-sm font-semibold bg-gray-400 text-white cursor-not-allowed
          `}
        >
          Zaloguj się
        </button>
      </div>
    );
  }

  const isCompact = variant === "compact";

  return (
    <div className={`${isCompact ? "flex gap-2" : "space-y-3"}`}>
      {/* Przycisk Rezerwuj */}
      <button
        onClick={handleReserve}
        disabled={hasBorrowed || !available || actionStatus === "loading"}
        className={`
          ${isCompact ? "flex-1 py-1.5 px-3" : "w-full py-3"} 
          rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2
          ${hasBorrowed || !available || actionStatus === "loading"
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-blue-600 hover:bg-blue-500 text-white"
          }
        `}
      >
        {actionStatus === "loading" && actionType === "reserve" && (
          <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
        )}
        {actionStatus === "success" && actionType === "reserve" && (
          <i className="fas fa-check" aria-hidden="true"></i>
        )}
        {hasBorrowed 
          ? "Wypożyczona" 
          : !available 
            ? "Niedostępna" 
            : actionStatus === "loading" && actionType === "reserve"
              ? "Rezerwuję..."
              : "Rezerwuj"
        }
      </button>

      {/* Przycisk Oddaj - widoczny tylko gdy ma wypożyczenie */}
      <button
        onClick={handleReturn}
        disabled={!hasBorrowed || actionStatus === "loading"}
        className={`
          ${isCompact ? "flex-1 py-1.5 px-3" : "w-full py-3"} 
          rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2
          ${!hasBorrowed || actionStatus === "loading"
            ? "bg-gray-300 cursor-not-allowed text-gray-500"
            : "bg-emerald-600 hover:bg-emerald-500 text-white"
          }
        `}
      >
        {actionStatus === "loading" && actionType === "return" && (
          <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
        )}
        {actionStatus === "success" && actionType === "return" && (
          <i className="fas fa-check" aria-hidden="true"></i>
        )}
        <i className={`fas fa-undo ${actionStatus === "loading" && actionType === "return" ? "hidden" : ""}`} aria-hidden="true"></i>
        {actionStatus === "loading" && actionType === "return"
          ? "Oddaję..."
          : actionStatus === "success" && actionType === "return"
            ? "Oddano!"
            : "Oddaj"
        }
      </button>
    </div>
  );
}
