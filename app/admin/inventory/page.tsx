/**
 * ADMIN INVENTORY PAGE - Ewidencja Książek
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminInventoryClient from "./AdminInventoryClient";

export default async function AdminInventoryPage() {
  const user = await getUserSessionSSR();
  
  if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
    redirect("/admin/dashboard");
  }

  return <AdminInventoryClient user={user} />;
}
