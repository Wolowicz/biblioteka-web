/**
 * LIBRARIAN BORROWINGS PAGE - Strona zarządzania wypożyczeniami i karami
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import LibrarianBorrowingsClient from "./LibrarianBorrowingsClient";

export default async function LibrarianBorrowingsPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // ADMIN ma swój własny panel wypożyczeń
  if (user.role === "ADMIN") {
    redirect("/admin/borrowings");
  }
  
  if (user.role !== "LIBRARIAN") {
    redirect("/");
  }

  return <LibrarianBorrowingsClient user={user} />;
}
