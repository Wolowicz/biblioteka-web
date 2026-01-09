/**
 * =============================================================================
 * API: /api/fines/[id] - Operacje na pojedynczej karze
 * =============================================================================
 * 
 * PATCH /api/fines/[id] - Aktualizacja statusu kary (LIBRARIAN/ADMIN)
 * PUT   /api/fines/[id] - Alias dla PATCH (rozliczenie kary)
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { ResultSetHeader } from "mysql2";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Handler PATCH - Aktualizacja statusu kary
 */
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
    }

    if (user.role !== "ADMIN" && user.role !== "LIBRARIAN") {
      return NextResponse.json(
        { error: "Brak uprawnień" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const fineId = parseInt(id);
    
    if (isNaN(fineId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID kary" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["Naliczona", "Zaplacona", "Anulowana"].includes(status)) {
      return NextResponse.json(
        { error: "Nieprawidłowy status. Dozwolone: Naliczona, Zaplacona, Anulowana" },
        { status: 400 }
      );
    }

    const dataRozliczona = status !== "Naliczona" ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

    const [result] = await pool.query<ResultSetHeader>(
      `
      UPDATE kary 
      SET Status = ?, DataRozliczona = ?
      WHERE KaraId = ?
      `,
      [status, dataRozliczona, fineId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Kara nie została znaleziona" },
        { status: 404 }
      );
    }

    // Log operacji
    await pool.query(
      `
      INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId, StanPo)
      VALUES ('Audyt', ?, ?, 'Kary', ?, ?)
      `,
      [
        user.id,
        `Zmiana statusu kary na: ${status}`,
        fineId,
        JSON.stringify({ status, dataRozliczona })
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Status kary zmieniony na: ${status}`
    });
  } catch (error) {
    console.error("Błąd API /api/fines/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler PUT - Alias dla PATCH (rozliczenie kary)
 */
export const PUT = PATCH;
