/**
 * ADMIN BORROWINGS PAGE - Wypożyczenia i Kary
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminBorrowingsClient from "./AdminBorrowingsClient";

export default async function AdminBorrowingsPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // LIBRARIAN ma własny panel wypożyczeń
  if (user.role === "LIBRARIAN") {
    redirect("/librarian/borrowings");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminBorrowingsClient user={user} />;
}
