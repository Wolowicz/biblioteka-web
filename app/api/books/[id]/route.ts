/**
 * =============================================================================
 * API: GET /api/books/[id] - Szczegóły pojedynczej książki
 * =============================================================================
 * 
 * Endpoint publiczny zwracający pełne informacje o konkretnej książce
 * na podstawie jej identyfikatora. Używany na stronie szczegółów książki.
 * 
 * Przepływ:
 * 1. Ekstrakcja i walidacja parametru ID z URL
 * 2. Konwersja ID na liczbę i sprawdzenie poprawności
 * 3. Wykonanie zapytania SQL z JOINami do powiązanych tabel
 * 4. Sprawdzenie czy książka została znaleziona
 * 5. Zwrócenie szczegółowych danych książki
 * 
 * Kody odpowiedzi:
 * - 200: Książka znaleziona, zwrócono szczegóły
 * - 400: Nieprawidłowy format ID (nie jest liczbą dodatnią)
 * - 404: Książka o podanym ID nie istnieje
 * - 500: Błąd bazy danych
 * 
 * Zależności:
 * - next/server: NextRequest, NextResponse do obsługi żądań HTTP
 * - @/lib/db: Pool połączeń do bazy danych MySQL
 * 
 * Tabele bazodanowe:
 * - Ksiazki: Główna tabela z danymi książek
 * - KsiazkiAutorzy: Tabela łącząca książki z autorami
 * - Autorzy: Dane autorów
 * 
 * Format odpowiedzi:
 * ```json
 * {
 *   "id": number,
 *   "title": string,
 *   "authors": string,
 *   "isbn": string | null,
 *   "publisher": string | null,
 *   "year": number | null,
 *   "available": boolean
 * }
 * ```
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * Handler GET - Pobieranie szczegółów książki
 * 
 * Zwraca pełne informacje o książce włącznie z ISBN, wydawnictwem i rokiem wydania.
 * Parametr ID jest pobierany z dynamicznego segmentu URL.
 * 
 * @param {NextRequest} _req - Żądanie HTTP (nieużywane, ale wymagane przez Next.js)
 * @param {Object} context - Kontekst zawierający parametry dynamiczne
 * @param {Promise<{ id: string }>} context.params - Parametry URL (asynchroniczne w Next.js 15+)
 * @returns {Promise<NextResponse>} Odpowiedź JSON ze szczegółami książki lub błędem
 */
export async function GET( 
  _req: NextRequest,
  context: { params: Promise<{ id: string }> } 
){
  // === SEKCJA: Ekstrakcja i walidacja parametru ID ===
  const { id } = await context.params;        // Await wymagany w Next.js 15+ dla params
  const numericId = Number(id);

  // Sprawdzenie czy ID jest poprawną liczbą dodatnią
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Złe ID" }, { status: 400 });
  }

  try {
    // === SEKCJA: Zapytanie do bazy danych ===
    // Pobieramy szczegółowe dane książki z agregacją autorów
    const [rows] = await pool.query(
      `
      SELECT
        k.KsiazkaId AS id,
        k.Tytul AS title,
        COALESCE(GROUP_CONCAT(a.ImieNazwisko SEPARATOR ', '), 'Brak autora') AS authors,
        k.numerISBN AS isbn,
        k.Wydawnictwo AS publisher,
        k.Rok AS year,
        (k.DostepneEgzemplarze > 0) AS available
      FROM Ksiazki k
      LEFT JOIN KsiazkiAutorzy ka ON ka.KsiazkaId = k.KsiazkaId
      LEFT JOIN Autorzy a ON a.AutorId = ka.AutorId
      WHERE k.KsiazkaId = ?
      GROUP BY
        k.KsiazkaId,
        k.Tytul,
        k.numerISBN,
        k.Wydawnictwo,
        k.Rok,
        k.DostepneEgzemplarze
      LIMIT 1;
      `,
      [numericId]
    );

    // === SEKCJA: Sprawdzenie wyniku ===
    // Typowanie jako any[], ponieważ wynik z bazy to tablica obiektów o nieznanym typie
    const list = rows as any[];
    if (list.length === 0) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }

    // === SEKCJA: Odpowiedź sukcesu ===
    return NextResponse.json(list[0]);
  } catch (err) {
    // === SEKCJA: Obsługa błędów ===
    console.error("DB error /api/books/[id]:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych" },
      { status: 500 }
    );
  }
}
