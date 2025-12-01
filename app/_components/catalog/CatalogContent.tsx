"use client";

import ClientFilter, { BookVM } from "../ClientFilter";
import { UserRole } from "@/lib/auth/index";

export default function CatalogContent({
  books,
  role,
}: {
  books: BookVM[];
  role: UserRole;
}) {
  const showReserveButton = role === "USER";

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-black">Katalog Książek</h2>
      <p className="text-gray-600 text-lg">
        Przeglądaj, wyszukuj i odkrywaj nowe tytuły w naszej kolekcji.
      </p>

      <ClientFilter
        books={books}
        showReserveButton={showReserveButton}
        role={role}
      />
    </div>
  );
}
