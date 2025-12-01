// app/_components/BackButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { backUI } from "@/lib/ui/design";
import { useAuth } from "@/lib/hooks";   // żeby pobrać rolę użytkownika

export default function BackButton() {
  const router = useRouter();
  const { user } = useAuth();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push("/");
    } else {
      router.back();
    }
  };

  // wybór stylu zależnie od roli
  const cls =
    user?.role === "ADMIN" ? backUI.baseDark : backUI.base;

  return (
    <button onClick={handleClick} className={cls}>
      ← Powrót
    </button>
  );
}
