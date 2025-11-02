// app/api/books/[id]/route.ts
import { NextResponse } from "next/server";
import { getBookById } from "../../../_data/books";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // ⬅️ params jako Promise
) {
  const { id } = await ctx.params;          // ⬅️ konieczne await
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }

  const book = getBookById(numericId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(book);
}
