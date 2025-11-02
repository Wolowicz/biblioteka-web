// app/api/books/route.ts
import { NextResponse } from "next/server";
// Używam ścieżki względnej, żeby na pewno zadziałało bez aliasów:
import { getAllBooks } from "../../_data/books";

export async function GET() {
  // małe opóźnienie, żeby było widać loading (opcjonalnie)
  await new Promise(r => setTimeout(r, 200));
  return NextResponse.json(getAllBooks());
}
