/**
 * =============================================================================
 * BORROWINGS LIST - Lista wypożyczeń użytkownika
 * =============================================================================
 * 
 * Nowoczesny komponent wyświetlający listę wypożyczeń.
 * 
 * @packageDocumentation
 */

"use client";

import clsx from "clsx";
import type { BorrowingData, BorrowingsListProps, StatusBadge } from "@/domain/types";

const DAYS_UNTIL_WARNING = 3;
const DEFAULT_COVER = "/biblio.png";

function calculateStatusBadge(borrowing: BorrowingData): StatusBadge & { icon: string } {
  const now = new Date();
  const due = new Date(borrowing.dueDate);

  if (borrowing.returnedDate) {
    return {
      text: "Zwrócona",
      className: "bg-slate-100 text-slate-600 border border-slate-200",
      dotClassName: "bg-slate-500",
      icon: "fa-check-circle"
    };
  }

  if (now > due) {
    return {
      text: "Po terminie",
      className: "bg-red-50 text-red-600 border border-red-200",
      dotClassName: "bg-red-500",
      icon: "fa-exclamation-circle"
    };
  }

  const daysUntilDue = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilDue <= DAYS_UNTIL_WARNING) {
    return {
      text: "Termin wkrótce",
      className: "bg-amber-50 text-amber-600 border border-amber-200",
      dotClassName: "bg-amber-500",
      icon: "fa-clock"
    };
  }

  return {
    text: "Wypożyczona",
    className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    dotClassName: "bg-emerald-500",
    icon: "fa-book"
  };
}

function formatDisplayDate(dateString: string): string {
  return dateString;
}

export default function BorrowingsList({ borrowings }: BorrowingsListProps) {
  if (!borrowings || borrowings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <i className="fas fa-book-open text-3xl text-slate-400" aria-hidden="true"></i>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Brak wypożyczeń</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Nie masz jeszcze żadnych wypożyczeń. Przejdź do katalogu, aby wypożyczyć swoją pierwszą książkę.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          <i className="fas fa-search" aria-hidden="true"></i>
          Przeglądaj katalog
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {borrowings.map((borrowing, index) => {
        const badge = calculateStatusBadge(borrowing);
        const isOverdue = !borrowing.returnedDate && new Date() > new Date(borrowing.dueDate);

        return (
          <div
            key={borrowing.id}
            className={clsx(
              "group bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300",
              isOverdue ? "border-red-200" : "border-gray-200"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                {/* Okładka i informacje */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={borrowing.coverUrl || DEFAULT_COVER}
                      alt={`Okładka: ${borrowing.title}`}
                      className="w-16 h-20 rounded-xl object-cover shadow-md"
                    />
                    {isOverdue && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-exclamation text-white text-[10px]" aria-hidden="true"></i>
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {borrowing.title}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">{borrowing.author}</p>
                    <div className="mt-2">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        badge.className
                      )}>
                        <i className={`fas ${badge.icon} text-[10px]`} aria-hidden="true"></i>
                        {badge.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Daty */}
                <div className="flex items-center gap-6 lg:gap-8">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Wypożyczono</div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <i className="far fa-calendar-alt text-slate-400" aria-hidden="true"></i>
                      {formatDisplayDate(borrowing.borrowDate)}
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-gray-200"></div>
                  
                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      {borrowing.returnedDate ? "Zwrócono" : "Termin"}
                    </div>
                    <div className={clsx(
                      "flex items-center gap-2 text-sm font-medium",
                      borrowing.returnedDate ? "text-emerald-600" : isOverdue ? "text-red-600" : "text-slate-700"
                    )}>
                      <i className={clsx(
                        "far text-[12px]",
                        borrowing.returnedDate ? "fa-check-circle text-emerald-500" : "fa-calendar-alt",
                        isOverdue && !borrowing.returnedDate && "text-red-400"
                      )} aria-hidden="true"></i>
                      {formatDisplayDate(borrowing.returnedDate || borrowing.dueDate)}
                    </div>
                  </div>
                </div>

                {/* Akcje */}
                <div className="flex items-center gap-3 lg:border-l lg:border-gray-200 lg:pl-6">
                  {borrowing.fine ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">
                      <div className="text-xs text-red-500 mb-0.5">Kara</div>
                      <div className="text-lg font-bold text-red-600">{borrowing.fine} zł</div>
                    </div>
                  ) : null}
                  
                  {!borrowing.returnedDate && (
                    <button
                      className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                      onClick={() => alert("Funkcja przedłużenia w przygotowaniu")}
                    >
                      <i className="fas fa-clock" aria-hidden="true"></i>
                      Przedłuż
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
