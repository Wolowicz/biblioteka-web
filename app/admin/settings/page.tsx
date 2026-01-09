/**
 * ADMIN SETTINGS PAGE - Ustawienia Konta Admina
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/app/_components/AdminLayout";

import AdminSettingsClient from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const user = await getUserSessionSSR();
  
  if (!user) {
    redirect("/welcome");
  }

  // LIBRARIAN ma własny panel ustawień
  if (user.role === "LIBRARIAN") {
    redirect("/librarian/settings");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminSettingsClient user={user} />;
}
