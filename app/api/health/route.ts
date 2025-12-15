import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db";

export async function GET() {
  const db = await testConnection();

  if (!db.ok) {
    return NextResponse.json({ ok: false, db: { ok: false, error: db.error } }, { status: 503 });
  }

  return NextResponse.json({ ok: true, db: { ok: true } }, { status: 200 });
}
