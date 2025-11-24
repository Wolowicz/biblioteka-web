// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BiblioteQ",
  description: "System zarządzania biblioteką – Next.js + role-based UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
