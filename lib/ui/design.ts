// lib/ui/design.ts
// Nowoczesny system UI z glassmorphism + gradientem i motywami ról

import { UserRole } from "@/lib/auth-client";

// ----------------------
// MOTYWY GLOBALNE DLA RÓL
// ----------------------
export const themes = {
  admin: {
    background:
      "min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-slate-100", // ⬅️ Tekst jasny
    card:
      "bg-[rgba(30,41,59,0.75)] backdrop-blur-xl border border-slate-700/30 rounded-2xl shadow-xl",
  },
  librarian: {
    background:
      // ⬅️ POPRAWKA: Ustawiamy kolor tekstu na ciemny
      "min-h-screen bg-gradient-to-br from-zinc-200 to-zinc-100 text-zinc-900", 
    card:
      "bg-white/80 backdrop-blur-xl border border-zinc-300 rounded-2xl shadow-xl",
  },
 user: {
  background:
    // ⬅️ POPRAWKA: Ustawiamy kolor tekstu na ciemny
    "min-h-screen bg-gradient-to-b from-white to-gray-100 text-slate-900", 
  card:
    "bg-white/80 backdrop-blur-xl border border-gray-300 rounded-2xl shadow-xl",
},

} as const;

// UI używany przez AppShell
export const roleUI: Record<UserRole, { background: string; card: string }> = {
  ADMIN: themes.admin,
  LIBRARIAN: themes.librarian,
  USER: themes.user,
};

// ----------------------
// GLASS CARD – ogólne
// ----------------------
export const glass = {
  card: "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl",
  hoverLift:
    "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
};

// ----------------------
// HEADER (górny pasek)
// ----------------------
export const headerUI = {
  wrapper:
    "flex justify-between items-center px-6 py-4 backdrop-blur-lg bg-white/10 border-b border-white/20 shadow",
  logo: "text-2xl font-extrabold tracking-tight",
  userMenu: "flex items-center gap-4",
  iconBtn:
    "p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white",
  roleBadge:
    "text-xs px-2 py-1 rounded bg-white/20 border border-white/40 font-semibold",
  logoutBtn:
    "flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition",
};

export const headerLight = {
  wrapper:
    "flex justify-between items-center px-6 py-4 bg-gray-100 border-b border-gray-300 shadow",

  logo: "text-2xl font-extrabold tracking-tight text-gray-900",

  userMenu: "flex items-center gap-4",

  iconBtn:
    "p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 hover:text-gray-900",

  roleBadge:
    "text-xs px-2 py-1 rounded bg-gray-300 text-gray-800 font-semibold border border-gray-400",

  logoutBtn:
    "flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition",
};

export const headerMid = {
  wrapper:
    "flex justify-between items-center px-6 py-4 bg-gray-100 border-b border-gray-300 shadow",
  logo: "text-2xl font-extrabold tracking-tight text-gray-900",
  userMenu: "flex items-center gap-4",
  iconBtn:
    "p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 hover:text-gray-900",
  roleBadge:
    "text-xs px-2 py-1 rounded bg-gray-300 text-gray-800 font-semibold",
  logoutBtn:
    "flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition",
};

// ----------------------
// SIDEBAR (lewy panel)
// ----------------------
export const sidebarUI = {
  wrapper:
    "h-fit p-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl space-y-4",
  section: "text-lg font-semibold border-b border-white/20 pb-2 mb-2",
  item:
    "p-2 rounded-lg cursor-pointer hover:bg-white/20 transition text-sm flex items-center gap-2",
  toggle:
    "flex justify-between items-center bg-white/10 border border-white/20 p-2 rounded-lg",
};

export const sidebarLight = {
  wrapper:
    "h-fit p-4 rounded-2xl bg-white border border-gray-300 shadow space-y-4",
  section:
    "text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-2",
  item:
    "p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition text-sm flex items-center gap-2 text-gray-700",
  toggle:
    "flex justify-between items-center bg-gray-100 border border-gray-300 p-2 rounded-lg",
};


// =======================
// NOWOCZESNE PANELE (Admin / Borrowings / Reviews)
// =======================

type PanelSet = {
  wrapper: string;
  card: string;
  header: string;
  subheader: string;
  item: string;
  label: string;
  value: string;
  button: string;
  dangerCard: string;
  dangerHeader: string;
  dangerButton: string;
};

