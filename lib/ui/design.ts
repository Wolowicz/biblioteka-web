// lib/ui/design.ts
// Kompletny Design System — zero duplikacji, pełne wsparcie ról UI

import { UserRole } from "@/lib/auth-client";

// ---------------------------------------------
// 1. MOTYWY GLOBALNE PER-ROLE
// ---------------------------------------------
export const roleUI: Record<
  UserRole,
  { background: string; card: string }
> = {
  ADMIN: {
    background:
      "min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white",
    card:
      "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl",
  },

  LIBRARIAN: {
    background:
      "min-h-screen bg-gradient-to-br from-zinc-200 to-zinc-100 text-zinc-900",
    card:
      "bg-white rounded-2xl border border-gray-300 shadow-xl",
  },

  USER: {
    background:
      "min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900",
    card:
      "bg-white rounded-2xl border border-gray-300 shadow-xl",
  },
};

// ---------------------------------------------
// 2. HEADER (górny pasek)
// ---------------------------------------------
export const headerBase = {
  wrapper:
    "flex justify-between items-center px-6 py-4 border-b shadow-sm",
  logo: "text-2xl font-extrabold tracking-tight",
  userMenu: "flex items-center gap-4",
};

export const headerUI: Record<UserRole, any> = {
  ADMIN: {
    ...headerBase,
    wrapper:
      headerBase.wrapper +
      " bg-white/10 backdrop-blur-xl border-white/20 text-white",
    iconBtn:
      "p-2 rounded-lg hover:bg-white/10 transition text-white/80 hover:text-white",
    roleBadge:
      "text-xs px-2 py-1 rounded bg-white/20 border border-white/40",
    logoutBtn:
      "flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition",
    tabBase: "px-4 py-2 rounded-lg text-white/80 hover:bg-white/10",
    tabActive: "px-4 py-2 rounded-lg bg-white/20 text-white shadow font-semibold",
  },

  LIBRARIAN: {
    ...headerBase,
    wrapper:
      headerBase.wrapper +
      " bg-white border-gray-200 text-gray-900",
    iconBtn:
      "p-2 rounded-lg hover:bg-gray-100 transition text-gray-700",
    roleBadge:
      "text-xs px-2 py-1 rounded bg-gray-200 border border-gray-300",
    logoutBtn:
      "flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition",
    tabBase: "px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200",
    tabActive: "px-4 py-2 rounded-lg bg-indigo-600 text-white shadow font-semibold",
  },

  USER: {
    ...headerBase,
    wrapper:
      headerBase.wrapper +
      " bg-gray-100 border-gray-300 text-gray-900",
    iconBtn:
      "p-2 rounded-lg hover:bg-gray-200 transition text-gray-700",
    roleBadge:
      "text-xs px-2 py-1 rounded bg-gray-300 border border-gray-400",
    logoutBtn:
      "flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition",
    tabBase: "px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200",
    tabActive: "px-4 py-2 rounded-lg bg-indigo-600 text-white shadow font-semibold",
  },
};

// ---------------------------------------------
// 3. SIDEBAR
// ---------------------------------------------
const sidebarBase = {
  wrapper: "p-4 rounded-2xl space-y-4 shadow-xl",
  section: "text-lg font-semibold border-b pb-2 mb-2",
  item: "p-2 rounded-lg cursor-pointer transition text-sm",
  toggle: "flex justify-between items-center p-2 rounded-lg border",
};

export const sidebarUI: Record<UserRole, any> = {
  ADMIN: {
    wrapper:
      sidebarBase.wrapper +
      " bg-white/10 backdrop-blur-xl border border-white/20 text-white",
    section: "text-white font-semibold border-white/20",
    item:
      "p-2 rounded-lg hover:bg-white/10 transition text-white/80",
    toggle: "bg-white/10 border-white/20",
  },

  LIBRARIAN: {
    wrapper:
      sidebarBase.wrapper + " bg-white border border-gray-300 text-gray-900",
    section: "text-gray-800 border-gray-300",
    item:
      "p-2 rounded-lg hover:bg-gray-100 transition text-gray-800",
    toggle: "bg-gray-100 border-gray-300",
  },

  USER: {
    wrapper:
      sidebarBase.wrapper + " bg-white border border-gray-300 text-gray-900",
    section: "text-gray-800 border-gray-300",
    item:
      "p-2 rounded-lg hover:bg-gray-100 transition text-gray-800",
    toggle: "bg-gray-100 border-gray-300",
  },
};

