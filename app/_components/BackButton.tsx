// app/_components/BackButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { backButtonStyles } from "@/lib/ui/styles"; // ⬅️ NOWY IMPORT

export default function BackButton() {
  const router = useRouter();

  const handleClick = () => {
    // jeśli nie ma historii (wejście z linka), przejdź do katalogu
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push("/");
    } else {
      router.back();
    }
  };
//„Jeśli użytkownik wszedł na stronę z listy książek – wróć do listy.
//Jeśli wszedł bezpośrednio z linka i nie ma historii – przenieś go na /.”

  return (
    <button
      onClick={handleClick}
      className={backButtonStyles.base} 
    >
      ← Powrót
    </button>
  );
}