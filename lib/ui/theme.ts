/**
 * =============================================================================
 * UI THEME - Motywy wizualne aplikacji (LEGACY)
 * =============================================================================
 * 
 * UWAGA: Ten plik jest zachowany dla kompatybilności wstecznej.
 * Nowe komponenty powinny importować style z @/styles.
 * 
 * Ten moduł zawiera definicje motywów wizualnych dla różnych ról użytkowników.
 * Każda rola (ADMIN, LIBRARIAN, USER) ma przypisany unikalny zestaw kolorów
 * i stylów, co pozwala na wizualne rozróżnienie interfejsu.
 * 
 * Migracja:
 * Zamiast: import { roleUI, theme } from "@/lib/ui/theme";
 * Użyj:    import { roleTheme, getThemeForRole } from "@/styles";
 * 
 * Zależności:
 * - Tailwind CSS - klasy utility
 * - @/domain/types - typ UserRole
 */

import type { UserRole } from "@/domain/types";

// =============================================================================
// MOTYWY PODSTAWOWE (LEGACY)
// =============================================================================

/**
 * Podstawowe style tematyczne dla każdej roli.
 * 
 * @deprecated Użyj roleTheme z @/styles
 */
export const theme = {
  /** Admin - ciemny motyw (grafit) */
  admin: {
    bg: "bg-[#2b2b2b] text-gray-100",
    card: "bg-[#1f1f1f] border border-gray-600",
    link: "text-blue-300",
  },

  /** Bibliotekarz - jasny szary motyw */
  librarian: {
    bg: "bg-[#e5e5e5] text-gray-900",
    card: "bg-[#f0f0f0] border border-gray-300",
    link: "text-indigo-600",
  },

  /** Użytkownik - biały motyw */
  user: {
    bg: "bg-white text-gray-900",
    card: "bg-white border border-gray-200",
    link: "text-blue-600",
  },
} as const;

// =============================================================================
// MOTYWY INTERFEJSU WEDŁUG RÓL
// =============================================================================

/**
 * Style UI dla każdej roli użytkownika.
 * Używane głównie w AppShell i komponentach layoutu.
 * 
 * @deprecated Użyj roleTheme z @/styles
 */
export const roleUI = {
  /** Admin - ciemny grafit z jasnym tekstem */
  ADMIN: {
    background: "bg-[#2b2b2b] text-gray-100 min-h-screen",
    text: "text-gray-100",
  },
  
  /** Bibliotekarz - jasny szary */
  LIBRARIAN: {
    background: "bg-[#e5e5e5] text-gray-900 min-h-screen",
    text: "text-gray-900",
  },
  
  /** Czytelnik - czysty biały */
  READER: {
    background: "bg-white text-gray-900 min-h-screen",
    text: "text-gray-900",
  },
} as const;

// =============================================================================
// STYLE PANELI ADMINISTRACYJNYCH
// =============================================================================

/**
 * Rozszerzone style dla paneli administracyjnych i kart.
 * Zawierają style dla nagłówków, etykiet i wartości.
 * 
 * @deprecated Użyj adminPanelStyles z @/styles
 */
export const panelUI = {
  /** Style dla panelu admina */
  ADMIN: {
    card: "bg-[#1f1f1f] border border-gray-600 p-6 rounded-2xl",
    header: "text-3xl font-bold text-white",
    subheader: "text-gray-400",
    label: "font-medium text-gray-300",
    value: "text-blue-400",
  },

  /** Style dla panelu bibliotekarza */
  LIBRARIAN: {
    card: "bg-[#f0f0f0] border border-gray-300 p-6 rounded-2xl",
    header: "text-3xl font-bold text-gray-900",
    subheader: "text-gray-700",
    label: "font-medium text-gray-800",
    value: "text-indigo-700",
  },

  /** Style dla panelu czytelnika */
  READER: {
    card: "bg-white border border-gray-200 p-6 rounded-2xl",
    header: "text-3xl font-bold text-gray-900",
    subheader: "text-gray-600",
    label: "font-medium text-gray-700",
    value: "text-blue-700",
  },
} as const;

// =============================================================================
// STYLE KOMPONENTÓW
// =============================================================================

/**
 * Style dla przycisku rezerwacji.
 * 
 * @deprecated Użyj buttonStyles z @/styles
 */
export const reserveUI = {
  /** Bazowy styl przycisku */
  base: `
    px-4 py-2 rounded-xl font-semibold text-white 
    bg-indigo-600 hover:bg-indigo-500 
    disabled:bg-gray-400 disabled:cursor-not-allowed 
    transition
  `,
  /** Komunikat sukcesu */
  success: "mt-2 text-green-600 font-medium",
  /** Komunikat błędu */
  error: "mt-2 text-red-600 font-medium",
} as const;

/**
 * Style dla przycisku powrotu.
 * 
 * @deprecated Użyj buttonStyles.back z @/styles
 */
export const backUI = {
  base: `
    px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 
    text-gray-800 font-medium transition
  `,
} as const;

// =============================================================================
// MAPOWANIE I POMOCNICZE
// =============================================================================

/**
 * Mapowanie UserRole na klucz motywu w obiekcie `theme`.
 * 
 * Użycie:
 * ```typescript
 * const role = user.role; // "ADMIN"
 * const themeKey = themeMap[role]; // "admin"
 * const colors = theme[themeKey]; // { bg: "...", card: "...", link: "..." }
 * ```
 */
export const themeMap: Record<UserRole, keyof typeof theme> = {
  ADMIN: "admin",
  LIBRARIAN: "librarian",
  READER: "user",
};

/**
 * Typ klucza motywu.
 */
export type ThemeKey = keyof typeof theme;

/**
 * Pobiera motyw dla danej roli.
 * 
 * @param role - Rola użytkownika
 * @returns Obiekt z klasami CSS dla motywu
 * 
 * @deprecated Użyj getThemeForRole z @/styles
 */
export function getThemeForRole(role: UserRole) {
  const key = themeMap[role];
  return theme[key];
}
