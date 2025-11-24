"use client";

import ClientFilter, { BookVM } from "../ClientFilter";
import { UserRole } from "@/lib/auth-client";

export default function CatalogContent({
  books,
  role,
}: {
  books: BookVM[];
  role: UserRole;
}) {
  const showReserveButton = role === "USER";

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Katalog Książek</h2>

      <ClientFilter
        books={books}
        showReserveButton={showReserveButton}
        role={role}          // <<< NAJWAŻNIEJSZE
      />
    </div>
  );
}
