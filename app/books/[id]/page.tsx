import BackButton from "../../_components/BackButton";
import ReserveButton from "../../_components/ReserveButton";
import { roleUI } from "@/lib/ui/theme";
import { getUserSessionSSR } from "@/lib/auth/server";
import { headers } from "next/headers";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 14 – params jest Promisem
  const { id } = await params;

  const bookId = Number(id);

  if (!Number.isFinite(bookId)) {
    return <div className="p-6">Niepoprawne ID.</div>;
  }

  const user = await getUserSessionSSR();

  // Absolutny URL jest wymagany w SSR w Next.js 14
  const h = await headers();
  const host = h.get("host");

  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

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
  const isLogged = !!user;

  return (
    <div className={`${roleUI[role].background} p-6`}>
      <BackButton />

      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* OKŁADKA */}
        <div className="flex justify-center">
          <div className="rounded-2xl overflow-hidden shadow-lg w-80 h-[420px] bg-gray-100 flex items-center justify-center">
            <img
  src={book.coverUrl || "/biblio.png"}
  alt={book.title}
  className="object-cover w-full h-full transition-transform group-hover:scale-105"
/>

          </div>
        </div>

        {/* PRAWA STRONA */}
        <div className="lg:col-span-2 space-y-8">

          {/* Tytuł */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-xl mt-1 text-blue-800 font-medium">{book.authors}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-yellow-400 text-lg">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="far fa-star"></i>
              </div>
              <span className="text-gray-600 text-sm">(4.7 / 1283 ocen)</span>
            </div>
          </div>

          {/* Informacje o książce */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informacje o książce
            </h3>

            <div className="grid grid-cols-2 gap-y-2 text-gray-700">
              <p>Kategoria:</p><span className="font-medium">Fantastyka</span>
              <p>Rok wydania:</p><span className="font-medium">{book.year}</span>
              <p>Wydawnictwo:</p><span className="font-medium">{book.publisher}</span>
              <p>Liczba stron:</p><span className="font-medium">288</span>
              <p>ISBN:</p><span className="font-medium">{book.isbn}</span>
            </div>
          </div>

          {/* STATUS BOX */}
<div
  className={`
    rounded-2xl p-5 flex justify-between items-center border
    ${
      book.available
        ? "bg-green-100 border-green-300"
        : "bg-red-100 border-red-300"
    }
  `}
>
  <div>
    <p
      className={`
        font-semibold text-lg
        ${book.available ? "text-green-900" : "text-red-900"}
      `}
    >
      {book.available ? "Dostępna" : "Niedostępna"}
    </p>

    <p
      className={`
        text-sm
        ${book.available ? "text-green-700" : "text-red-700"}
      `}
    >
      {book.available
        ? "Możesz ją wypożyczyć od zaraz!"
        : "Aktualnie brak egzemplarzy"}
    </p>
  </div>

  <ReserveButton bookId={book.id} available={book.available} />
</div>


          {/* Opis */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Opis książki</h3>
            <p className="leading-relaxed text-gray-700">
              Do zrobienia: dodać prawdziwy opis książki pobrany z API. 
              Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
            </p>

            <div className="flex gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                Fantastyka
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                Przygoda
              </span>
            </div>
          </div>

          {/* Pliki */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Pliki do pobrania</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white shadow-sm border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <i className="fas fa-file-pdf text-red-500 text-2xl"></i>
                  <div>
                    <p className="font-semibold text-gray-900">Fragment – Rozdział 1.pdf</p>
                    <p className="text-xs text-gray-500">2.4 MB</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                  Podgląd
                </button>
              </div>
            </div>
          </div>

          {/* Recenzje */}
          <div className="pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recenzje</h3>

            <div className="bg-white p-5 rounded-2xl shadow-sm border mb-6">
              <p className="font-semibold text-gray-800 mb-2">Dodaj swoją recenzję</p>
              <textarea className="w-full border rounded-xl p-3 h-28" />
              <button className="mt-3 px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                Dodaj recenzję
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
