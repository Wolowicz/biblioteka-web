// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { roleUI } from "@/lib/ui/design";

// ZASOBY CSS DLA IKON - WAŻNE!
const fontAwesomeLink =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";

export const metadata: Metadata = {
  title: {
    default: "BiblioteQ",
    template: "%s | BiblioteQ",
  },
  description:
    "System zarządzania biblioteką Patrycja Wołowicz i Rafał Grabowski",
  icons: {
    icon: "/biblio.png",      // favicon
    shortcut: "/biblio.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <head>
        {/* Ładowanie biblioteki Font Awesome */}
        <link rel="stylesheet" href={fontAwesomeLink} />
      </head>

      {/* TUTAJ PODPINAMY JASNY MOTYW DLA CAŁEGO BODY */}
      <body className="bg-white text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
