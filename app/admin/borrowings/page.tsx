/**
 * ADMIN BORROWINGS PAGE - Wypożyczenia i Kary
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminBorrowingsClient from "./AdminBorrowingsClient";

export default async function AdminBorrowingsPage() {
  const user = await getUserSessionSSR();
  
  if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
    redirect("/admin/dashboard");
  }

  return <AdminBorrowingsClient user={user} />;
}
