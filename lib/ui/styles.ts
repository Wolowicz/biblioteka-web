// lib/ui/styles.ts
// Definicje wyglądu (design system) w stylu obiektowym.

import { UserRole } from "@/lib/auth";

// Motywy tła w zależności od roli (dla strony logowania, po udanym logowaniu)
export const roleThemes: Record<UserRole, string> = {
  // ADMIN: ciemny motyw
  ADMIN: "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 text-slate-100",
  // LIBRARIAN: szare, neutralne tło
  LIBRARIAN: "bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-100 text-zinc-900",
  // USER: jasny, młodzieżowy
  USER: "bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-slate-900",
};

// Ogólne klasy dla kart formularzy (login / rejestracja)
export const authCard = {
  wrapper: "max-w-md w-full",
  card:
    "rounded-2xl p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl",
  headerWrapper: "text-center mb-6",
  title: "text-3xl font-bold tracking-tight",
  subtitle: "text-sm opacity-80 mt-1",
  // Styl dla logowania, zanim rola jest znana (widok domyślny)
  unloggedBackground: "bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 text-white",
};

// Wspólne style pól formularza i elementów dla strony logowania
export const loginFormStyles = {
  // Dla pól input (email i hasło)
  input:
    "w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60",
  // Dla sekcji hasła z oczkiem
  passwordWrapper: "relative",
  passwordInputPadding: "pr-10", // Dodatkowy padding dla inputu w sekcji hasła
  passwordToggle:
    "absolute inset-y-0 right-2 flex items-center text-sm opacity-80 hover:opacity-100",
  // Dla pomocniczego tekstu o wymaganiach hasła
  helperText: "mt-1 text-xs opacity-80",
  // Dla komunikatu o błędzie
  error:
    "text-sm text-red-200 bg-red-900/50 rounded-lg px-3 py-2",
  // Styl przycisku logowania
  button:
    "w-full bg-white text-purple-700 py-2.5 rounded-lg font-semibold hover:bg-white/90 transition flex items-center justify-center",
  // Styl animacji ładowania
  loadingSpinner: "h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin",
  // Styl linku do rejestracji
  registerLink: "underline font-semibold",
  // Styl roli po zalogowaniu
  loggedRole: "mt-4 text-xs opacity-80 text-center",
  footerText: "mt-4 text-center text-sm",
};

// Wspólne style pól formularza dla strony rejestracji
export const registerFormStyles = {
  wrapper: "min-h-screen bg-linear-to-br from-sky-400 via-emerald-400 to-teal-500 flex items-center justify-center px-4 text-slate-900",
  card: "max-w-lg w-full rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl p-8 space-y-6",
  headerTitle: "text-3xl font-bold",
  headerSubtitle: "text-sm text-slate-600 mt-1",
  input: "w-full border rounded-lg px-3 py-2",
  // ⬅️ NOWOŚĆ: Dodajemy style dla funkcjonalności odkrywania hasła
  passwordWrapper: "relative",
  passwordInputPadding: "pr-10", 
  passwordToggle: "absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 text-sm",
  // ⬅️ Koniec nowości
  helperText: "mt-1 text-xs text-slate-500",
  error: "text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2",
  success: "text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2",
  button: "w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-lg transition",
  loginLink: "underline font-semibold text-emerald-700",
};

// Style katalogu książek – karta na liście (ClientFilter.tsx)
export const bookCardStyles = {
  input: "w-full border p-3 rounded", // pole wyszukiwania
  wrapper: "border rounded p-4",
  title: "font-semibold",
  authors: "text-sm text-gray-600",
  badgeAvailable: "text-xs bg-gray-200 inline-block px-2 py-1 rounded mt-2",
  badgeUnavailable: "text-xs bg-gray-200 inline-block px-2 py-1 rounded mt-2",
  link: "mt-3 inline-block underline",
  noResults: "text-gray-600",
};

// Style przycisku rezerwacji (ReserveButton.tsx)
export const reserveButtonStyles = {
  base: "mt-4 bg-black text-white px-4 py-2 rounded disabled:opacity-50",
  successMessage:
    "mt-2 text-green-700 bg-green-100 border border-green-300 rounded px-3 py-2",
};

// Style strony szczegółów książki (books/[id]/page.tsx)
export const bookDetailsStyles = {
  mainWrapper: "p-6 max-w-2xl mx-auto space-y-3",
  title: "text-2xl font-bold", // Użyte też jako nagłówek 'Katalog' w app/page.tsx
  authors: "text-gray-700",
  detailsWrapper: "text-sm text-gray-600 space-y-1",
  statusBadge: "inline-block px-2 py-1 rounded bg-gray-200",
};

// Style przycisku powrotu (BackButton.tsx)
export const backButtonStyles = {
  base: "mt-6 bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded",
};

// ⬅️ NOWOŚĆ: Style dla nowego układu strony (AppShell)
// NOWOŚĆ: Style dla nowego układu strony (AppShell)
export const shellStyles = {
    header: {
        wrapper: "flex justify-between items-center bg-white shadow p-4 sticky top-0 z-10",
        logo: "text-2xl font-bold text-indigo-700",
        search: "border p-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400",
        userMenu: "flex items-center space-x-4",
        roleBadge: "text-xs font-semibold px-2 py-1 rounded bg-indigo-100 text-indigo-800",
        userName: "text-gray-700 hidden sm:block",
        // ⬅️ ZMIANA: Dodajemy styl dla ikony wylogowania, którą umieścimy w miejscu avatara
        avatar: "w-8 h-8 bg-indigo-400 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-colors",
        logoutIcon: "fas fa-sign-out-alt", // ⬅️ NOWY STYL: Klasa ikony
        // ⬅️ NOWOŚĆ: Styl dla pełnego przycisku Wyloguj
        logoutButton: "bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2",
    },
    // ... (reszta shellStyles bez zmian)
    mainGrid: "grid grid-cols-1 lg:grid-cols-5 gap-6 p-6",
    sidebar: {
        wrapper: "bg-white p-4 rounded-xl shadow space-y-4",
        header: "text-lg font-semibold text-gray-800 border-b pb-2 mb-2",
        nav: "space-y-1",
        item: "cursor-pointer p-2 rounded hover:bg-indigo-50 flex items-center gap-2 text-gray-600",
        toggleWrapper: "flex justify-between items-center p-2",
    },
    contentHeader: "text-2xl font-bold mb-4",
    panelCard: "bg-white p-4 rounded-lg shadow border border-gray-200",
    logItem: "p-2 bg-gray-50 rounded-lg border border-gray-100 text-sm",
    adminPanel: {
        wrapper: "bg-white p-4 rounded-xl shadow lg:col-span-1 border border-indigo-200",
        header: "text-lg font-bold text-indigo-700",
        content: "text-sm text-gray-600 mt-2",
    }
};