/**
 * =============================================================================
 * STYLES - Centralne definicje stylów dla całej aplikacji
 * =============================================================================
 * 
 * Ten plik zawiera wszystkie scentralizowane style Tailwind CSS.
 * Zamiast rozproszenych klas w komponentach, używamy zdefiniowanych tutaj
 * obiektów stylów, co zapewnia:
 * 
 * - Spójność wizualną w całej aplikacji
 * - Łatwą zmianę motywu (wystarczy zmienić w jednym miejscu)
 * - Czytelniejszy kod komponentów
 * - Reużywalność stylów
 * 
 * Struktura:
 * 1. Kolory i motywy według roli użytkownika
 * 2. Style komponentów UI (przyciski, inputy, karty)
 * 3. Style layoutu i nawigacji
 * 4. Style specyficzne dla sekcji
 * 
 * Użycie:
 * import { buttonStyles, cardStyles } from "@/styles";
 */

import { UserRole } from "@/domain/types";

// =============================================================================
// 1. MOTYWY KOLORYSTYCZNE WEDŁUG RÓL
// =============================================================================

/**
 * Główne motywy kolorystyczne dla każdej roli użytkownika.
 * Definiują tło, tekst i akcenty dla całego interfejsu.
 */
export const roleTheme = {
  ADMIN: {
    /** Tło główne strony */
    background: "bg-[#2b2b2b] text-gray-100 min-h-screen",
    /** Kolor tekstu */
    text: "text-gray-100",
    /** Tło nagłówka */
    headerBg: "bg-[#141414] border-b border-[#333]",
    /** Kolor tekstu nagłówka */
    headerText: "text-white",
    /** Tło karty */
    cardBg: "bg-[#1f1f1f] border border-gray-600",
    /** Kolor linków */
    linkColor: "text-blue-300",
    /** Kolor ikony dzwonka */
    bellColor: "text-gray-300 hover:text-white",
    /** Badge z rolą */
    roleBadge: "bg-[#222] text-gray-200 border border-[#333]",
    /** Przycisk wylogowania */
    logoutButton: "bg-blue-600 hover:bg-blue-500 text-white",
  },
  LIBRARIAN: {
    background: "bg-[#e5e5e5] text-gray-900 min-h-screen",
    text: "text-gray-900",
    headerBg: "bg-[#eaeaea] border-b border-gray-300",
    headerText: "text-gray-900",
    cardBg: "bg-[#f0f0f0] border border-gray-300",
    linkColor: "text-indigo-600",
    bellColor: "text-gray-600 hover:text-blue-600",
    roleBadge: "bg-gray-200 border border-gray-300",
    logoutButton: "bg-gray-800 hover:bg-gray-700 text-white",
  },
  USER: {
    background: "bg-white text-gray-900 min-h-screen",
    text: "text-gray-900",
    headerBg: "bg-white",
    headerText: "text-gray-900",
    cardBg: "bg-white border border-gray-200",
    linkColor: "text-blue-600",
    bellColor: "text-gray-600 hover:text-blue-600",
    roleBadge: "bg-gray-200 border border-gray-300",
    logoutButton: "bg-blue-600 hover:bg-blue-500 text-white",
  },
} as const;

/**
 * Pobiera motyw dla danej roli.
 */
export function getThemeForRole(role: UserRole) {
  return roleTheme[role];
}

// =============================================================================
// 2. STYLE KOMPONENTÓW UI
// =============================================================================

/**
 * Style przycisków - różne warianty.
 */
