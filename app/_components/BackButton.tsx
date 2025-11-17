"use client";

import { useRouter } from "next/navigation";

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
      className="mt-6 bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded"
    >
      ← Powrót
    </button>
  );
}
