/**
 * =============================================================================
 * API: POST /api/reservations - Tworzenie rezerwacji/wypożyczenia książki
 * =============================================================================
 * 
 * Endpoint chroniony umożliwiający zalogowanemu użytkownikowi wypożyczenie
 * książki z biblioteki. System automatycznie znajduje wolny egzemplarz
 * i tworzy rekord wypożyczenia.
 * 
 * Przepływ:
 * 1. Parsowanie bookId z ciała żądania
 * 2. Weryfikacja sesji użytkownika z ciasteczka
 * 3. Sprawdzenie czy użytkownik nie ma już aktywnego wypożyczenia tej książki
 * 4. Wyszukanie dostępnego egzemplarza książki
 * 5. Utworzenie rekordu wypożyczenia ze statusem 'Aktywne'
 * 6. Aktualizacja statusu egzemplarza na 'Wypozyczony'
 * 7. Zwrócenie potwierdzenia z ID rezerwacji
 * 
 * Kody odpowiedzi:
 * - 200: Rezerwacja utworzona pomyślnie
 * - 400: Użytkownik ma już tę książkę LUB brak dostępnych egzemplarzy
 * - 401: Użytkownik niezalogowany
 * - 500: Błąd serwera podczas przetwarzania
 * 
 * Zależności:
 * - next/server: NextResponse do budowania odpowiedzi HTTP
 * - next/headers: cookies() do odczytu sesji użytkownika
 * - @/lib/db: Pool połączeń do bazy danych MySQL
 * 
 * Tabele bazodanowe:
 * - Wypozyczenia: Rekordy wypożyczeń
 * - Egzemplarze: Fizyczne egzemplarze książek
 * 
 * Uwagi:
 * - Nazwa endpointu to "reservations", ale faktycznie tworzy wypożyczenie
 * - Jeden użytkownik może mieć tylko jeden aktywny egzemplarz danej książki
 * - Status egzemplarza zmienia się automatycznie na 'Wypozyczony'
 * 
 * @packageDocumentation
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

/**
 * Handler POST - Tworzenie nowej rezerwacji/wypożyczenia
 * 
 * Przetwarza żądanie wypożyczenia książki przez zalogowanego użytkownika.
 * Wykonuje walidację biznesową i aktualizuje stan bazy danych.
 * 
 * @param {Request} req - Żądanie HTTP zawierające { bookId: number }
 * @returns {Promise<NextResponse>} Odpowiedź JSON z wynikiem operacji
 */
export async function POST(req: Request) {
  try {
    // === SEKCJA: Parsowanie danych wejściowych ===
    const { bookId } = await req.json();

    // === SEKCJA: Weryfikacja sesji użytkownika ===
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("userSession");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parsowanie danych użytkownika z ciasteczka
    const user = JSON.parse(sessionCookie.value);
    const userId = Number(user.id);

    // === SEKCJA: Sprawdzenie duplikatu wypożyczenia ===
    // Użytkownik nie może mieć dwóch aktywnych wypożyczeń tej samej książki
    const [alreadyRows] = await pool.query(
      `
      SELECT 1
      FROM Wypozyczenia w
      JOIN Egzemplarze e ON w.EgzemplarzId = e.EgzemplarzId
      WHERE w.UzytkownikId = ?
        AND e.KsiazkaId = ?
        AND w.Status = 'Aktywne'
      `,
      [userId, bookId]
    );

    if ((alreadyRows as any[]).length > 0) {
      return NextResponse.json(
        { error: "Masz już wypożyczony egzemplarz tej książki." },
        { status: 400 }
      );
    }

    // === SEKCJA: Wyszukanie dostępnego egzemplarza ===
    // Szukamy pierwszego wolnego, nieusunięego egzemplarza
    const [copyRows] = await pool.query(
      `
      SELECT EgzemplarzId
      FROM Egzemplarze
      WHERE KsiazkaId = ?
        AND Status = 'Dostepny'
        AND IsDeleted = 0
      LIMIT 1
      `,
      [bookId]
    );

    const copies = copyRows as any[];
    if (copies.length === 0) {
      return NextResponse.json(
        { error: "Brak dostępnych egzemplarzy" },
        { status: 400 }
      );
    }

    const egzemplarzId = copies[0].EgzemplarzId;

    // === SEKCJA: Tworzenie rekordu wypożyczenia ===
    // Data wypożyczenia ustawiana automatycznie na NOW()
    const [insertResult] = await pool.query(
      `
      INSERT INTO Wypozyczenia 
        (UzytkownikId, EgzemplarzId, DataWypozyczenia, Status)
      VALUES 
        (?, ?, NOW(), 'Aktywne')
      `,
      [userId, egzemplarzId]
    );

    // === SEKCJA: Aktualizacja statusu egzemplarza ===
    // Oznaczamy egzemplarz jako niedostępny
    await pool.query(
      `
      UPDATE Egzemplarze
      SET Status = 'Wypozyczony'
      WHERE EgzemplarzId = ?
      `,
      [egzemplarzId]
    );

    // === SEKCJA: Odpowiedź sukcesu ===
    return NextResponse.json({
      message: "Rezerwacja utworzona",
      reservationId: (insertResult as any).insertId,
    });

  } catch (err) {
    // === SEKCJA: Obsługa błędów ===
    console.error("Reservation error:", err);
    return NextResponse.json(
      { error: "Błąd podczas rezerwacji" },
      { status: 500 }
    );
  }
}