// ---------------------------------------------
// 4. PANELS (AdminPanel / BorrowingsPanel / Reviews)
// ---------------------------------------------
export const panelUI: Record<UserRole, any> = {
  ADMIN: {
    wrapper: "space-y-6",
    card:
      "p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl",
    header: "text-2xl font-bold text-white",
    subheader: "text-lg text-white/80",
    label: "text-white/70",
    value: "text-white",
  },

  LIBRARIAN: {
    wrapper: "space-y-6",
    card:
      "p-6 rounded-2xl bg-white border border-gray-300 shadow-xl",
    header: "text-2xl font-bold text-gray-900",
    subheader: "text-lg text-gray-700",
    label: "text-gray-600",
    value: "text-gray-900",
  },

  USER: {
    wrapper: "space-y-6",
    card:
      "p-6 rounded-2xl bg-white border border-gray-300 shadow-xl",
    header: "text-2xl font-bold text-gray-900",
    subheader: "text-lg text-gray-800",
    label: "text-gray-700",
    value: "text-gray-900",
  },
};

// ---------------------------------------------
// 5. KATALOG KSIĄŻEK
// ---------------------------------------------
export const catalogUI: Record<UserRole, any> = {
  ADMIN: {
    wrapper: "space-y-6",
    searchRow: "flex flex-col md:flex-row gap-4",
    searchInput:
      "px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    card:
      "p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl",
    title: "text-xl font-bold text-white",
    author: "text-white/80",
    badge:
      "inline-block text-xs px-2 py-1 rounded bg-white/20 text-white border border-white/30",
    footerRow:
      "flex justify-between pt-4 border-t border-white/10",
    btnPrimary:
      "px-3 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-400",
    btnGhost:
      "px-3 py-2 rounded border border-white/30 text-white hover:bg-white/10",
  },

  LIBRARIAN: {
    wrapper: "space-y-6",
    searchRow: "flex flex-col md:flex-row gap-4",
    searchInput:
      "px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    card:
      "p-6 rounded-2xl bg-white border border-gray-300 shadow-xl",
    title: "text-xl font-bold text-gray-900",
    author: "text-gray-600",
    badge:
      "inline-block text-xs px-2 py-1 rounded bg-gray-200 text-gray-800",
    footerRow:
      "flex justify-between pt-4 border-t border-gray-300",
    btnPrimary:
      "px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500",
    btnGhost:
      "px-3 py-2 rounded border border-gray-400 text-gray-800 hover:bg-gray-200",
  },

  USER: {
    wrapper: "space-y-6",
    searchRow: "flex flex-col md:flex-row gap-4",
    searchInput:
      "px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    card:
      "p-6 rounded-2xl bg-white border border-gray-300 shadow-xl",
    title: "text-xl font-bold text-gray-900",
    author: "text-gray-600",
    badge:
      "inline-block text-xs px-2 py-1 rounded bg-gray-100 border border-gray-300 text-gray-800",
    footerRow:
      "flex justify-between pt-4 border-t border-gray-300",
    btnPrimary:
      "px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500",
    btnGhost:
      "px-3 py-2 rounded border border-gray-400 text-gray-800 hover:bg-gray-200",
  },
};

// ---------------------------------------------
// 6. PRZYCISK REZERWACJI
// ---------------------------------------------
export const reserveUI = {
  base:
    "mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-500 transition disabled:opacity-50",
  success:
    "mt-2 text-green-700 bg-green-100 border border-green-300 rounded px-3 py-2 text-sm",
  error:
    "mt-2 text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2 text-sm",
};
