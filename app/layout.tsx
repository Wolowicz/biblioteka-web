// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; 

// ⬅️ ZASOBY CSS DLA IKON - WAŻNE!
const fontAwesomeLink = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"; 

export const metadata: Metadata = {
  title: {
    default: "BiblioteQ",
    template: "%s | BiblioteQ",
  },
  description: "System zarządzania biblioteką Patrycja Wołowicz i Rafał Grabowski",
  icons: {
    icon: "/biblio.png",      // ← to jest nasza favicon
    shortcut: "/biblio.png",
    apple: "/biblio.png",
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
        {/* ⬅️ DODAJ TO: Ładowanie biblioteki Font Awesome */}
        <link rel="stylesheet" href={fontAwesomeLink} />
      </head>
      <body>{children}</body>
    </html>
  );
}