/**
 * =============================================================================
 * API: /api/ebooks/[id] - Operacje na pojedynczym e-booku
 * =============================================================================
 * 
 * GET /api/ebooks/[id] - Pobierz e-book (metadane)
 * PATCH /api/ebooks/[id] - Aktualizuj e-book (ADMIN/LIBRARIAN)
 * DELETE /api/ebooks/[id] - Usuń e-book (ADMIN/LIBRARIAN)
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
 * Handler GET - Pobierz e-book
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { id } = await params;

    const [ebooks] = await pool.query<RowDataPacket[]>(
      `SELECT 
        e.EbookId,
        e.Tytul,
        e.SciezkaPliku,
        e.RozmiarPliku,
        e.Format,
        e.KsiazkaId,
        e.PoziomDostepu,
        e.CreatedAt,
        e.CreatedBy,
        k.Tytul as KsiazkaTitle,
        k.OkladkaUrl,
        u.Imie as CreatedByName,
        u.Nazwisko as CreatedByLastname
       FROM ebooki e
       LEFT JOIN ksiazki k ON e.KsiazkaId = k.KsiazkaId
       LEFT JOIN uzytkownicy u ON e.CreatedBy = u.UzytkownikId
       WHERE e.EbookId = ? AND e.IsDeleted = 0`,
      [id]
    );

    if (ebooks.length === 0) {
      return NextResponse.json(
        { error: "E-book nie istnieje" },
        { status: 404 }
      );
    }

    const ebook = ebooks[0];

    // Sprawdź poziom dostępu
    const accessLevelMap: { [key: string]: string[] } = {
      "Publiczny": ["READER", "LIBRARIAN", "ADMIN"],
      "Czytelnik": ["READER", "LIBRARIAN", "ADMIN"],
      "Bibliotekarz": ["LIBRARIAN", "ADMIN"],
      "Admin": ["ADMIN"]
    };

    const allowedRoles = accessLevelMap[ebook.PoziomDostepu] || [];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: "Brak dostępu do tego e-booka" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ebook: {
        id: ebook.EbookId,
        title: ebook.Tytul,
        filePath: ebook.SciezkaPliku,
        fileSize: ebook.RozmiarPliku,
        format: ebook.Format,
        bookId: ebook.KsiazkaId,
        bookTitle: ebook.KsiazkaTitle,
        bookCover: ebook.OkladkaUrl,
        accessLevel: ebook.PoziomDostepu,
        createdAt: ebook.CreatedAt,
        createdBy: ebook.CreatedByName && ebook.CreatedByLastname 
          ? `${ebook.CreatedByName} ${ebook.CreatedByLastname}` 
          : null
      }
    });
  } catch (error) {
    console.error("Błąd API GET /api/ebooks/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler PATCH - Aktualizuj e-book
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Sprawdź czy e-book istnieje
    const [ebookCheck] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ebooki WHERE EbookId = ? AND IsDeleted = 0`,
      [id]
    );

    if (ebookCheck.length === 0) {
      return NextResponse.json(
        { error: "E-book nie istnieje" },
        { status: 404 }
      );
    }

    const currentEbook = ebookCheck[0];

    // Bibliotekarz nie może edytować e-booków Admin-only
    if (user.role === "LIBRARIAN" && currentEbook.PoziomDostepu === "Admin") {
      return NextResponse.json(
        { error: "Brak uprawnień do edycji tego e-booka" },
        { status: 403 }
      );
    }

    const allowedFields = ["title", "filePath", "fileSize", "format", "bookId", "accessLevel"];
    const fieldMapping: { [key: string]: string } = {
      title: "Tytul",
      filePath: "SciezkaPliku",
      fileSize: "RozmiarPliku",
      format: "Format",
      bookId: "KsiazkaId",
      accessLevel: "PoziomDostepu"
    };

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        // Bibliotekarz nie może zmienić poziomu dostępu na Admin
        if (key === "accessLevel") {
          if (user.role === "LIBRARIAN" && value === "Admin") {
            return NextResponse.json(
              { error: "Brak uprawnień do ustawienia poziomu Admin" },
              { status: 403 }
            );
          }
        }
        
        updates.push(`${fieldMapping[key]} = ?`);
        values.push(value as string | number | null);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Brak pól do aktualizacji" },
        { status: 400 }
      );
    }

    updates.push("UpdatedAt = NOW()");
    updates.push("UpdatedBy = ?");
    values.push(user.id);
    values.push(id);

    await pool.query<ResultSetHeader>(
      `UPDATE ebooki SET ${updates.join(", ")} WHERE EbookId = ?`,
      values
    );

    // Log operacji
    await pool.query(
      `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId, StanPrzed, StanPo)
       VALUES ('Audyt', ?, ?, 'Ebooki', ?, ?, ?)`,
      [
        user.id, 
        `Zaktualizowano e-book: "${currentEbook.Tytul}"`, 
        id,
        JSON.stringify(currentEbook),
        JSON.stringify(body)
      ]
    );

    return NextResponse.json({
      success: true,
      message: "E-book został zaktualizowany"
    });
  } catch (error) {
    console.error("Błąd API PATCH /api/ebooks/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/**
 * Handler DELETE - Usuń e-book (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserSessionSSR();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await params;

    // Sprawdź czy e-book istnieje
    const [ebookCheck] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ebooki WHERE EbookId = ? AND IsDeleted = 0`,
      [id]
    );

    if (ebookCheck.length === 0) {
      return NextResponse.json(
        { error: "E-book nie istnieje" },
        { status: 404 }
      );
    }

    const ebook = ebookCheck[0];

    // Bibliotekarz nie może usuwać e-booków Admin-only
    if (user.role === "LIBRARIAN" && ebook.PoziomDostepu === "Admin") {
      return NextResponse.json(
        { error: "Brak uprawnień do usunięcia tego e-booka" },
        { status: 403 }
      );
    }

    // Soft delete
    await pool.query<ResultSetHeader>(
      `UPDATE ebooki 
       SET IsDeleted = 1, DeletedAt = NOW(), DeletedBy = ?
       WHERE EbookId = ?`,
      [user.id, id]
    );

    // Log operacji
    await pool.query(
      `INSERT INTO logi (TypCoSieStalo, UzytkownikId, Opis, Encja, EncjaId)
       VALUES ('Audyt', ?, ?, 'Ebooki', ?)`,
      [user.id, `Usunięto e-book: "${ebook.Tytul}"`, id]
    );

    return NextResponse.json({
      success: true,
      message: "E-book został usunięty"
    });
  } catch (error) {
    console.error("Błąd API DELETE /api/ebooks/[id]:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
