/**
 * ADMIN PAGE - Przekierowanie do dashboard
 * 
 * Strona /admin przekierowuje:
 * - ADMIN → /admin/dashboard
 * - LIBRARIAN → /librarian
 * - Inni → /
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // LIBRARIAN ma swój własny panel
  if (user.role === "LIBRARIAN") {
    redirect("/librarian");
  }

  // ADMIN → dashboard
  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  // Inni użytkownicy → strona główna
  redirect("/");
}
