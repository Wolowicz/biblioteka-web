/**
 * ADMIN REVIEWS PAGE - Moderacja Recenzji
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminReviewsClient from "./AdminReviewsClient";

export default async function AdminReviewsPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // LIBRARIAN ma własny panel recenzji
  if (user.role === "LIBRARIAN") {
    redirect("/librarian/reviews");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminReviewsClient user={user} />;
}
