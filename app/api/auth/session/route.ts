import { NextResponse } from "next/server";
import { getUserSessionSSR } from "@/lib/auth/server";

export async function GET() {
  const user = await getUserSessionSSR();

  return NextResponse.json({
    user: user ?? null,
  });
}
