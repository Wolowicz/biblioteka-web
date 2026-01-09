import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * Handler POST - Przywracanie usuniętego użytkownika (restore)
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = parseInt(id);

    // Sprawdź czy użytkownik istnieje i jest usunięty
    const [userCheck] = await pool.query<RowDataPacket[]>(
      `SELECT UzytkownikId, IsDeleted, Imie, Nazwisko FROM uzytkownicy WHERE UzytkownikId = ?`,
      [userId]
    );

    if (userCheck.length === 0) {
      return NextResponse.json(
        { error: "Użytkownik nie został znaleziony" },
        { status: 404 }
      );
    }

    if (!userCheck[0].IsDeleted) {
      return NextResponse.json(
        { error: "Użytkownik nie jest usunięty" },
        { status: 400 }
      );
    }

    // Przywróć użytkownika
    await pool.query<ResultSetHeader>(
      `UPDATE uzytkownicy SET IsDeleted = 0, DeletedAt = NULL, Aktywny = 1 WHERE UzytkownikId = ?`,
      [userId]
    );

    const userName = `${userCheck[0].Imie} ${userCheck[0].Nazwisko}`;

    // Log operacji
    await pool.query(
      `
      INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
      VALUES ('Audyt', ?, ?, 'Uzytkownicy', ?)
      `,
      [user.id, `Przywrócono użytkownika: ${userName}`, userId]
    );

    return NextResponse.json({
      success: true,
      message: "Użytkownik został przywrócony"
    });
  } catch (error) {
    console.error("Błąd API POST /api/admin/users/[id]/restore:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
