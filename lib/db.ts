/**
 * =============================================================================
 * DATABASE CONNECTION - Połączenie z bazą danych MySQL
 * =============================================================================
 * 
 * Ten moduł konfiguruje i eksportuje pulę połączeń (connection pool) do bazy
 * danych MySQL. Pula połączeń to wzorzec optymalizujący wydajność poprzez:
 * 
 * - Utrzymywanie kilku otwartych połączeń gotowych do użycia
 * - Eliminację narzutu tworzenia nowego połączenia przy każdym żądaniu
 * - Automatyczne zarządzanie cyklem życia połączeń
 * - Kolejkowanie żądań gdy wszystkie połączenia są zajęte
 * 
 * Konfiguracja:
 * Parametry połączenia są pobierane ze zmiennych środowiskowych (.env.local):
 * - DB_HOST - adres serwera MySQL
 * - DB_PORT - port MySQL (domyślnie 3306)
 * - DB_USER - nazwa użytkownika
 * - DB_PASSWORD - hasło
 * - DB_NAME - nazwa bazy danych
 * 
 * Użycie:
 * ```typescript
 * import pool from "@/lib/db";
 * 
 * const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
 * ```
 * 
 * Bezpieczeństwo:
 * - Zawsze używaj parametryzowanych zapytań (?)
 * - Nigdy nie interpoluj zmiennych bezpośrednio w SQL
 * - Połączenie jest automatycznie zwracane do puli
 */

import mysql from "mysql2/promise";

// =============================================================================
// KONFIGURACJA PULI POŁĄCZEŃ
// =============================================================================

/**
 * Opcje konfiguracji puli połączeń MySQL.
 * 
 * Każda opcja wpływa na zachowanie i wydajność puli:
 */
const poolConfig: mysql.PoolOptions = {
  /**
   * Adres hosta serwera MySQL.
   * W development: "localhost" lub "127.0.0.1"
   * W produkcji: adres serwera lub usługi cloud
   */
  host: process.env.DB_HOST,

  /**
   * Port serwera MySQL.
   * Domyślnie 3306 jeśli nie podano.
   */
  port: Number(process.env.DB_PORT) || 3306,

  /**
   * Nazwa użytkownika bazy danych.
   */
  user: process.env.DB_USER,

  /**
   * Hasło użytkownika bazy danych.
   * WAŻNE: Nigdy nie commituj tego do repozytorium!
   */
  password: process.env.DB_PASSWORD,

  /**
   * Nazwa bazy danych do połączenia.
   */
  database: process.env.DB_NAME,

  /**
   * Czy czekać na wolne połączenie gdy wszystkie są zajęte.
   * true = czekaj w kolejce
   * false = natychmiast zwróć błąd
   */
  waitForConnections: true,

  /**
   * Maksymalna liczba połączeń w puli.
   * 
   * Optymalna wartość zależy od:
   * - Możliwości serwera MySQL (max_connections)
   * - Liczby instancji aplikacji (Vercel serverless functions)
   * - Charakterystyki ruchu (średnie/szczytowe obciążenie)
   * 
   * 10 to dobra wartość początkowa dla małej/średniej aplikacji.
   */
  connectionLimit: 10,

  /**
   * Maksymalna długość kolejki oczekujących żądań.
   * 0 = nieograniczona kolejka
   * 
   * W produkcji rozważ ustawienie limitu by unikać memory leaks
   * przy nagłym wzroście ruchu.
   */
  queueLimit: 0,
};

// =============================================================================
// TWORZENIE I EKSPORT PULI
// =============================================================================

/**
 * Pula połączeń MySQL.
 * 
 * Jest tworzona raz przy imporcie modułu i reużywana przez wszystkie
 * żądania. Node.js/Next.js cache'uje moduły, więc pula jest singleton.
 * 
 * Metody:
 * - pool.query(sql, params) - wykonaj zapytanie i zwróć wyniki
 * - pool.execute(sql, params) - wykonaj prepared statement
 * - pool.getConnection() - pobierz dedykowane połączenie (dla transakcji)
 * 
 * @example
 * ```typescript
 * // Proste zapytanie
 * const [rows] = await pool.query(
 *   "SELECT * FROM books WHERE title LIKE ?",
 *   ["%Harry%"]
 * );
 * 
 * // Transakcja
 * const conn = await pool.getConnection();
 * try {
 *   await conn.beginTransaction();
 *   await conn.query("UPDATE accounts SET balance = balance - ? WHERE id = ?", [100, 1]);
 *   await conn.query("UPDATE accounts SET balance = balance + ? WHERE id = ?", [100, 2]);
 *   await conn.commit();
 * } catch (e) {
 *   await conn.rollback();
 *   throw e;
 * } finally {
 *   conn.release();
 * }
 * ```
 */
const pool = mysql.createPool(poolConfig);

/**
 * Eksportujemy pulę jako domyślny eksport.
 * 
 * Użycie:
 * ```typescript
 * import pool from "@/lib/db";
 * ```
 */
export default pool;