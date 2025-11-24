// lib/auth.ts
// ⬅️ Ten plik służy jako punkt wejścia do typów, aby uniknąć błędów Client/Server

// ⬅️ UWAGA: Ten plik nie może zawierać ani 'server-only', ani cookies, ani logiki localStorage.

export type { UserRole, UserSession } from "@/lib/auth-client";
// Zapewniamy kompatybilność dla komponentów klienckich, które potrzebują tylko typów.

// Wszystkie funkcje (getUserSession, validatePassword) zostały przeniesione do:
// - lib/auth-client.ts (dla Client Components)
// - lib/auth-server.ts (dla Server Components/API)