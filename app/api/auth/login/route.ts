// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // biblioteka do sprawdzania hasła (hashowanie hasła algorytmem blowfish)
import pool from "@/lib/db"; // połączenie do bazy danych
import type { UserRole } from "@/lib/auth"; // typ ról użytkowników

type DbUserRow = {
  UzytkownikId: number;
  Email: string;
  HasloHash: string;
  Imie: string | null;
  Nazwisko: string | null;
  NazwaRoli: "ADMIN" | "BIBLIOTEKARZ" | "CZYTELNIK";
};

// pomocnicza funkcja: baza → rola w aplikacji 
function mapDbRoleToUserRole(dbRole: DbUserRow["NazwaRoli"]): UserRole {
  switch (dbRole) {
    case "ADMIN":
      return "ADMIN";
    case "BIBLIOTEKARZ":
      return "LIBRARIAN";
    case "CZYTELNIK":
    default:
      return "USER";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Podaj email i hasło" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `
      SELECT 
        u.UzytkownikId,
        u.Email,
        u.HasloHash,
        u.Imie,
        u.Nazwisko,
        r.NazwaRoli
      FROM Uzytkownicy u
      JOIN Role r ON r.RolaId = u.RolaId
      WHERE u.Email = ? AND u.IsDeleted = 0 AND u.Aktywny = 1
      `,
      [email]
    );

    const list = rows as DbUserRow[];
    if (list.length === 0) {
      return NextResponse.json(
        { error: "Nieprawidłowy email lub hasło" },
        { status: 401 }
      );
    }

    const user = list[0];

    // sprawdzamy hash hasła
    const ok = await bcrypt.compare(password, user.HasloHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Nieprawidłowy email lub hasło" },
        { status: 401 }
      );
    }

    const role: UserRole = mapDbRoleToUserRole(user.NazwaRoli);

    return NextResponse.json({
      id: user.UzytkownikId,
      email: user.Email,
      firstName: user.Imie,
      lastName: user.Nazwisko,
      role, // to będzie: USER / LIBRARIAN / ADMIN
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Błąd serwera podczas logowania" },
      { status: 500 }
    );
  }
}
