// app/books/[id]/page.tsx
import { headers } from "next/headers"; //importuję funkcję headers – pozwala odczytać nagłówki żądania HTTP po stronie serwera (np. host).
import BackButton from "../../_components/BackButton";
import ReserveButton from "../../_components/ReserveButton";
import { bookDetailsStyles } from "@/lib/ui/styles"; // ⬅️ NOWY IMPORT

//Tworzę typ (interfejs) opisujący dane jednej książki, jakie dostaję z API.
//? oznacza, że pole jest opcjonalne.
// | null – może być null, jeśli w bazie pole jest puste.

type BookDetails = {
  id: number;
  title: string;
  authors: string;
  isbn?: string | null;
  publisher?: string | null;
  year?: number | null;
  available: boolean;
};


export default async function BookPage(
  props: { params: Promise<{ id: string }> } //W tym miejscu params są zwracane jako obiekt typu Promise. Oznacza to, że wartości parametrów URL nie są dostępne natychmiast — są przygotowywane asynchronicznie przez Next.js. Aby je wykorzystać, muszę je najpierw „odpakować”, czyli użyć await props.params. Po odczekaniu otrzymuję zwykły obiekt { id: string }.
) {
  const { id } = await props.params;          // ⬅ await na params
  const numericId = Number(id); //Wyciągam id z URL (/books/3 → id = "3"). Konwertuję je na liczbę.

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return <main className="p-6">Nieprawidłowy adres (brak ID).</main>;
  }

  const h = await headers();                  // ⬅ headers też jest Promise
  const host = h.get("host") ?? "localhost";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/api/books/${numericId}`; //Składam pełny URL do API pojedynczej książki 

  const res = await fetch(url, { cache: "no-store" }); //cache: "no-store" – zawsze pobieraj świeże dane, nic nie cache’uj.

  if (!res.ok) {
    return <main className="p-6">Nie znaleziono książki.</main>;
  }

  const b: BookDetails = await res.json();

  return (
    <main className={bookDetailsStyles.mainWrapper}> 
      <h1 className={bookDetailsStyles.title}>{b.title}</h1> 
      <p className={bookDetailsStyles.authors}>{b.authors}</p> 

      <div className={bookDetailsStyles.detailsWrapper}> 
        {b.isbn && <p>ISBN: {b.isbn}</p>}
        {b.publisher && <p>Wydawnictwo: {b.publisher}</p>}
        {b.year && <p>Rok wydania: {b.year}</p>}
        <p>
          Status:{" "}
          <span className={bookDetailsStyles.statusBadge}> 
            {b.available ? "Dostępna" : "Niedostępna"}
          </span>
        </p>
      </div>

      <ReserveButton bookId={numericId} available={b.available} />
      <BackButton />
    </main>
  );
}