import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { mapRoleFromDb, isValidUserRole } from "@/lib/auth/role-map";




export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Nieprawidłowe dane wejściowe" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Podaj email i hasło" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `
        SELECT 
          u.UzytkownikId AS Id,
          u.Imie,
          u.Nazwisko,
          u.Email,
          u.HasloHash,
          r.NazwaRoli AS Rola
        FROM uzytkownicy u
        JOIN role r ON u.RolaId = r.RolaId
        WHERE u.Email = ?
          AND u.IsDeleted = 0
          AND u.Aktywny = 1
      `,
      [email]
    );

    const users = rows as any[];

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Nieprawidłowy login lub hasło" },
        { status: 400 }
      );
    }

    const user = users[0];

    const ok = await bcrypt.compare(password, user.HasloHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Nieprawidłowy login lub hasło" },
        { status: 400 }
      );
    }

    // Mapa roli (najważniejsze!)
    const mappedRole = mapRoleFromDb(user.Rola);

    if (!isValidUserRole(mappedRole)) {
      console.warn("Ostrzeżenie: niezmapowana rola w DB:", user.Rola);
    }

    const session = {
      id: String(user.Id),
      email: user.Email,
      firstName: user.Imie,
      lastName: user.Nazwisko,
      role: mappedRole,
    };

    // ZAPIS COOKIE
    const cookieStore = await cookies();
    cookieStore.set("userSession", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return NextResponse.json(session, { status: 200 });
  } catch (err) {
    console.error("Login error:", err);

    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 }
    );
  }
}
