// lib/ui/styles.ts
// Klasy pomocnicze dla UI (login, register, przyciski, welcome, panele)

import { UserRole } from "@/lib/auth-client";

// ============ MOTYWY DLA LOGINU (tylko tu używane) ============
export const roleThemes: Record<UserRole, string> = {
  ADMIN: "bg-slate-950 text-slate-50",
  LIBRARIAN: "bg-zinc-100 text-zinc-900",
  USER: "bg-white text-slate-900",
};

// ============ KARTA AUTH (login / register) ============

export const authCard = {
  wrapper: "w-full max-w-md",
  card:
    "rounded-3xl p-8 bg-white/10 backdrop-blur-2xl border border-white/25 shadow-2xl",
  headerWrapper: "text-center mb-6",
  title: "text-3xl font-bold tracking-tight text-white",
  subtitle: "text-sm text-white/80 mt-1",
  // tło zanim poznamy rolę (ekran logowania)
  unloggedBackground:
    "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white",
};

// ============ LOGIN ============

export const loginFormStyles = {
  input:
    "w-full px-4 py-2.5 rounded-xl bg-white/15 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50",
  passwordWrapper: "relative",
  passwordInputPadding: "pr-10",
  passwordToggle:
    "absolute inset-y-0 right-3 flex items-center text-white/80 hover:text-white",
  helperText: "mt-1 text-xs text-white/80",
  error:
    "mt-3 text-sm text-red-100 bg-red-900/60 border border-red-500/60 rounded-xl px-3 py-2",
  button:
    "mt-2 w-full bg-white text-purple-700 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition flex items-center justify-center",
  loadingSpinner:
    "h-4 w-4 border-2 border-purple-400/40 border-t-purple-700 rounded-full animate-spin",
  registerLink: "underline font-semibold",
  footerText: "mt-4 text-center text-sm text-white/80",
  loggedRole: "mt-4 text-white/80 text-center text-sm",
};

// ============ REGISTER (żeby się nie wysypało) ============

export const registerFormStyles = {
  wrapper:
    "min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-sky-400 via-emerald-400 to-teal-500 text-slate-900",
  card:
    "max-w-lg w-full rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl p-8 space-y-6",
  headerTitle: "text-3xl font-bold",
  headerSubtitle: "text-sm text-slate-600 mt-1",
  input:
    "w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500",
  passwordWrapper: "relative",
  passwordInputPadding: "pr-10",
  passwordToggle:
    "absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 text-sm",
  helperText: "mt-1 text-xs text-slate-500",
  error:
    "text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2",
  success:
    "text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2",
  button:
    "w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-lg transition",
  loginLink: "underline font-semibold text-emerald-700",
};

// ============ RESZTA STYLI, KTÓRYCH UŻYWASZ GDZIE INDZIEJ ============

// karty w starym katalogu (możesz już nie używać, ale zostawiam, żeby nie psuć)
export const bookCardStyles = {
  input: "w-full border p-3 rounded",
  wrapper: "border rounded p-4 shadow-sm bg-white",
  title: "font-semibold",
  authors: "text-sm text-gray-600",
  badgeAvailable:
    "text-xs bg-green-100 text-green-700 inline-block px-2 py-1 rounded mt-2",
  badgeUnavailable:
    "text-xs bg-red-100 text-red-700 inline-block px-2 py-1 rounded mt-2",
  link: "mt-3 inline-block underline text-indigo-600",
  noResults: "text-gray-600",
};

export const reserveButtonStyles = {
  base:
    "mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 transition disabled:opacity-50",
  successMessage:
    "mt-2 text-green-700 bg-green-100 border border-green-300 rounded px-3 py-2",
};

export const bookDetailsStyles = {
  mainWrapper: "p-6 max-w-2xl mx-auto space-y-3",
  title: "text-2xl font-bold",
  authors: "text-gray-700",
  detailsWrapper: "text-sm text-gray-600 space-y-1",
  statusBadge: "inline-block px-2 py-1 rounded bg-gray-200",
};

export const backButtonStyles = {
  base:
    "mt-6 bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded",
};

// używane przez BorrowingsPanel / AdminPanel
export const shellStyles = {
  panelCard: "bg-white p-4 rounded-xl shadow border border-gray-200",
  adminPanel: {
    wrapper:
      "bg-white p-4 rounded-xl shadow border border-indigo-200 h-full",
    header: "text-lg font-bold text-indigo-700",
    content: "text-sm text-gray-600 mt-2",
  },
};

// Strona powitalna
export const welcomePageStyles = {
  wrapper:
    "relative min-h-screen flex items-center justify-center bg-cover bg-center",
  overlay: "absolute inset-0 bg-black/40",
  contentCard:
    "relative z-10 max-w-lg mx-4 bg-white/85 rounded-2xl shadow-xl p-8 text-center",
  logo: "text-4xl font-bold text-slate-900",
  tagline: "mt-1 text-sm text-slate-600",
  buttonContainer: "mt-6 flex flex-col gap-3",
  loginButton:
    "w-full bg-slate-900 text-white rounded-lg py-2.5 font-semibold hover:bg-slate-800 transition-colors",
  registerButton:
    "w-full bg-white/90 text-slate-900 border border-slate-300 rounded-lg py-2.5 font-semibold hover:bg-white transition-colors",
};
