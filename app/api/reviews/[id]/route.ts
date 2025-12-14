/**
 * =============================================================================
 * API: /api/reviews/[id] - Operacje na pojedynczej recenzji
 * =============================================================================
 * 
 * GET    /api/reviews/[id] - Pobierz szczegóły recenzji
 * PATCH  /api/reviews/[id] - Aktualizacja statusu/zgłoszenie (LIBRARIAN/ADMIN)
 * DELETE /api/reviews/[id] - Usunięcie recenzji (właściciel lub ADMIN)
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
 * Handler GET - Pobieranie szczegółów recenzji
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const reviewId = parseInt(id);
    
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID recenzji" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.RecenzjaId AS id,
        r.KsiazkaId AS bookId,
        k.Tytul AS bookTitle,
        r.UzytkownikId AS userId,
        CONCAT(u.Imie, ' ', u.Nazwisko) AS userName,
        r.Ocena AS rating,
        r.Tresc AS content,
        r.Status AS status,
        r.Zgloszona AS reported,
        r.PowodZgloszenia AS reportReason,
        r.CreatedAt AS createdAt
      FROM recenzje r
      JOIN ksiazki k ON r.KsiazkaId = k.KsiazkaId
      JOIN uzytkownicy u ON r.UzytkownikId = u.UzytkownikId
      WHERE r.RecenzjaId = ? AND r.IsDeleted = 0
      `,
      [reviewId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Recenzja nie została znaleziona" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Błąd API GET /api/reviews/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler PATCH - Aktualizacja recenzji (status, zgłoszenie)
 */
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
    }

    const { id } = await context.params;
    const reviewId = parseInt(id);
    
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID recenzji" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, status, reportReason } = body;

    const isStaff = user.role === "ADMIN" || user.role === "LIBRARIAN";

    // Akcja: zgłoszenie recenzji (każdy zalogowany użytkownik)
    if (action === "report") {
      if (!reportReason || reportReason.length < 5) {
        return NextResponse.json(
          { error: "Powód zgłoszenia musi mieć minimum 5 znaków" },
          { status: 400 }
        );
      }

      await pool.query<ResultSetHeader>(
        `
        UPDATE recenzje 
        SET Zgloszona = 1, ZgloszonaPrzez = ?, PowodZgloszenia = ?
        WHERE RecenzjaId = ? AND IsDeleted = 0
        `,
        [user.id, reportReason, reviewId]
      );

      return NextResponse.json({
        success: true,
        message: "Recenzja została zgłoszona"
      });
    }

    // Akcja: cofnięcie zgłoszenia (tylko osoba która zgłosiła lub ADMIN)
    if (action === "unreport") {
      // Sprawdź kto zgłosił recenzję
      const [reportCheck] = await pool.query<RowDataPacket[]>(
        `SELECT ZgloszonaPrzez FROM recenzje WHERE RecenzjaId = ? AND IsDeleted = 0 AND Zgloszona = 1`,
        [reviewId]
      );

      if (reportCheck.length === 0) {
        return NextResponse.json(
          { error: "Ta recenzja nie jest zgłoszona" },
          { status: 400 }
        );
      }

      const isReporter = reportCheck[0].ZgloszonaPrzez === parseInt(user.id);
      const isAdmin = user.role === "ADMIN";

      if (!isReporter && !isAdmin) {
        return NextResponse.json(
          { error: "Tylko osoba zgłaszająca lub administrator może cofnąć zgłoszenie" },
          { status: 403 }
        );
      }

      await pool.query<ResultSetHeader>(
        `
        UPDATE recenzje 
        SET Zgloszona = 0, ZgloszonaPrzez = NULL, PowodZgloszenia = NULL
        WHERE RecenzjaId = ? AND IsDeleted = 0
        `,
        [reviewId]
      );

      return NextResponse.json({
        success: true,
        message: "Zgłoszenie zostało cofnięte"
      });
    }

    // Zmiana statusu (tylko LIBRARIAN/ADMIN)
    if (action === "updateStatus") {
      if (!isStaff) {
        return NextResponse.json(
          { error: "Brak uprawnień" },
          { status: 403 }
        );
      }

      if (!status || !["Oczekuje", "Zatwierdzona", "Odrzucona"].includes(status)) {
        return NextResponse.json(
          { error: "Nieprawidłowy status" },
          { status: 400 }
        );
      }

      const zatwierdzonaKiedy = status === "Zatwierdzona" 
        ? new Date().toISOString().slice(0, 19).replace('T', ' ')
        : null;

      await pool.query<ResultSetHeader>(
        `
        UPDATE recenzje 
        SET Status = ?, ZatwierdzonaPrzez = ?, ZatwierdzonaKiedy = ?
        WHERE RecenzjaId = ? AND IsDeleted = 0
        `,
        [status, status !== "Oczekuje" ? user.id : null, zatwierdzonaKiedy, reviewId]
      );

      // Log operacji
      await pool.query(
        `
        INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
        VALUES ('Audyt', ?, ?, 'Recenzje', ?)
        `,
        [user.id, `Zmiana statusu recenzji na: ${status}`, reviewId]
      );

      return NextResponse.json({
        success: true,
        message: `Status recenzji zmieniony na: ${status}`
      });
    }

    return NextResponse.json(
      { error: "Nieznana akcja" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Błąd API PATCH /api/reviews/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler PUT - Edycja recenzji (tylko właściciel)
 */
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
    }

    const { id } = await context.params;
    const reviewId = parseInt(id);
    
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID recenzji" },
        { status: 400 }
      );
    }

    // Sprawdź właściciela recenzji
    const [reviewCheck] = await pool.query<RowDataPacket[]>(
      `SELECT UzytkownikId, Status FROM recenzje WHERE RecenzjaId = ? AND IsDeleted = 0`,
      [reviewId]
    );

    if (reviewCheck.length === 0) {
      return NextResponse.json(
        { error: "Recenzja nie została znaleziona" },
        { status: 404 }
      );
    }

    const isOwner = reviewCheck[0].UzytkownikId === parseInt(user.id);

    if (!isOwner) {
      return NextResponse.json(
        { error: "Brak uprawnień do edycji tej recenzji" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rating, comment } = body;

    // Walidacja
    if (!rating || !comment) {
      return NextResponse.json(
        { error: "Wymagane pola: rating, comment" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Ocena musi być w zakresie 1-5" },
        { status: 400 }
      );
    }

    if (comment.length < 10) {
      return NextResponse.json(
        { error: "Recenzja musi mieć minimum 10 znaków" },
        { status: 400 }
      );
    }

    // Aktualizacja recenzji - status wróci do "Oczekuje" po edycji
    await pool.query<ResultSetHeader>(
      `
      UPDATE recenzje 
      SET Ocena = ?, Tresc = ?, Status = 'Oczekuje', UpdatedAt = NOW()
      WHERE RecenzjaId = ? AND IsDeleted = 0
      `,
      [rating, comment, reviewId]
    );

    // Log operacji
    await pool.query(
      `
      INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
      VALUES ('Audyt', ?, 'Edytowano recenzję', 'Recenzje', ?)
      `,
      [user.id, reviewId]
    );

    return NextResponse.json({
      success: true,
      message: "Recenzja została zaktualizowana i oczekuje na ponowne zatwierdzenie"
    });
  } catch (error) {
    console.error("Błąd API PUT /api/reviews/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler DELETE - Usuwanie recenzji
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
    }

    const { id } = await context.params;
    const reviewId = parseInt(id);
    
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID recenzji" },
        { status: 400 }
      );
    }

    // Sprawdź właściciela recenzji
    const [reviewCheck] = await pool.query<RowDataPacket[]>(
      `SELECT UzytkownikId FROM recenzje WHERE RecenzjaId = ? AND IsDeleted = 0`,
      [reviewId]
    );

    if (reviewCheck.length === 0) {
      return NextResponse.json(
        { error: "Recenzja nie została znaleziona" },
        { status: 404 }
      );
    }

    const isOwner = reviewCheck[0].UzytkownikId === parseInt(user.id);
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Brak uprawnień do usunięcia tej recenzji" },
        { status: 403 }
      );
    }

    // Soft delete
    await pool.query<ResultSetHeader>(
      `
      UPDATE recenzje 
      SET IsDeleted = 1, DeletedAt = NOW(), DeletedBy = ?
      WHERE RecenzjaId = ?
      `,
      [user.id, reviewId]
    );

    // Log operacji
    await pool.query(
      `
      INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
      VALUES ('Audyt', ?, 'Usunięto recenzję', 'Recenzje', ?)
      `,
      [user.id, reviewId]
    );

    return NextResponse.json({
      success: true,
      message: "Recenzja została usunięta"
    });
  } catch (error) {
    console.error("Błąd API DELETE /api/reviews/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
