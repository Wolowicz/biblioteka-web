// lib/auth-client.ts
// Moduł BEZPIECZNY do importowania przez komponenty klienckie (Client Components)

export type UserRole = "USER" | "LIBRARIAN" | "ADMIN";

export type UserSession = {
  id: string; 
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

const SESSION_KEY = "userSession";

// Funkcje klienckie (localStorage)
export function setUserSession(session: UserSession) {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function getUserSession(): UserSession | null {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? (JSON.parse(session) as UserSession) : null;
  }
  return null;
}

export function clearUserSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

// Walidacja hasła (również kliencka)
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Hasło musi mieć co najmniej 8 znaków";
  }
  if (!/[A-Z]/.test(password)) {
    return "Hasło musi zawierać co najmniej jedną wielką literę";
  }
  if (!/[a-z]/.test(password)) {
    return "Hasło musi zawierać co najmniej jedną małą literę";
  }
  if (!/[0-9]/.test(password)) {
    return "Hasło musi zawierać co najmniej jedną cyfrę";
  }
  if (!/[!@#$%^&*()_\-+=\[{\]};:,.<>/?]/.test(password)) {
    return "Hasło musi zawierać znak specjalny (np. !, @, #, ?)";
  }
  return null; 
}