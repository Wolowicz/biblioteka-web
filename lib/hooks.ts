// lib/hooks.ts
"use client";
import { useState, useEffect } from "react";
// ⬅️ ZMIANA: Importujemy z nowego modułu klienckiego
import { getUserSession, UserSession, UserRole } from "@/lib/auth-client"; 

// Hook (hak) do sprawdzania, czy użytkownik jest zalogowany
export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getUserSession();
    setUser(session);
    setIsLoading(false); 
  }, []);

  return { 
    user, 
    isLoading, 
    isAuthenticated: user !== null, 
    role: user?.role as UserRole | undefined
  };
}