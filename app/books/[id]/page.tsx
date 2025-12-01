// app/books/[id]/page.tsx
import BackButton from "../../_components/BackButton";
import ReserveButton from "../../_components/ReserveButton";
import { roleUI, panelUI } from "@/lib/ui/theme";
import { getUserSessionSSR } from "@/lib/auth/server";
import { headers } from "next/headers";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;   // ⬅️ ważne
  const bookId = Number(id);


  // Pobieramy usera (SSR)
  const user = await getUserSessionSSR();

  // Pobieramy książkę z API
  const h = await headers();
  const host = h.get("host")!;
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/books/${bookId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="p-6">
        <BackButton />
        <p className="mt-6 text-red-600 text-lg font-semibold">
          Nie znaleziono książki.
        </p>
      </div>
    );
  }

  const book = await res.json();

  const role = user?.role ?? "USER";
  const P = panelUI[role];

  return (
    <div className={roleUI[role].background + " p-6"}>
      <BackButton />

      <div className="max-w-3xl mx-auto mt-8 space-y-6">

        {/* KARTA KSIĄŻKI – nowy design */}
        <div className={P.card}>
          <h1 className={P.header}>{book.title}</h1>

          <p className={P.subheader}>Autor: {book.authors}</p>

          <div className="mt-4 space-y-2">
            <p className={P.label}>
              Status:{" "}
              <span className={P.value}>
                {book.available ? "Dostępna" : "Niedostępna"}
              </span>
            </p>

            <p className={P.label}>
              ISBN: <span className={P.value}>{book.isbn}</span>
            </p>

            <p className={P.label}>
              Rok wydania: <span className={P.value}>{book.year}</span>
            </p>
          </div>

          {/* Przycisk rezerwacji */}
          <div className="mt-6">
            <ReserveButton
              bookId={book.id}
              available={book.available}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
