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
    redirect("/welcome");
  }

  // LIBRARIAN ma swój własny panel
  if (user.role === "LIBRARIAN") {
    redirect("/librarian");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminUsersClient user={user} />;
}
