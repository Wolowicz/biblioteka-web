/**
 * =============================================================================
 * BACK BUTTON - Przycisk powrotu do poprzedniej strony
 * =============================================================================
 * 
 * Prosty komponent przycisku "Powrót" używający historii przeglądarki.
 * Stylowanie dostosowuje się do roli użytkownika.
 * 
 * Jest to Client Component ze względu na:
 * - Użycie useRouter (nawigacja)
 * - Użycie useAuth (stan sesji)
 * 
 * Zależności:
 * - next/navigation - router do nawigacji
 * - @/lib/auth - hook useAuth do pobierania roli
 * - @/lib/ui/theme - style (backUI, roleUI)
 */

"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { backUI, roleUI } from "@/lib/ui/theme";
import type { UserRole } from "@/domain/types";

// =============================================================================
// KOMPONENT
// =============================================================================

/**
 * Przycisk powrotu do poprzedniej strony.
 * 
 * Używa router.back() do nawigacji wstecz w historii przeglądarki.
 * Styl tekstu dostosowuje się do aktualnej roli użytkownika.
 * 
 * @returns JSX przycisku "← Powrót"
 * 
 * @example
 * ```tsx
 * // Na stronie szczegółów książki
 * <div className="p-6">
 *   <BackButton />
 *   <h1>Tytuł książki</h1>
 * </div>
 * ```
 */
export default function BackButton() {
  // Router do nawigacji
  const router = useRouter();
  
  // Pobierz dane użytkownika (dla stylowania)
  const { user } = useAuth();

  // Domyślna rola jeśli użytkownik nie jest zalogowany
  const role: UserRole = user?.role || "USER";

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  
  return (
    <button
      onClick={() => router.back()}
      className={`${backUI.base} ${roleUI[role].text}`}
      aria-label="Powrót do poprzedniej strony"
    >
      ← Powrót
    </button>
  );
}
