/**
 * LIBRARIAN DASHBOARD - Strona główna panelu bibliotekarza
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import LibrarianDashboardClient from "./LibrarianDashboardClient";

export default async function LibrarianPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // ADMIN ma swój własny panel
  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  
  // Tylko LIBRARIAN może widzieć ten panel
  if (user.role !== "LIBRARIAN") {
    redirect("/");
  }

  return <LibrarianDashboardClient user={user} />;
}
