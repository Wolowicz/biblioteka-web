/**
 * ADMIN AUDIT PAGE - Logi i Audyt
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminAuditClient from "./AdminAuditClient";

export default async function AdminAuditPage() {
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

  return <AdminAuditClient user={user} />;
}
