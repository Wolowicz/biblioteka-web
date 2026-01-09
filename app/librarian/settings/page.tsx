/**
 * LIBRARIAN SETTINGS PAGE - Ustawienia konta bibliotekarza
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import LibrarianSettingsClient from "./LibrarianSettingsClient";

export default async function LibrarianSettingsPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // ADMIN ma swój własny panel ustawień
  if (user.role === "ADMIN") {
    redirect("/admin/settings");
  }
  
  if (user.role !== "LIBRARIAN") {
    redirect("/");
  }

  return <LibrarianSettingsClient user={user} />;
}
