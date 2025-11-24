// lib/hooks.ts
"use client";
import { useState, useEffect } from "react";
// ⬅️ Importujemy funkcje i typy z lib/auth, które umożliwiają odczyt sesji
import { getUserSession, UserSession, UserRole } from "@/lib/auth";

// Hook (hak) do sprawdzania, czy użytkownik jest zalogowany
export function useAuth() {
  // Stan, w którym przechowujemy dane użytkownika (jeśli jest zalogowany)
  const [user, setUser] = useState<UserSession | null>(null);
  // Stan, który mówi, czy nadal "ładujemy" dane (sprawdzamy, czy jest zalogowany)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ta funkcja uruchomi się raz po załadowaniu komponentu klienckiego
    // ⬅️ Pobieramy dane sesji (z pamięci przeglądarki)
    const session = getUserSession();
    setUser(session);
    setIsLoading(false); // Kończymy ładowanie
  }, []);

  // Zwracamy status i dane użytkownika
  return { 
    user, 
    isLoading, 
    isAuthenticated: user !== null, // Czy jest zalogowany?
    role: user?.role as UserRole | undefined // Jaka jest jego rola?
  };
}