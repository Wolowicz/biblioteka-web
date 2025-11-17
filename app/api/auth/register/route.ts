// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // biblioteka do hashowania haseł (hashowanie hasła algorytmem blowfish)
import pool from "@/lib/db"; // połączenie do bazy danych
import { validatePassword } from "@/lib/auth"; // funkcja do walidacji hasła z lib/auth.ts

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Brakuje wymaganych pól" },
        { status: 400 }
      );
    }

    // 1) Walidacja hasła według naszych zasad
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      );
    }

    // 2) Sprawdzenie, czy email już istnieje
    const [existingRows] = await pool.query(
      "SELECT UzytkownikId FROM Uzytkownicy WHERE Email = ? AND IsDeleted = 0",
      [email]
    );
    const existing = existingRows as any[];
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Użytkownik z takim emailem już istnieje" },
        { status: 409 }
      );
    }

    // 3) Hashujemy hasło bcryptem algorytmem blowfish
    const passwordHash = await bcrypt.hash(password, 10); // 10 to koszt (im wyższy, tym bezpieczniej, ale wolniej)

    // 4) Pobieramy RolaId dla roli CZYTELNIK jako domyłśna rola nowego użytkownika
    const [rolesRows] = await pool.query(
      "SELECT RolaId FROM Role WHERE NazwaRoli = 'CZYTELNIK'"
    );
    const rolesList = rolesRows as any[];

    if (rolesList.length === 0) {
      // awaryjny komunikat – ale to się nie powinno zdarzyć
      return NextResponse.json(
        { error: "Brak roli CZYTELNIK w tabeli Role" },
        { status: 500 }
      );
    }

    const roleId = rolesList[0].RolaId;

    // 5) Wstawiamy użytkownika do bazy
    const [result] = await pool.query(
      `INSERT INTO Uzytkownicy (Email, HasloHash, Imie, Nazwisko, RolaId, Aktywny)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [email, passwordHash, firstName, lastName, roleId]
    );

    return NextResponse.json(
      {
        message: "Użytkownik zarejestrowany",
        userId: (result as any).insertId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Błąd serwera podczas rejestracji" },
      { status: 500 }
    );
  }
}