export const buttonStyles = {
  /** Przycisk główny (primary) */
  primary: `
    px-4 py-2 rounded-xl font-semibold text-white 
    bg-blue-600 hover:bg-blue-500 
    transition disabled:bg-gray-400 disabled:cursor-not-allowed
  `,
  
  /** Przycisk drugorzędny (secondary) */
  secondary: `
    px-4 py-2 rounded-xl font-semibold 
    bg-gray-200 hover:bg-gray-300 text-gray-800 
    transition
  `,
  
  /** Przycisk niebezpieczny (danger) */
  danger: `
    px-4 py-2 rounded-xl font-semibold text-white 
    bg-red-600 hover:bg-red-500 
    transition
  `,
  
  /** Przycisk ghost (bez tła) */
  ghost: `
    px-4 py-2 rounded-lg font-medium 
    hover:bg-gray-100 
    transition
  `,
  
  /** Mały przycisk akcji */
  action: `
    px-3 py-1.5 rounded-lg text-xs font-semibold 
    flex items-center gap-1 transition
  `,
  
  /** Przycisk tylko z ikoną */
  icon: `
    p-2 rounded-lg flex items-center justify-center transition
  `,
  
  /** Przycisk w paginacji */
  pagination: `
    px-4 py-2 rounded-full transition
  `,
  
  /** Przycisk nawigacyjny (zakładka) */
  tab: `
    px-4 py-1.5 rounded-lg font-semibold transition
  `,
  
  /** Przycisk w formularzu (pełna szerokość) */
  formSubmit: `
    w-full py-3 bg-blue-600 hover:bg-blue-700 
    transition text-white font-semibold rounded-xl shadow-md
  `,
  
  /** Przycisk powrotu */
  back: `
    px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 
    text-gray-800 font-medium transition
  `,
} as const;

/**
 * Style pól formularza (input, select, textarea).
 */
export const inputStyles = {
  /** Standardowe pole tekstowe */
  text: `
    w-full px-4 py-3 rounded-xl border border-gray-300 
    shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    bg-white text-gray-900
  `,
  
  /** Pole z ikoną (dodatkowy padding z lewej) */
  withIcon: `
    w-full px-12 py-3 rounded-xl border border-gray-300 
    focus:ring-blue-600 focus:border-blue-600 
    bg-white shadow-sm text-gray-900
  `,
  
  /** Pole hasła (dodatkowy padding z prawej na ikonę) */
  password: `
    w-full px-4 py-3 rounded-xl border border-gray-300 
    shadow-sm pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  `,
  
  /** Pole select (dropdown) */
  select: `
    px-4 py-2 rounded-xl border border-gray-300 
    bg-white text-gray-800 shadow-sm
  `,
  
  /** Pole textarea */
  textarea: `
    w-full border rounded-xl p-3 h-28
  `,
} as const;

/**
 * Style kart (cards).
 */
export const cardStyles = {
  /** Karta podstawowa */
  base: `
    rounded-2xl border p-6 shadow-sm
  `,
  
  /** Karta książki w katalogu */
  book: `
    group relative p-5 rounded-2xl shadow-xl border 
    backdrop-blur-sm transition-all
    hover:shadow-2xl hover:-translate-y-1
  `,
  
  /** Karta książki dla admina */
  bookAdmin: `
    group relative p-5 rounded-2xl shadow-xl border 
    backdrop-blur-sm transition-all
    hover:shadow-2xl hover:-translate-y-1
    bg-[#282828]/70 border-gray-600
  `,
  
  /** Karta książki dla bibliotekarza */
  bookLibrarian: `
    group relative p-5 rounded-2xl shadow-xl border 
    backdrop-blur-sm transition-all
    hover:shadow-2xl hover:-translate-y-1
    bg-white/90 border-gray-300
  `,
  
  /** Karta książki dla użytkownika */
  bookUser: `
    group relative p-5 rounded-2xl shadow-xl border 
    backdrop-blur-sm transition-all
    hover:shadow-2xl hover:-translate-y-1
    bg-white/95 border-gray-200
  `,
  
  /** Karta informacyjna (biała) */
  info: `
    bg-white rounded-2xl p-6 shadow-sm border
  `,
  
  /** Karta wypożyczenia */
  borrowing: `
    rounded-xl border bg-white p-4 shadow-sm animate-fade-in
  `,
  
  /** Karta z ostrzeżeniem (czerwona) */
  warning: `
    p-6 rounded-2xl bg-red-100 dark:bg-red-900 border border-red-300
  `,
} as const;

/**
 * Pobiera styl karty książki dla danej roli.
 */
export function getBookCardStyle(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return cardStyles.bookAdmin;
    case "LIBRARIAN":
      return cardStyles.bookLibrarian;
    default:
      return cardStyles.bookUser;
  }
}

// =============================================================================
// 3. STYLE STATUSÓW I BADGE'ÓW
// =============================================================================

/**
 * Style badge'ów statusu dostępności książki.
 */
