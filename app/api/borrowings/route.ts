/**
 * =============================================================================
 * API: GET /api/borrowings - Lista wypożyczeń zalogowanego użytkownika
 * =============================================================================
 * 
 * Endpoint chroniony zwracający historię wypożyczeń aktualnie zalogowanego
 * użytkownika. Automatycznie nalicza kary za przekroczone terminy zwrotu.
 * 
 * Przepływ:
 * 1. Weryfikacja sesji użytkownika z ciasteczka
 * 2. Pobranie listy wypożyczeń użytkownika z bazy danych
 * 3. Automatyczne naliczanie kar za przeterminowane wypożyczenia:
 *    - Sprawdzenie czy książka nie została zwrócona
 *    - Sprawdzenie czy termin zwrotu minął
 *    - Sprawdzenie czy kara nie została już naliczona
 *    - Obliczenie kwoty kary (2 PLN za każdy dzień spóźnienia)
 *    - Utworzenie rekordu kary w bazie
 * 4. Pobranie pełnych danych wypożyczeń z informacjami o karach
 * 5. Zwrócenie listy wypożyczeń do frontendu
 * 
 * Kody odpowiedzi:
 * - 200: Lista wypożyczeń pobrana pomyślnie
 * - 401: Użytkownik niezalogowany (brak sesji)
 * - 500: Błąd serwera lub bazy danych
 * 
 * Zależności:
 * - next/server: NextResponse do budowania odpowiedzi HTTP
 * - next/headers: cookies() do odczytu sesji użytkownika
 * - @/lib/db: Pool połączeń do bazy danych MySQL
 * 
 * Tabele bazodanowe:
 * - Wypozyczenia: Główna tabela wypożyczeń
 * - Egzemplarze: Fizyczne egzemplarze książek
 * - Ksiazki: Dane bibliograficzne
 * - Autorzy, KsiazkiAutorzy: Informacje o autorach
 * - Kary: Naliczone kary za spóźnienia
 * 
 * Format odpowiedzi:
 * ```json
 * [
 *   {
 *     "id": number,
 *     "title": string,
 *     "author": string,
 *     "coverUrl": null,
 *     "borrowDate": string,
 *     "dueDate": string,
 *     "returnedDate": string | null,
 *     "fine": number
 *   }
 * ]
 * ```
 * 
 * @packageDocumentation
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

/**
 * Handler GET - Pobieranie wypożyczeń użytkownika
 * 
 * Zwraca listę wszystkich wypożyczeń zalogowanego użytkownika
 * wraz z automatycznym naliczaniem kar za przeterminowane pozycje.
 * 
 * @returns {Promise<NextResponse>} Odpowiedź JSON z listą wypożyczeń lub błędem
 */
export async function GET() {
  try {
    // === SEKCJA: Weryfikacja sesji użytkownika ===
    const cookieStore = await cookies();
    const session = cookieStore.get("userSession");

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parsowanie danych użytkownika z ciasteczka sesyjnego
    const user = JSON.parse(session.value);
    const userId = Number(user.id);

    // === SEKCJA: Pobranie wypożyczeń użytkownika ===
    // Pierwsze zapytanie pobiera podstawowe dane do sprawdzenia kar
    const borrowResult: any = await pool.query(
      `
        SELECT
          w.WypozyczenieId,
          w.DataWypozyczenia,
          w.TerminZwrotu,
          w.DataZwrotu,
          w.Status,
          k.KsiazkaId,
          k.Tytul
        FROM wypozyczenia w
        JOIN egzemplarze e ON w.EgzemplarzId = e.EgzemplarzId
        JOIN ksiazki k ON e.KsiazkaId = k.KsiazkaId
        WHERE w.UzytkownikId = ?
          AND w.IsDeleted = 0
        ORDER BY w.DataWypozyczenia DESC
      `,
      [userId]
    );

    const borrowRows = borrowResult[0];

    // === SEKCJA: Automatyczne naliczanie kar ===
    // Iterujemy przez wszystkie wypożyczenia i sprawdzamy przeterminowane
    for (const row of borrowRows as any[]) {
      const { WypozyczenieId, TerminZwrotu, DataZwrotu } = row;

      // Pomijamy zwrócone książki
      if (DataZwrotu) continue;

      const dzis = new Date();
      const termin = new Date(TerminZwrotu);

      // Pomijamy wypożyczenia w terminie
      if (dzis <= termin) continue;

      // Sprawdzamy czy kara nie została już naliczona
      const fineCheck: any = await pool.query(
        `
          SELECT KaraId
          FROM kary
          WHERE WypozyczenieId = ?
            AND Status = 'Naliczona'
          LIMIT 1
        `,
        [WypozyczenieId]
      );

      // Pomijamy jeśli kara już istnieje
      if (fineCheck[0].length > 0) continue;

      // Obliczenie liczby dni spóźnienia
      const diffDays = Math.ceil(
        (dzis.getTime() - termin.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Stawka kary: 2 PLN za każdy dzień spóźnienia
      const kwota = diffDays * 2;

      // Utworzenie rekordu kary w bazie danych
      await pool.query(
        `
          INSERT INTO kary (WypozyczenieId, Kwota, Opis, Status)
          VALUES (?, ?, 'Przekroczono termin zwrotu', 'Naliczona')
        `,
        [WypozyczenieId, kwota]
      );
    }

    // === SEKCJA: Końcowe zapytanie z pełnymi danymi dla frontendu ===
    // Pobieramy szczegółowe informacje o wypożyczeniach włącznie z karami
    const result: any = await pool.query(
      `
        SELECT
          w.WypozyczenieId AS id,
          k.Tytul AS title,

          (
            SELECT GROUP_CONCAT(a.ImieNazwisko SEPARATOR ', ')
            FROM autorzy a
            JOIN ksiazkiautorzy ka ON ka.AutorId = a.AutorId
            WHERE ka.KsiazkaId = k.KsiazkaId
          ) AS author,

          NULL AS coverUrl,

          w.DataWypozyczenia AS borrowDate,
          w.TerminZwrotu AS dueDate,
          w.DataZwrotu AS returnedDate,

          COALESCE((
            SELECT Kwota
            FROM kary
            WHERE WypozyczenieId = w.WypozyczenieId
              AND Status = 'Naliczona'
            LIMIT 1
          ), 0) AS fine

        FROM wypozyczenia w
        JOIN egzemplarze e ON w.EgzemplarzId = e.EgzemplarzId
        JOIN ksiazki k ON e.KsiazkaId = k.KsiazkaId
        
        WHERE w.UzytkownikId = ?
          AND w.IsDeleted = 0

        ORDER BY w.DataWypozyczenia DESC
      `,
      [userId]
    );

    const rows = result[0];

    // === SEKCJA: Odpowiedź sukcesu ===
    return NextResponse.json(rows);

  } catch (err) {
    // === SEKCJA: Obsługa błędów ===
    console.error("BORROWINGS API ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
