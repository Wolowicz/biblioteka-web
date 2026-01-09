/**
 * =============================================================================
 * ADMIN DASHBOARD - Premium Statistics Dashboard (SSR Wrapper)
 * =============================================================================
 * 
 * Dashboard z 4 interaktywnymi kartami statystyk:
 * - Całkowita liczba użytkowników
 * - Aktywne wypożyczenia
 * - Zaległe kary
 * - Stan magazynowy książek
 * 
 * @packageDocumentation
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // LIBRARIAN ma swój własny panel
  if (user.role === "LIBRARIAN") {
    redirect("/librarian");
  }

  // Tylko ADMIN może widzieć admin dashboard
  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminDashboardClient user={user} />;
}

