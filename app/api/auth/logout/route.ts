import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Wylogowano" });

  // Usuwamy cookie userSession
  res.cookies.set("userSession", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return res;
}
