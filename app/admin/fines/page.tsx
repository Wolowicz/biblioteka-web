/**
 * =============================================================================
 * ADMIN FINES - Sekcja Regulacja Kar
 * =============================================================================
 * 
 * Zarządzanie karami:
 * - Wyszukiwanie użytkownika po nazwisku
 * - Lista kar użytkownika
 * - Przycisk "Rozlicz" (zmiana statusu na Zaplacona)
 * - Kolory: Success (opłacone), Danger (naliczone)
 * 
 * @packageDocumentation
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminFinesClient from "./AdminFinesClient";

export default async function AdminFinesPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // LIBRARIAN ma własny panel kar w /librarian/borrowings
  if (user.role === "LIBRARIAN") {
    redirect("/librarian/borrowings");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminFinesClient user={user} />;
}
