/**
 * =============================================================================
 * ADMIN USERS PAGE - Zarządzanie użytkownikami
 * =============================================================================
 * 
 * Funkcje:
 * - Lista wszystkich użytkowników
 * - Filtrowanie po roli (Admin/Bibliotekarz/Czytelnik)
 * - Edycja danych użytkownika
 * - Zmiana roli
 * - Aktywacja/Deaktywacja konta
 * - Soft delete
 * 
 * @packageDocumentation
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/api/auth/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }

  return <AdminUsersClient user={user} />;
}
