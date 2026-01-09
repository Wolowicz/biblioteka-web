/**
 * ADMIN AUDIT PAGE - Logi i Audyt
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminAuditClient from "./AdminAuditClient";

export default async function AdminAuditPage() {
  const user = await getUserSessionSSR();
  
  if (!user || user.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }

  return <AdminAuditClient user={user} />;
}
