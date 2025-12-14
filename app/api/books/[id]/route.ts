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
    // Pobieramy szczegółowe dane książki z agregacją autorów i gatunków
    const [rows] = await pool.query(
      `
      SELECT
        k.KsiazkaId AS id,
        k.Tytul AS title,
        NULL AS coverUrl,
        COALESCE(GROUP_CONCAT(DISTINCT a.ImieNazwisko SEPARATOR ', '), 'Brak autora') AS authors,
        k.numerISBN AS isbn,
        k.Wydawnictwo AS publisher,
        k.Rok AS year,
        (k.DostepneEgzemplarze > 0) AS available,
        (
          SELECT GROUP_CONCAT(
            CONCAT(g.GatunekId, '|', g.Nazwa, '|', COALESCE(g.Ikona, 'fas fa-book'), '|', COALESCE(g.Kolor, 'from-indigo-500 to-purple-600'))
            SEPARATOR ';;'
          )
          FROM ksiazki_gatunki kg
          JOIN gatunki g ON g.GatunekId = kg.GatunekId
          WHERE kg.KsiazkaId = k.KsiazkaId AND g.IsDeleted = 0
        ) AS genresRaw
      FROM Ksiazki k
      LEFT JOIN KsiazkiAutorzy ka ON ka.KsiazkaId = k.KsiazkaId
      LEFT JOIN Autorzy a ON a.AutorId = ka.AutorId
      WHERE k.KsiazkaId = ? AND k.IsDeleted = 0
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

    // Parsowanie gatunków z formatu "id|name|icon|color;;id|name|icon|color"
    const book = list[0];
    if (book.genresRaw) {
      book.genres = book.genresRaw.split(';;').map((g: string) => {
        const [id, name, icon, color] = g.split('|');
        return { id: Number(id), name, icon, color };
      });
    } else {
      book.genres = [];
    }
    delete book.genresRaw;

    // === SEKCJA: Odpowiedź sukcesu ===
    return NextResponse.json(book);
  } catch (err) {
    // === SEKCJA: Obsługa błędów ===
    console.error("DB error /api/books/[id]:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych" },
      { status: 500 }
    );
  }
}
