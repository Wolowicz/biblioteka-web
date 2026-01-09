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
    redirect("/api/auth/login");
  }

  if (user.role !== "ADMIN" && user.role !== "LIBRARIAN") {
    redirect("/");
  }

  return <AdminFinesClient user={user} />;
}
