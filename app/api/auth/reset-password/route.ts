/**
 * =============================================================================
 * API: /api/auth/reset-password - Reset hasła (wykonanie)
 * =============================================================================
 * 
 * POST /api/auth/reset-password - Ustawienie nowego hasła
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";
import bcrypt from "bcrypt";

/**
 * Handler POST - Resetowanie hasła z tokenem
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token i nowe hasło są wymagane" },
        { status: 400 }
      );
    }

    // Walidacja hasła
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Hasło musi mieć minimum 8 znaków" },
        { status: 400 }
      );
    }

    // Hashuj token do porównania
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Znajdź użytkownika z tym tokenem
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT UzytkownikId, Email, ResetTokenExpiry
       FROM uzytkownicy 
       WHERE ResetToken = ? AND IsDeleted = 0`,
      [tokenHash]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Nieprawidłowy lub wygasły token" },
        { status: 400 }
      );
    }

    const user = users[0];

    // Sprawdź czy token nie wygasł
    const expiry = new Date(user.ResetTokenExpiry);
    if (expiry < new Date()) {
      // Wyczyść wygasły token
      await pool.query<ResultSetHeader>(
        `UPDATE uzytkownicy 
         SET ResetToken = NULL, ResetTokenExpiry = NULL 
         WHERE UzytkownikId = ?`,
        [user.UzytkownikId]
      );

      return NextResponse.json(
        { error: "Token wygasł. Poproś o nowy link do resetowania hasła." },
        { status: 400 }
      );
    }

    // Hashuj nowe hasło
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Zaktualizuj hasło i wyczyść token
    await pool.query<ResultSetHeader>(
      `UPDATE uzytkownicy 
       SET HasloHash = ?, ResetToken = NULL, ResetTokenExpiry = NULL, UpdatedAt = NOW()
       WHERE UzytkownikId = ?`,
      [hashedPassword, user.UzytkownikId]
    );

    // Log operacji
    await pool.query(
      `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
       VALUES ('Bezpieczenstwo', ?, 'Hasło zostało zresetowane', 'Uzytkownicy', ?)`,
      [user.UzytkownikId, user.UzytkownikId]
    );

    // Powiadomienie o zmianie hasła
    await pool.query<ResultSetHeader>(
      `INSERT INTO powiadomienia (UzytkownikId, Typ, Status, Temat, Tresc)
       VALUES (?, 'InApp', 'Oczekuje', 'Hasło zmienione', 'Twoje hasło zostało pomyślnie zmienione. Jeśli to nie Ty, skontaktuj się z administratorem.')`,
      [user.UzytkownikId]
    );

    return NextResponse.json({
      success: true,
      message: "Hasło zostało zmienione. Możesz się teraz zalogować."
    });
  } catch (error) {
    console.error("Błąd API POST /api/auth/reset-password:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