export const panelUI: Record<UserRole, PanelSet> = {
  ADMIN: {
    wrapper: "space-y-6",
    card:
      "p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl",
    header: "text-2xl font-bold text-white mb-4 drop-shadow",
    subheader: "text-lg font-semibold text-white/80 mb-2",
    item:
      "p-4 bg-white/5 rounded-xl border border-white/10 shadow-sm backdrop-blur-sm",
    label: "text-sm text-white/70",
    value: "font-semibold text-white",
    button:
      "px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-semibold transition",
    dangerCard:
      "p-6 rounded-2xl bg-red-900/40 backdrop-blur-xl border border-red-500/40 shadow-2xl",
    dangerHeader: "text-2xl font-bold text-red-300 mb-4",
    dangerButton:
      "px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg font-semibold transition",
  },

  LIBRARIAN: {
    wrapper: "space-y-6",
    card:
      "p-6 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-300 shadow-xl",
    header: "text-2xl font-bold text-gray-900 mb-4",
    subheader: "text-lg font-semibold text-gray-700 mb-2",
    item:
      "p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm",
    label: "text-sm text-gray-600",
    value: "font-semibold text-gray-900",
    button:
      "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition",
    dangerCard:
      "p-6 rounded-2xl bg-red-100 border border-red-300 shadow-xl",
    dangerHeader: "text-2xl font-bold text-red-700 mb-4",
    dangerButton:
      "px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition",
  },

  USER: {
    wrapper: "space-y-6",
    card:
      "p-6 rounded-2xl bg-white border border-gray-300 shadow-xl",
    header: "text-2xl font-bold text-gray-900 mb-4",
    subheader: "text-lg font-semibold text-gray-800 mb-2",
    item:
      "p-4 bg-gray-100 rounded-xl border border-gray-300",
    label: "text-sm text-gray-700",
    value: "font-semibold text-gray-900",
    button:
      "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition",
    dangerCard:
      "p-6 rounded-2xl bg-red-50 border border-red-200 shadow-xl",
    dangerHeader: "text-2xl font-bold text-red-700 mb-4",
    dangerButton:
      "px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition",
  },
};


// =======================
// KATALOG KSIĄŻEK (role-based UI)
// =======================

type CatalogSet = {
  wrapper: string;
  searchRow: string;
  searchInput: string;
  grid: string;
  card: string;
  title: string;
  author: string;
  badge: string;
  footerRow: string;
  btnPrimary: string;
  btnGhost: string;
};

export const catalogUI: Record<UserRole, CatalogSet> = {
  ADMIN: {
    wrapper: "space-y-6",
    searchRow: "flex flex-col md:flex-row gap-4",
    searchInput:
      "flex-1 px-4 py-2.5 rounded-xl bg-white/15 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    card:
      "p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl",
    title: "text-xl font-bold text-white mb-1",
    author: "text-white/80 text-sm mb-3",
    badge:
      "inline-block text-xs px-2 py-1 rounded-lg bg-white/20 text-white border border-white/30 mb-3",
    footerRow:
      "flex justify-between items-center mt-auto pt-4 border-t border-white/10",
    btnPrimary:
      "px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-semibold transition",
    btnGhost:
      "px-3 py-1.5 border border-white/40 text-white/90 hover:bg-white/10 rounded-lg text-sm transition",
  },

  LIBRARIAN: {
    wrapper: "space-y-6",
    searchRow: "flex flex-col md:flex-row gap-4",
    searchInput:
      "flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 placeholder-gray-400 shadow",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    card:
      "p-6 rounded-2xl bg-white border border-gray-300 shadow-lg",
    title: "text-xl font-bold text-gray-900 mb-1",
    author: "text-gray-700 text-sm mb-3",
    badge:
      "inline-block text-xs px-2 py-1 rounded-lg bg-gray-200 text-gray-800 mb-3",
    footerRow:
      "flex justify-between items-center mt-auto pt-4 border-t border-gray-300",
    btnPrimary:
      "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition",
    btnGhost:
      "px-3 py-1.5 border border-gray-400 text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition",
  },

  USER: {
    wrapper: "space-y-6",
    searchRow: "flex flex-col md:flex-row gap-4",
    searchInput:
      "flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 shadow",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    card:
      "p-6 rounded-2xl bg-white border border-gray-300 shadow-xl",
    title: "text-xl font-bold text-gray-900 mb-1",
    author: "text-gray-600 text-sm mb-3",
    badge:
      "inline-block text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-800 mb-3 border border-gray-300",
    footerRow:
      "flex justify-between items-center mt-auto pt-4 border-t border-gray-300",
    btnPrimary:
      "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition",
    btnGhost:
      "px-3 py-1.5 border border-gray-400 text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition",
  },
};
