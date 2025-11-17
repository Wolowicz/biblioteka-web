import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
