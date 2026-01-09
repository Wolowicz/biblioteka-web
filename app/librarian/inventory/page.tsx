/**
 * LIBRARIAN INVENTORY PAGE - Ewidencja książek
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import LibrarianInventoryClient from "./LibrarianInventoryClient";

export default async function LibrarianInventoryPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // ADMIN ma swój własny panel ewidencji
  if (user.role === "ADMIN") {
    redirect("/admin/inventory");
  }
  
  if (user.role !== "LIBRARIAN") {
    redirect("/");
  }

  return <LibrarianInventoryClient user={user} />;
}
