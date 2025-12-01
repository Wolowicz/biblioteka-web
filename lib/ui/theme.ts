export const theme = {
  admin: {
    bg: "bg-[#2b2b2b] text-gray-100",              // elegancki grafit
    card: "bg-[#1f1f1f] border border-gray-600",
    link: "text-blue-300",
  },

  librarian: {
    bg: "bg-[#e5e5e5] text-gray-900",              // jasny szary (ładny, profesjonalny)
    card: "bg-[#f0f0f0] border border-gray-300",
    link: "text-indigo-600",
  },

  user: {
    bg: "bg-white text-gray-900",                  // biały
    card: "bg-white border border-gray-200",
    link: "text-blue-600",
  },
};

export const roleUI = {
  ADMIN: {
    background: "bg-[#2b2b2b] text-gray-100 min-h-screen",  // grafit
    text: "text-gray-100",
  },
  LIBRARIAN: {
    background: "bg-[#e5e5e5] text-gray-900 min-h-screen",  // jasny szary
    text: "text-gray-900",
  },
  USER: {
    background: "bg-white text-gray-900 min-h-screen",      // biały
    text: "text-gray-900",
  },
};

export const panelUI = {
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
};


export const reserveUI = {
  base:
    "px-4 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition",
  success: "mt-2 text-green-600 font-medium",
  error: "mt-2 text-red-600 font-medium",
};

export const backUI = {
  base:
    "px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition",
};

export const themeMap = {
  ADMIN: "admin",
  LIBRARIAN: "librarian",
  USER: "user",
} as const;
