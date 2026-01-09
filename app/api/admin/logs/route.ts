/**
 * =============================================================================
 * API: GET /api/admin/logs - Pobieranie logów systemowych
 * =============================================================================
 * 
 * Endpoint administracyjny zwracający ostatnie logi zdarzeń w systemie.
 * Przeznaczony dla administratorów i bibliotekarzy do monitorowania
 * aktywności w systemie bibliotecznym.
 * 
 * Przepływ:
 * 1. Wykonanie zapytania SQL do tabeli Logi z JOINem do Uzytkownicy
 * 2. Pobranie ostatnich 50 logów posortowanych od najnowszych
 * 3. Zwrócenie listy logów z informacjami o użytkownikach
 * 
 * Kody odpowiedzi:
 * - 200: Lista logów pobrana pomyślnie
 * - 500: Błąd bazy danych
 * 
 * Zależności:
 * - next/server: NextResponse do budowania odpowiedzi HTTP
 * - @/lib/db: Pool połączeń do bazy danych MySQL
 * 
 * Tabele bazodanowe:
 * - Logi: Główna tabela logów systemowych
 * - Uzytkownicy: Dane użytkowników (LEFT JOIN dla logów bez użytkownika)
 * 
 * Format odpowiedzi:
 * ```json
 * [
 *   {
 *     "id": number,
 *     "type": string,           // Typ zdarzenia (np. "INSERT", "UPDATE", "DELETE")
 *     "userFirstName": string | null,
 *     "userLastName": string | null,
 *     "description": string,    // Opis zdarzenia
 *     "entity": string,         // Nazwa encji (np. "Ksiazki", "Wypozyczenia")
 *     "entityId": number,       // ID encji której dotyczy log
 *     "timestamp": string       // Data i czas zdarzenia
 *   }
 * ]
 * ```
 * 
 * Uwagi bezpieczeństwa:
 * - Endpoint powinien być chroniony middleware'em sprawdzającym rolę
 * - Dostęp powinien być ograniczony do ról ADMIN i LIBRARIAN
 * - W obecnej implementacji brak weryfikacji uprawnień po stronie serwera
 * 
 * @packageDocumentation
 */

import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * Handler GET - Pobieranie logów systemowych
 * 
 * Zwraca ostatnie 50 logów zdarzeń w systemie dla celów audytu
 * i monitorowania aktywności użytkowników.
 * 
 * @returns {Promise<NextResponse>} Odpowiedź JSON z listą logów lub błędem
 * 
 * @remarks
 * UWAGA: Ta funkcja zakłada, że tylko ADMIN/LIBRARIAN ma uprawnienia.
 * W prawdziwej aplikacji produkcyjnej, w tym miejscu powinna być
 * ścisła weryfikacja uprawnień po stronie serwera.
 */
export async function GET(request: Request) {
  try {
    // Parse URL params
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get("entity");
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];

    if (entity) {
      conditions.push("l.Encja = ?");
      params.push(entity);
    }
    if (action) {
      conditions.push("l.TypCoSieStalo = ?");
      params.push(action);
    }
    if (userId) {
      conditions.push("l.UzytkownikId = ?");
      params.push(parseInt(userId));
    }
    if (dateFrom) {
      conditions.push("l.Kiedy >= ?");
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push("l.Kiedy <= ?");
      params.push(dateTo);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // === SEKCJA: Zapytanie do bazy danych ===
    // Pobieramy logi z parametrami filtrowania
    // LEFT JOIN pozwala na wyświetlenie logów nawet bez powiązanego użytkownika
    const [rows] = await pool.query(
      `
      SELECT
        l.LogId AS id,
        l.TypCoSieStalo AS type,
        u.Imie AS userFirstName,
        u.Nazwisko AS userLastName,
        l.Opis AS description,
        l.Encja AS entity,
        l.EncjaId AS entityId,
        l.StanPrzed AS stateBefore,
        l.StanPo AS stateAfter,
        l.Kiedy AS timestamp
      FROM Logi l
      LEFT JOIN Uzytkownicy u ON u.UzytkownikId = l.UzytkownikId
      ${whereClause}
      ORDER BY l.Kiedy DESC
      LIMIT ?;
      `,
      [...params, limit]
    );

    // === SEKCJA: Odpowiedź sukcesu ===
    return NextResponse.json(rows);
  } catch (err) {
    // === SEKCJA: Obsługa błędów ===
    console.error("DB error /api/admin/logs:", err);
    return NextResponse.json(
      { error: "Błąd bazy danych podczas pobierania logów" },
      { status: 500 }
    );
  }
}