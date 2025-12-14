/**
 * =============================================================================
 * BORROWINGS CLIENT PAGE - Interaktywna strona wypożyczeń
 * =============================================================================
 * 
 * Nowoczesna strona z filtrami, animacjami i prawdziwymi funkcjami.
 * 
 * @packageDocumentation
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { BorrowingData, StatusBadge } from "@/domain/types";
import { useToast } from "@/app/_components/ui/Toast";
import { ConfirmModal } from "@/app/_components/ui/Modal";

// =============================================================================
// TYPY
// =============================================================================

interface BorrowingsClientProps {
  initialBorrowings: BorrowingData[];
}

type FilterTab = "all" | "active" | "history" | "overdue" | "withFines";

// =============================================================================
// STAŁE
// =============================================================================

const DAYS_UNTIL_WARNING = 3;
const DEFAULT_COVER = "/biblio.png";

// =============================================================================
// FUNKCJE POMOCNICZE
// =============================================================================

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

  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue <= DAYS_UNTIL_WARNING) {
    return {
      text: `Pozostało ${daysUntilDue} dni`,
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// =============================================================================
// KOMPONENT GŁÓWNY
// =============================================================================

export default function BorrowingsClient({ initialBorrowings }: BorrowingsClientProps) {
  const [borrowings, setBorrowings] = useState(initialBorrowings);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [extendingId, setExtendingId] = useState<number | null>(null);
  const [confirmExtend, setConfirmExtend] = useState<BorrowingData | null>(null);
  const toast = useToast();
  const router = useRouter();

  // Filtrowanie
  const filteredBorrowings = useMemo(() => {
    let result = borrowings;

    // Filtr zakładek
    if (activeTab === "active") {
      result = result.filter((b) => !b.returnedDate);
    } else if (activeTab === "history") {
      result = result.filter((b) => b.returnedDate);
    } else if (activeTab === "overdue") {
      result = result.filter((b) => !b.returnedDate && new Date(b.dueDate) < new Date());
    } else if (activeTab === "withFines") {
      result = result.filter((b) => (parseFloat(String(b.fine)) || 0) > 0);
    }

    // Wyszukiwanie
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query)
      );
    }

    return result;
  }, [borrowings, activeTab, searchQuery]);

  // Statystyki
  const stats = useMemo(() => ({
    all: borrowings.length,
    active: borrowings.filter((b) => !b.returnedDate).length,
    returned: borrowings.filter((b) => b.returnedDate).length,
    overdue: borrowings.filter(
      (b) => !b.returnedDate && new Date(b.dueDate) < new Date()
    ).length,
    withFines: borrowings.filter((b) => (parseFloat(String(b.fine)) || 0) > 0).length,
    totalFines: borrowings.reduce((sum, b) => sum + (parseFloat(String(b.fine)) || 0), 0),
  }), [borrowings]);

  // Przedłużanie wypożyczenia
  const handleExtend = useCallback(async (borrowing: BorrowingData) => {
    setExtendingId(borrowing.id);
    try {
      const res = await fetch(`/api/borrowings/${borrowing.id}/extend`, {
        method: "PUT",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        // Zaktualizuj lokalny stan
        setBorrowings((prev) =>
          prev.map((b) =>
            b.id === borrowing.id
              ? { ...b, dueDate: data.newDueDate }
              : b
          )
        );
        toast.success(
          "Wypożyczenie przedłużone!",
          `Nowy termin: ${formatDate(data.newDueDate)}`
        );
      } else {
        toast.error("Nie można przedłużyć", data.error);
      }
    } catch (error) {
      toast.error("Błąd połączenia", "Spróbuj ponownie później");
    } finally {
      setExtendingId(null);
      setConfirmExtend(null);
    }
  }, [toast]);

  // Komponenty zakładek
  const tabs = [
    { id: "all" as const, label: "Wszystkie", count: stats.all, icon: "fa-layer-group" },
    { id: "active" as const, label: "Aktualne", count: stats.active, icon: "fa-clock" },
    { id: "history" as const, label: "Historia", count: stats.returned, icon: "fa-history" },
    { id: "overdue" as const, label: "Po terminie", count: stats.overdue, icon: "fa-exclamation-triangle" },
  ];

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* STATYSTYKI */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-children">
        <StatCard
          icon="fa-book"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          value={stats.all}
          label="Wszystkich"
          onClick={() => setActiveTab("all")}
          isActive={activeTab === "all"}
        />
        <StatCard
          icon="fa-clock"
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          value={stats.active}
          label="Aktywnych"
          onClick={() => setActiveTab("active")}
          isActive={activeTab === "active"}
        />
        <StatCard
          icon="fa-check-circle"
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          value={stats.returned}
          label="Zwróconych"
          onClick={() => setActiveTab("history")}
          isActive={activeTab === "history"}
        />
        <StatCard
          icon="fa-exclamation-triangle"
          iconBg="bg-red-100"
          iconColor="text-red-600"
          value={stats.overdue}
          label="Po terminie"
          highlight={stats.overdue > 0}
          onClick={() => setActiveTab("overdue")}
          isActive={activeTab === "overdue"}
        />
        <StatCard
          icon="fa-coins"
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          value={`${(parseFloat(String(stats.totalFines)) || 0).toFixed(2)} zł`}
          label="Suma kar"
          highlight={parseFloat(String(stats.totalFines)) > 0}
          onClick={() => setActiveTab("withFines")}
          isActive={activeTab === "withFines"}
        />
      </div>

      {/* ================================================================ */}
      {/* TOOLBAR */}
      {/* ================================================================ */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Zakładki */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:bg-gray-100"
              )}
            >
              <i className={`fas ${tab.icon} text-xs`} aria-hidden="true"></i>
              {tab.label}
              <span className={clsx(
                "px-1.5 py-0.5 rounded-full text-xs",
                activeTab === tab.id
                  ? "bg-white/20"
                  : "bg-gray-200"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Wyszukiwarka */}
        <div className="relative w-full sm:w-auto">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Szukaj książki..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full sm:w-64 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* LISTA WYPOŻYCZEŃ */}
      {/* ================================================================ */}
      {filteredBorrowings.length === 0 ? (
        <EmptyState searchQuery={searchQuery} activeTab={activeTab} />
      ) : (
        <div className="space-y-3 stagger-children">
          {filteredBorrowings.map((borrowing) => (
            <BorrowingCard
              key={borrowing.id}
              borrowing={borrowing}
              onExtend={() => setConfirmExtend(borrowing)}
              onViewBook={() => router.push(`/books/${borrowing.bookId}`)}
              isExtending={extendingId === borrowing.id}
            />
          ))}
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL POTWIERDZENIA */}
      {/* ================================================================ */}
      <ConfirmModal
        isOpen={!!confirmExtend}
        onClose={() => setConfirmExtend(null)}
        onConfirm={() => confirmExtend && handleExtend(confirmExtend)}
        title="Przedłuż wypożyczenie"
        message={`Czy na pewno chcesz przedłużyć wypożyczenie "${confirmExtend?.title}" o 14 dni?`}
        confirmText="Przedłuż"
        variant="info"
        isLoading={!!extendingId}
      />
    </div>
  );
}

