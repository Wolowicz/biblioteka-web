// lib/auth.ts
// Typy ról w systemie - trzy poziomy uprawnień
export type UserRole = "USER" | "LIBRARIAN" | "ADMIN";

// ⬅️ NOWOŚĆ: Typ danych, które będziemy przechowywać po zalogowaniu
export type UserSession = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
};

// ⬅️ NOWOŚĆ: Nazwa, pod którą zapiszemy dane w pamięci przeglądarki
const STORAGE_KEY = "biblioteq_user_session";

// ⬅️ NOWOŚĆ: Funkcja do zapisywania danych zalogowanego użytkownika
export function setUserSession(user: UserSession) {
  // Sprawdzamy, czy jesteśmy w przeglądarce (po stronie klienta)
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
}

// ⬅️ NOWOŚĆ: Funkcja do odczytywania danych zalogowanego użytkownika
export function getUserSession(): UserSession | null {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem(STORAGE_KEY);
    try {
      // Jeśli dane istnieją, próbujemy je odczytać
      return session ? (JSON.parse(session) as UserSession) : null;
    } catch (e) {
      console.error("Failed to parse user session from localStorage:", e);
      return null;
    }
  }
  return null;
}

// ⬅️ NOWOŚĆ: Funkcja do "wylogowania" (usuwania danych z przeglądarki)
export function clearUserSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Walidacja hasła – wymagania bezpieczeństwa
export function validatePassword(password: string): string | null {
  // minimum 8 znaków, wielka litera, mała litera, cyfra i znak specjalny
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
  return null; // null = wszystko OK
}