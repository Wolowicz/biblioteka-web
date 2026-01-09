/**
 * ADMIN REVIEWS PAGE - Moderacja Recenzji
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminReviewsClient from "./AdminReviewsClient";

export default async function AdminReviewsPage() {
  const user = await getUserSessionSSR();
  
  if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
    redirect("/admin/dashboard");
  }

  return <AdminReviewsClient user={user} />;
}
