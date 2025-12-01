"use client";

import clsx from "clsx";

export default function BorrowingsList({
  borrowings,
}: {
  borrowings: any[];
}) {
  function getStatusBadge(b: any) {
    const now = new Date();
    const due = new Date(b.dueDate);

    
    if (b.returnedDate) {
      return {
        text: "Zwrócona",
        class: "bg-gray-100 text-gray-700",
        dot: "bg-gray-700",
      };
    }

    if (now > due) {
      return {
        text: "Po terminie",
        class: "bg-red-100 text-red-700",
        dot: "bg-red-700",
      };
    }

    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 3) {
      return {
        text: "Termin wkrótce",
        class: "bg-yellow-100 text-yellow-700",
        dot: "bg-yellow-700",
      };
    }

    
    return {
      text: "Wypożyczona",
      class: "bg-green-100 text-green-700",
      dot: "bg-green-700",
    };
  }

  if (!borrowings || borrowings.length === 0) {
    return (
      <div className="mt-10 text-center text-gray-500 text-lg">
        Nie masz żadnych wypożyczeń.
      </div>
    );
  }
  
  return (
    <div className="grid gap-6 mt-8">
      {borrowings.map((b, i) => {
        const badge = getStatusBadge(b);

        return (
          <div
            key={b.id}
            className={clsx(
              "rounded-xl border bg-white p-4 shadow-sm animate-fade-in",
              { "[animation-delay:200ms]": i === 1 },
              { "[animation-delay:300ms]": i === 2 }
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

              {/* Okładka */}
              <div className="flex items-center gap-4 md:col-span-4">
                <img
                  src={b.coverUrl || "/biblio.png"}
                  alt={b.title}
                  className="size-16 rounded-lg object-cover"
                />
                <div>
                  <div className="font-bold text-gray-900">{b.title}</div>
                  <div className="text-sm text-gray-500">{b.author}</div>
                </div>
              </div>

              {/* Data wypożyczenia */}
              <div className="text-sm md:col-span-2">
                <div className="font-semibold">{b.borrowDate}</div>
                <div className="text-xs text-gray-500">Data wypożyczenia</div>
              </div>

              {/* Termin zwrotu */}
              <div className="text-sm md:col-span-2">
                <div className="font-semibold">{b.dueDate}</div>
                {b.returnedDate ? (
                  <div className="text-xs text-green-700">Zwrócono</div>
                ) : (
                  <div className="text-xs text-gray-500">Termin zwrotu</div>
                )}
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <span
                  className={clsx(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
                    badge.class
                  )}
                >
                  <span className={`size-2 rounded-full ${badge.dot}`}></span>
                  {badge.text}
                </span>
              </div>

              {/* Akcje */}
              <div className="md:col-span-2 text-right text-sm">
                {b.fine ? (
                  <div className="font-bold text-red-600">Kara: {b.fine} zł</div>
                ) : (
                  <div className="font-semibold">-</div>
                )}
                <a
                  href="#"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  Przedłuż
                </a>
              </div>

            </div>
          </div>
        );
      })}
    </div>
    
  );
}
