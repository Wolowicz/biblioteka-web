/**
 * =============================================================================
 * API: GET /api/books - Lista wszystkich książek w katalogu
 * =============================================================================
 * 
 * Endpoint publiczny zwracający listę wszystkich aktywnych książek w systemie
 * bibliotecznym. Dane są agregowane z informacjami o autorach i dostępności.
 * 
 * Przepływ:
 * 1. Wykonanie zapytania SQL z JOINami do tabel Ksiazki, KsiazkiAutorzy, Autorzy
 * 2. Agregacja autorów dla każdej książki (GROUP_CONCAT)
 * 3. Obliczenie dostępności na podstawie liczby wolnych egzemplarzy
 * 4. Zwrócenie posortowanej listy (alfabetycznie wg tytułu)
 * 
 * Kody odpowiedzi:
 * - 200: Lista książek pobrana pomyślnie
 * - 500: Błąd bazy danych
 * 
 * Zależności:
 * - next/server: NextResponse do budowania odpowiedzi HTTP
 * - @/lib/db: Pool połączeń do bazy danych MySQL
 * 
 * Tabele bazodanowe:
 * - Ksiazki: Główna tabela z danymi książek
 * - KsiazkiAutorzy: Tabela łącząca (relacja wiele-do-wielu)
 * - Autorzy: Dane autorów
 * 
 * Format odpowiedzi:
 * ```json
 * [
 *   {
 *     "id": number,
 *     "title": string,
 *     "authors": string,      // Lista autorów oddzielona przecinkami
 *     "available": boolean    // Czy są dostępne egzemplarze
 *   }
 * ]
 * ```
 * 
 * @packageDocumentation
 */

import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * Handler GET - Pobieranie listy wszystkich książek
 * 
 * Zwraca uproszczoną listę książek do wyświetlenia w katalogu.
 * Filtruje tylko aktywne książki (IsDeleted = 0).
 * 
 * @returns {Promise<NextResponse>} Odpowiedź JSON z tablicą książek
 */
export async function GET() {
  try {
    // === SEKCJA: Zapytanie do bazy danych ===
    // Pobieramy książki z zagregowanymi autorami i informacją o dostępności
    const [rows] = await pool.query(
      `
      SELECT
        k.KsiazkaId AS id,
        k.Tytul AS title,
        COALESCE(GROUP_CONCAT(a.ImieNazwisko SEPARATOR ', '), 'Brak autora') AS authors,
        (k.DostepneEgzemplarze > 0) AS available
      FROM Ksiazki k
      LEFT JOIN KsiazkiAutorzy ka ON ka.KsiazkaId = k.KsiazkaId
      LEFT JOIN Autorzy a ON a.AutorId = ka.AutorId
      WHERE k.IsDeleted = 0
      GROUP BY k.KsiazkaId, k.Tytul, k.DostepneEgzemplarze
      ORDER BY k.Tytul;
      `
    );

    // === SEKCJA: Odpowiedź sukcesu ===
    return NextResponse.json(rows);
  } catch (err) {
    // === SEKCJA: Obsługa błędów ===
    console.error("DB error /api/books:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych" },
      { status: 500 }
    );
  }
}
