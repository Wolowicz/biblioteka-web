"use client";

import { useState, useEffect } from "react";

export type UserRole = "USER" | "LIBRARIAN" | "ADMIN";

export type UserSession = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

// -----------------------------
// CLIENT-SIDE AUTH HOOK (zgodne z SSR + Cookies)
// -----------------------------

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  };
}

// -----------------------------
// ACTION HELPERS – do logowania i wylogowania
// -----------------------------

export async function authLogin(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res;
}

export async function authLogout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

// lib/auth/validate.ts

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Hasło musi mieć co najmniej 8 znaków";
  if (!/[A-Z]/.test(password)) return "Hasło musi zawierać dużą literę";
  if (!/[a-z]/.test(password)) return "Hasło musi zawierać małą literę";
  if (!/[0-9]/.test(password)) return "Hasło musi zawierać cyfrę";
  if (!/[!@#$%^&*]/.test(password)) return "Hasło musi zawierać znak specjalny";

  return null;
}