export const availabilityBadge = {
  available: "bg-green-100 text-green-700",
  unavailable: "bg-red-100 text-red-700",
  base: "inline-block px-3 py-1 text-xs font-semibold rounded-full",
} as const;

/**
 * Style badge'ów statusu wypożyczenia.
 */
export const borrowingStatusBadge = {
  active: {
    class: "bg-green-100 text-green-700",
    dot: "bg-green-700",
  },
  dueSoon: {
    class: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-700",
  },
  overdue: {
    class: "bg-red-100 text-red-700",
    dot: "bg-red-700",
  },
  returned: {
    class: "bg-gray-100 text-gray-700",
    dot: "bg-gray-700",
  },
  base: "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
} as const;

/**
 * Style boxu statusu na stronie szczegółów książki.
 */
export const statusBox = {
  available: "bg-green-100 border-green-300",
  unavailable: "bg-red-100 border-red-300",
  base: "rounded-2xl p-5 flex justify-between items-center border",
  textAvailable: "text-green-900",
  textUnavailable: "text-red-900",
  subtextAvailable: "text-green-700",
  subtextUnavailable: "text-red-700",
} as const;

// =============================================================================
// 4. STYLE LAYOUTU
// =============================================================================

/**
 * Style głównych kontenerów i layoutu.
 */
export const layoutStyles = {
  /** Główny kontener treści */
  mainContent: "max-w-7xl mx-auto px-6 py-8",
  
  /** Kontener nagłówka */
  header: "w-full shadow-sm sticky top-0 z-50 transition",
  
  /** Wnętrze nagłówka */
  headerInner: "max-w-7xl mx-auto px-6 py-4 flex justify-between items-center",
  
  /** Siatka katalogu książek */
  bookGrid: "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8",
  
  /** Siatka szczegółów książki */
  bookDetailsGrid: "max-w-6xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10",
  
  /** Siatka wypożyczeń */
  borrowingsGrid: "grid gap-6 mt-8",
  
  /** Layout strony powitalnej */
  welcomeLayout: "grid min-h-screen md:grid-cols-[65%_35%] bg-white",
  
  /** Lewa część strony powitalnej (tło) */
  welcomeLeft: "left-bg relative hidden md:flex items-center justify-center",
  
  /** Prawa część strony powitalnej (formularz) */
  welcomeRight: "flex flex-col items-center justify-center px-10 py-14 bg-white",
} as const;

/**
 * Style nawigacji.
 */
export const navStyles = {
  /** Kontener nawigacji */
  container: "hidden md:flex gap-8 ml-10",
  
  /** Pojedynczy link nawigacyjny */
  link: "text-sm font-medium hover:text-blue-600",
  
  /** Zakładki */
  tabs: "flex items-center gap-3 bg-white border rounded-xl p-1 shadow-sm",
  
  /** Aktywna zakładka */
  tabActive: "px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold",
  
  /** Nieaktywna zakładka */
  tabInactive: "px-4 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100",
} as const;

// =============================================================================
// 5. STYLE TYPOGRAFII
// =============================================================================

/**
 * Style nagłówków i tekstu.
 */
export const textStyles = {
  /** Nagłówek strony (H1) */
  pageTitle: "text-4xl font-extrabold tracking-tight",
  
  /** Nagłówek sekcji (H2) */
  sectionTitle: "text-2xl font-bold mb-4",
  
  /** Nagłówek karty (H3) */
  cardTitle: "text-xl font-bold mb-4",
  
  /** Tytuł książki w karcie */
  bookTitle: "mt-4 font-semibold text-lg leading-tight",
  
  /** Autor w karcie */
  bookAuthor: "text-sm mt-1 opacity-80",
  
  /** Tekst opisu */
  description: "text-gray-600 text-lg",
  
  /** Tekst błędu */
  error: "text-red-600 font-semibold text-center",
  
  /** Tekst sukcesu */
  success: "text-green-600 font-semibold text-center",
  
  /** Tekst w formularzu logowania */
  formSubtitle: "mt-3 text-gray-500 text-5sm",
} as const;

// =============================================================================
// 6. STYLE OKŁADEK I OBRAZÓW
// =============================================================================

/**
 * Style okładek książek.
 */
