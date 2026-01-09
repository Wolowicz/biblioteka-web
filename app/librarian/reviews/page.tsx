/**
 * LIBRARIAN REVIEWS PAGE - Moderacja recenzji
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import LibrarianReviewsClient from "./LibrarianReviewsClient";

export default async function LibrarianReviewsPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // ADMIN ma swój własny panel recenzji
  if (user.role === "ADMIN") {
    redirect("/admin/reviews");
  }
  
  if (user.role !== "LIBRARIAN") {
    redirect("/");
  }

  return <LibrarianReviewsClient user={user} />;
}
