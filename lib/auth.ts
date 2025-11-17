// lib/auth.ts
// Typy ról w systemie - trzy poziomy uprawnień
export type UserRole = "USER" | "LIBRARIAN" | "ADMIN";

export function getRoleTheme(role: UserRole) {
  // zwracamy klasy Tailwind dla body / tła w zależności od roli
  switch (role) {
    case "ADMIN":
      // ciemny motyw
      return "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 text-slate-100";
    case "LIBRARIAN":
      // szare, neutralne tło
      return "bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-100 text-zinc-900";
    case "USER":
    default:
      // jasny, młodzieżowy
      return "bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-slate-900";
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
