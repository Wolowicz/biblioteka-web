/**
 * ADMIN INVENTORY PAGE - Ewidencja Książek
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminInventoryClient from "./AdminInventoryClient";

export default async function AdminInventoryPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // LIBRARIAN ma własny panel ewidencji
  if (user.role === "LIBRARIAN") {
    redirect("/librarian/inventory");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminInventoryClient user={user} />;
}
