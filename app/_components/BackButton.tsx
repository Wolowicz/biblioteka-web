"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { backUI, roleUI } from "@/lib/ui/theme";

export default function BackButton() {
  const router = useRouter();
  const { user } = useAuth();

  const role = user?.role || "USER";

  return (
    <button
      onClick={() => router.back()}
      className={`${backUI.base} ${roleUI[role].text}`}
    >
      ← Powrót
    </button>
  );
}
