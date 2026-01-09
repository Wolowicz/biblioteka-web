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
    redirect("/api/auth/login");
  }

  if (user.role !== "ADMIN" && user.role !== "LIBRARIAN") {
    redirect("/");
  }

  return <AdminDashboardClient user={user} />;
}

