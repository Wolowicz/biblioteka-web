/**
 * =============================================================================
 * API: /api/copies/[id] - Operacje na pojedynczym egzemplarzu
 * =============================================================================
 * 
 * GET    /api/copies/[id] - Pobierz szczegóły egzemplarza
 * PATCH  /api/copies/[id] - Aktualizuj status egzemplarza
 * DELETE /api/copies/[id] - Usuń egzemplarz (soft delete)
 * 
 * @packageDocumentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Handler GET - Szczegóły egzemplarza
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await context.params;
    const copyId = parseInt(id);

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        e.EgzemplarzId AS id,
        e.KsiazkaId AS bookId,
        k.Tytul AS bookTitle,
        e.NumerInwentarzowy AS inventoryNumber,
        e.Status AS status,
        e.CreatedAt AS createdAt,
        e.IsDeleted AS deleted,
        (SELECT COUNT(*) FROM wypozyczenia WHERE EgzemplarzId = e.EgzemplarzId) AS borrowingsCount
      FROM egzemplarze e
      JOIN ksiazki k ON e.KsiazkaId = k.KsiazkaId
      WHERE e.EgzemplarzId = ?
      `,
      [copyId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Egzemplarz nie został znaleziony" },
        { status: 404 }
      );
    }

    // Pobierz historię wypożyczeń egzemplarza
    const [borrowings] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        w.WypozyczenieId AS id,
        CONCAT(u.Imie, ' ', u.Nazwisko) AS userName,
        w.DataWypozyczenia AS borrowDate,
        w.TerminZwrotu AS dueDate,
        w.DataZwrotu AS returnDate,
        w.Status AS status
      FROM wypozyczenia w
      JOIN uzytkownicy u ON w.UzytkownikId = u.UzytkownikId
      WHERE w.EgzemplarzId = ? AND w.IsDeleted = 0
      ORDER BY w.DataWypozyczenia DESC
      LIMIT 10
      `,
      [copyId]
    );

    return NextResponse.json({
      ...rows[0],
      borrowingHistory: borrowings
    });
  } catch (error) {
    console.error("Błąd API GET /api/copies/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler PATCH - Aktualizacja statusu egzemplarza
 */
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await context.params;
    const copyId = parseInt(id);

    const body = await request.json();
    const { status, inventoryNumber } = body;

    // Pobierz aktualny stan
    const [currentState] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM egzemplarze WHERE EgzemplarzId = ? AND IsDeleted = 0`,
      [copyId]
    );

    if (currentState.length === 0) {
      return NextResponse.json(
        { error: "Egzemplarz nie został znaleziony" },
        { status: 404 }
      );
    }

    const oldStatus = currentState[0].Status;
    const bookId = currentState[0].KsiazkaId;

    const updates: string[] = [];
    const params: any[] = [];

    if (status) {
      const validStatuses = ["Dostepny", "Wypozyczony", "Uszkodzony", "Zaginiony", "Zarezerwowany"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Nieprawidłowy status" },
          { status: 400 }
        );
      }
      updates.push("Status = ?");
      params.push(status);
    }

    if (inventoryNumber) {
      // Sprawdź unikalność
      const [existing] = await pool.query<RowDataPacket[]>(
        `SELECT EgzemplarzId FROM egzemplarze WHERE NumerInwentarzowy = ? AND EgzemplarzId != ?`,
        [inventoryNumber, copyId]
      );

      if (existing.length > 0) {
        return NextResponse.json(
          { error: "Numer inwentarzowy jest już zajęty" },
          { status: 409 }
        );
      }

      updates.push("NumerInwentarzowy = ?");
      params.push(inventoryNumber);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Brak danych do aktualizacji" },
        { status: 400 }
      );
    }

    params.push(copyId);

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      await connection.query<ResultSetHeader>(
        `UPDATE egzemplarze SET ${updates.join(", ")} WHERE EgzemplarzId = ?`,
        params
      );

      // Aktualizuj licznik dostępnych egzemplarzy jeśli zmieniono status
      if (status && status !== oldStatus) {
        let diff = 0;
        if (oldStatus === "Dostepny" && status !== "Dostepny") {
          diff = -1;
        } else if (oldStatus !== "Dostepny" && status === "Dostepny") {
          diff = 1;
        }

        if (diff !== 0) {
          await connection.query(
            `UPDATE ksiazki SET DostepneEgzemplarze = DostepneEgzemplarze + ? WHERE KsiazkaId = ?`,
            [diff, bookId]
          );
        }
      }

      await connection.commit();

      // Log operacji
      await pool.query(
        `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId, StanPrzed, StanPo)
         VALUES ('Audyt', ?, 'Zaktualizowano egzemplarz', 'Egzemplarze', ?, ?, ?)`,
        [user.id, copyId, JSON.stringify(currentState[0]), JSON.stringify(body)]
      );

      return NextResponse.json({
        success: true,
        message: "Egzemplarz został zaktualizowany"
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Błąd API PATCH /api/copies/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler DELETE - Usuwanie egzemplarza (soft delete)
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await context.params;
    const copyId = parseInt(id);

    // Sprawdź czy egzemplarz istnieje i czy nie jest wypożyczony
    const [copyCheck] = await pool.query<RowDataPacket[]>(
      `SELECT EgzemplarzId, KsiazkaId, Status FROM egzemplarze WHERE EgzemplarzId = ? AND IsDeleted = 0`,
      [copyId]
    );

    if (copyCheck.length === 0) {
      return NextResponse.json(
        { error: "Egzemplarz nie został znaleziony" },
        { status: 404 }
      );
    }

    if (copyCheck[0].Status === "Wypozyczony") {
      return NextResponse.json(
        { error: "Nie można usunąć wypożyczonego egzemplarza" },
        { status: 400 }
      );
    }

    const bookId = copyCheck[0].KsiazkaId;
    const wasAvailable = copyCheck[0].Status === "Dostepny";

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Soft delete
      await connection.query<ResultSetHeader>(
        `UPDATE egzemplarze SET IsDeleted = 1, DeletedAt = NOW(), DeletedBy = ? WHERE EgzemplarzId = ?`,
        [user.id, copyId]
      );

      // Aktualizuj liczniki
      await connection.query(
        `UPDATE ksiazki 
         SET LiczbaEgzemplarzy = LiczbaEgzemplarzy - 1,
             DostepneEgzemplarze = DostepneEgzemplarze - ?
         WHERE KsiazkaId = ?`,
        [wasAvailable ? 1 : 0, bookId]
      );

      await connection.commit();

      // Log operacji
      await pool.query(
        `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
         VALUES ('Audyt', ?, 'Usunięto egzemplarz', 'Egzemplarze', ?)`,
        [user.id, copyId]
      );

      return NextResponse.json({
        success: true,
        message: "Egzemplarz został usunięty"
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Błąd API DELETE /api/copies/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
