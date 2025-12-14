/**
 * =============================================================================
 * API: /api/auth/forgot-password - Reset hasła (żądanie)
 * =============================================================================
 * 
 * POST /api/auth/forgot-password - Żądanie tokenu resetowania hasła
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";

/**
 * Handler POST - Żądanie resetu hasła
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email jest wymagany" },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik istnieje
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT UzytkownikId, Imie, Nazwisko, Email 
       FROM uzytkownicy 
       WHERE Email = ? AND IsDeleted = 0 AND Aktywny = 1`,
      [email]
    );

    // Zawsze zwracaj sukces (bezpieczeństwo - nie ujawniaj czy email istnieje)
    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Jeśli podany email istnieje w systemie, otrzymasz link do resetowania hasła"
      });
    }

    const user = users[0];

    // Unieważnij poprzednie tokeny
    await pool.query<ResultSetHeader>(
      `UPDATE uzytkownicy 
       SET ResetToken = NULL, ResetTokenExpiry = NULL 
       WHERE UzytkownikId = ?`,
      [user.UzytkownikId]
    );

    // Wygeneruj nowy token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Token ważny przez 1 godzinę
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    // Zapisz token w bazie
    await pool.query<ResultSetHeader>(
      `UPDATE uzytkownicy 
       SET ResetToken = ?, ResetTokenExpiry = ?
       WHERE UzytkownikId = ?`,
      [tokenHash, expiryDate.toISOString(), user.UzytkownikId]
    );

    // W prawdziwej aplikacji tutaj wysłalibyśmy email z linkiem
    // Na potrzeby demo zwracamy token (w produkcji usunąć!)
    const resetLink = `/reset-password?token=${resetToken}`;

    // Utwórz powiadomienie (symulacja emaila)
    await pool.query<ResultSetHeader>(
      `INSERT INTO powiadomienia (UzytkownikId, Typ, Status, Temat, Tresc)
       VALUES (?, 'Email', 'Wyslane', 'Reset hasła', ?)`,
      [
        user.UzytkownikId, 
        `Link do resetowania hasła: ${resetLink}\n\nLink wygaśnie za 1 godzinę.`
      ]
    );

    // Log operacji
    await pool.query(
      `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
       VALUES ('Bezpieczenstwo', ?, 'Żądanie resetu hasła', 'Uzytkownicy', ?)`,
      [user.UzytkownikId, user.UzytkownikId]
    );

    return NextResponse.json({
      success: true,
      message: "Jeśli podany email istnieje w systemie, otrzymasz link do resetowania hasła",
      // DEV ONLY - usuń w produkcji:
      _devOnly: {
        resetLink,
        token: resetToken
      }
    });
  } catch (error) {
    console.error("Błąd API POST /api/auth/forgot-password:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