// =============================================================================
// KOMPONENTY POMOCNICZE
// =============================================================================

function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  highlight = false,
  onClick,
  isActive = false,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: number | string;
  label: string;
  highlight?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}) {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "bg-white p-4 rounded-xl border shadow-sm card-hover transition-all",
        highlight ? "border-red-200 bg-red-50/50" : "border-gray-200",
        onClick && "cursor-pointer hover:shadow-md hover:border-blue-300",
        isActive && "ring-2 ring-blue-500 border-blue-500"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={clsx("p-2.5 rounded-xl", iconBg)}>
          <i className={clsx("fas", icon, iconColor)} aria-hidden="true"></i>
        </div>
        <div>
          <p className={clsx(
            "text-2xl font-bold",
            highlight ? "text-red-600" : "text-slate-900"
          )}>
            {value}
          </p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function BorrowingCard({
  borrowing,
  onExtend,
  onViewBook,
  isExtending,
}: {
  borrowing: BorrowingData;
  onExtend: () => void;
  onViewBook: () => void;
  isExtending: boolean;
}) {
  const badge = calculateStatusBadge(borrowing);
  const isOverdue = !borrowing.returnedDate && new Date() > new Date(borrowing.dueDate);
  const daysLeft = Math.ceil(
    (new Date(borrowing.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={clsx(
        "group bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 card-hover overflow-hidden",
        isOverdue ? "border-red-200" : "border-gray-200"
      )}
    >
      {/* Progress bar dla aktywnych */}
      {!borrowing.returnedDate && !isOverdue && (
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, (14 - daysLeft) / 14 * 100))}%` }}
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Okładka i informacje - klikalne */}
          <div 
            onClick={onViewBook}
            className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
          >
            <div className="relative shrink-0">
              <img
                src={borrowing.coverUrl || DEFAULT_COVER}
                alt={`Okładka: ${borrowing.title}`}
                className="w-16 h-20 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow"
              />
              {isOverdue && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <i className="fas fa-exclamation text-white text-xs" aria-hidden="true"></i>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {borrowing.title}
              </h3>
              <p className="text-sm text-slate-500 truncate">{borrowing.author}</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={clsx(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-transform hover:scale-105",
                  badge.className
                )}>
                  <i className={`fas ${badge.icon} text-[10px]`} aria-hidden="true"></i>
                  {badge.text}
                </span>
                {borrowing.fine > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                    <i className="fas fa-coins text-[10px]" aria-hidden="true"></i>
                    {borrowing.fine} zł kary
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Daty */}
          <div className="flex items-center gap-6 lg:gap-8 text-sm">
            <div className="text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1 font-medium">
                Wypożyczono
              </div>
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <i className="far fa-calendar-alt text-slate-400" aria-hidden="true"></i>
                {formatDate(borrowing.borrowDate)}
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-gray-200"></div>

            <div className="text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1 font-medium">
                {borrowing.returnedDate ? "Zwrócono" : "Termin"}
              </div>
              <div className={clsx(
                "flex items-center gap-2 font-semibold",
                borrowing.returnedDate 
                  ? "text-emerald-600" 
                  : isOverdue 
                    ? "text-red-600" 
                    : "text-slate-700"
              )}>
                <i className={clsx(
                  "far text-xs",
                  borrowing.returnedDate 
                    ? "fa-check-circle text-emerald-500" 
                    : isOverdue 
                      ? "fa-calendar-times text-red-400" 
                      : "fa-calendar-alt"
                )} aria-hidden="true"></i>
                {formatDate(borrowing.returnedDate || borrowing.dueDate)}
              </div>
            </div>
          </div>

          {/* Akcje */}
          <div className="flex items-center gap-3 lg:border-l lg:border-gray-200 lg:pl-6">
            {!borrowing.returnedDate && (
              <button
                onClick={onExtend}
                disabled={isExtending || isOverdue}
                className={clsx(
                  "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 btn-interactive",
                  isOverdue
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg"
                )}
              >
                {isExtending ? (
                  <i className="fas fa-spinner animate-spin" aria-hidden="true"></i>
                ) : (
                  <i className="fas fa-clock" aria-hidden="true"></i>
                )}
                {isExtending ? "Przedłużam..." : "Przedłuż"}
              </button>
            )}
            {borrowing.returnedDate && (
              <div className="text-center px-4">
                <i className="fas fa-check-circle text-2xl text-emerald-500 mb-1" aria-hidden="true"></i>
                <p className="text-xs text-slate-500">Zwrócono</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ searchQuery, activeTab }: { searchQuery: string; activeTab: FilterTab }) {
  if (searchQuery) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <i className="fas fa-search text-3xl text-slate-400" aria-hidden="true"></i>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Brak wyników
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Nie znaleziono wypożyczeń pasujących do &ldquo;{searchQuery}&rdquo;
        </p>
      </div>
    );
  }

  const messages = {
    all: {
      title: "Brak wypożyczeń",
      description: "Nie masz jeszcze żadnych wypożyczeń. Przejdź do katalogu, aby wypożyczyć swoją pierwszą książkę.",
    },
    active: {
      title: "Brak aktywnych wypożyczeń",
      description: "Wszystkie twoje książki zostały zwrócone. Sprawdź katalog, aby znaleźć coś nowego!",
    },
    history: {
      title: "Brak historii",
      description: "Nie masz jeszcze żadnych zwróconych książek w historii.",
    },
    overdue: {
      title: "Brak zaległych wypożyczeń",
      description: "Świetnie! Nie masz żadnych książek po terminie zwrotu.",
    },
    withFines: {
      title: "Brak kar",
      description: "Świetnie! Nie masz żadnych wypożyczeń z naliczonymi karami.",
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center animate-fade-in">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
        <i className="fas fa-book-open text-3xl text-slate-400" aria-hidden="true"></i>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {messages[activeTab].title}
      </h3>
      <p className="text-slate-500 max-w-md mx-auto">
        {messages[activeTab].description}
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all btn-interactive"
      >
        <i className="fas fa-search" aria-hidden="true"></i>
        Przeglądaj katalog
      </a>
    </div>
  );
}
