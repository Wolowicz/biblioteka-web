/**
 * =============================================================================
 * ROOT LAYOUT - Główny layout aplikacji Next.js
 * =============================================================================
 * 
 * Ten plik definiuje podstawową strukturę HTML dla całej aplikacji.
 * Jest to Server Component (domyślnie w Next.js 14 App Router).
 * 
 * Odpowiedzialności:
 * - Importowanie globalnych stylów CSS
 * - Definiowanie metadanych SEO (title, description)
 * - Renderowanie struktury HTML (<html>, <body>)
 * - Ładowanie zewnętrznych zasobów (FontAwesome)
 * 
 * Zależności:
 * - globals.css - globalne style Tailwind CSS
 * - FontAwesome - biblioteka ikon (CDN)
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
 */

import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// =============================================================================
// METADANE SEO
// =============================================================================

/**
 * Metadane strony używane przez Next.js do generowania tagów <head>.
 * Te wartości są domyślne i mogą być nadpisane przez poszczególne strony.
 */
export const metadata: Metadata = {
  title: "BiblioteQ",
  description: "System zarządzania biblioteką – Next.js + role-based UI",
};

// =============================================================================
// TYPY
// =============================================================================

/**
 * Props dla RootLayout.
 */
interface RootLayoutProps {
  /** Zawartość strony renderowana wewnątrz layoutu */
  children: ReactNode;
}

// =============================================================================
// KOMPONENT
// =============================================================================

/**
 * Główny layout aplikacji - opakowuje wszystkie strony.
 * 
 * @param props.children - Zawartość strony (page.tsx)
 * @returns Kompletna struktura HTML dokumentu
 * 
 * Struktura:
 * ```
 * <html lang="pl">
 *   <body>
 *     {children}           <!-- Zawartość strony -->
 *     <link FontAwesome /> <!-- Ikony -->
 *   </body>
 * </html>
 * ```
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pl">
      {/* 
        Body z podstawowymi stylami:
        - min-h-screen: minimalna wysokość = 100vh
        - antialiased: wygładzanie czcionek
        - bg-transparent: przezroczyste tło (nadpisywane przez motywy ról)
      */}
      <body className="min-h-screen antialiased bg-transparent">
        {/* Główna zawartość strony */}
        {children}
        
        {/* 
          FontAwesome - biblioteka ikon
          Ładowana z CDN dla prostoty. W produkcji rozważ:
          - Instalację jako pakiet npm (@fortawesome/fontawesome-free)
          - Użycie tylko wybranych ikon (tree-shaking)
        */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </body>
    </html>
  );
}