export const coverStyles = {
  /** Kontener okładki w liście */
  list: `
    w-full h-56 rounded-xl overflow-hidden
    bg-gradient-to-br from-gray-100 to-gray-200
    flex items-center justify-center text-gray-400 text-sm
  `,
  
  /** Obrazek okładki */
  image: "object-cover w-full h-full transition-transform group-hover:scale-105",
  
  /** Kontener okładki na stronie szczegółów */
  detail: "rounded-2xl overflow-hidden shadow-lg w-80 h-[420px] bg-gray-100 flex items-center justify-center",
  
  /** Miniatura w liście wypożyczeń */
  thumbnail: "size-16 rounded-lg object-cover",
} as const;

// =============================================================================
// 7. STYLE PAGINACJI
// =============================================================================

/**
 * Style paginacji.
 */
export const paginationStyles = {
  /** Kontener paginacji */
  container: "flex justify-center items-center gap-2 pt-4",
  
  /** Przycisk strzałki */
  arrow: "px-3 py-2 rounded-full bg-white border shadow hover:bg-gray-50",
  
  /** Przycisk strony - aktywny */
  pageActive: "px-4 py-2 rounded-full bg-blue-600 text-white shadow",
  
  /** Przycisk strony - nieaktywny */
  pageInactive: "px-4 py-2 rounded-full bg-white border shadow hover:bg-gray-100",
} as const;

// =============================================================================
// 8. STYLE FORMULARZY AUTORYZACJI
// =============================================================================

/**
 * Style strony logowania/rejestracji.
 */
export const authStyles = {
  /** Tytuł strony */
  title: "text-4xl font-extrabold text-gray-900 tracking-tight",
  
  /** Kontener zakładek */
  tabsContainer: "border-b border-gray-200 flex justify-center",
  
  /** Nawigacja zakładek */
  tabsNav: "flex -mb-px space-x-10",
  
  /** Aktywna zakładka */
  tabActive: "pb-3 font-medium text-sm text-blue-600 border-b-2 border-blue-600",
  
  /** Nieaktywna zakładka */
  tabInactive: "pb-3 font-medium text-sm text-gray-500 hover:text-gray-700 transition",
  
  /** Przycisk toggle hasła */
  passwordToggle: "absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700",
  
  /** Duży tytuł na tle */
  heroTitle: "relative z-10 text-8xl xl:text-9xl font-extrabold text-white drop-shadow-lg tracking-tight",
  
  /** Overlay na tle */
  heroOverlay: "absolute inset-0 bg-black/40 backdrop-blur-xs",
} as const;

// =============================================================================
// 9. STYLE PANELU ADMINISTRACYJNEGO
// =============================================================================

/**
 * Style panelu admina według roli.
 */
export const adminPanelStyles = {
  ADMIN: {
    card: "bg-[#1f1f1f] border border-gray-600 p-6 rounded-2xl",
    header: "text-3xl font-bold text-white",
    subheader: "text-gray-400",
    label: "font-medium text-gray-300",
    value: "text-blue-400",
  },
  LIBRARIAN: {
    card: "bg-[#f0f0f0] border border-gray-300 p-6 rounded-2xl",
    header: "text-3xl font-bold text-gray-900",
    subheader: "text-gray-700",
    label: "font-medium text-gray-800",
    value: "text-indigo-700",
  },
  USER: {
    card: "bg-white border border-gray-200 p-6 rounded-2xl",
    header: "text-3xl font-bold text-gray-900",
    subheader: "text-gray-600",
    label: "font-medium text-gray-700",
    value: "text-blue-700",
  },
} as const;

// =============================================================================
// 10. STYLE RATINGU I TAGÓW
// =============================================================================

/**
 * Style ratingu (gwiazdki).
 */
export const ratingStyles = {
  container: "flex text-yellow-400 text-lg",
  starFilled: "fas fa-star",
  starEmpty: "far fa-star",
  text: "text-gray-600 text-sm",
} as const;

/**
 * Style tagów kategorii.
 */
export const tagStyles = {
  container: "flex gap-2 mt-4 flex-wrap",
  fantasy: "px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium",
  adventure: "px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium",
  classic: "px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium",
  kids: "px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium",
} as const;

// =============================================================================
// EKSPORT TYPU POMOCNICZEGO
// =============================================================================

/**
 * Typ dla klucza motywu roli.
 */
export type RoleThemeKey = keyof typeof roleTheme;
