"use client";

/**
 * =============================================================================
 * REVIEWS SECTION - Sekcja recenzji z formularzem i listą
 * =============================================================================
 */

import { useState, useCallback } from "react";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";

interface ReviewsSectionProps {
  bookId: number;
  isAdmin: boolean;
  currentUserId?: number;
}

export default function ReviewsSection({ bookId, isAdmin, currentUserId }: ReviewsSectionProps) {
  // Klucz do wymuszenia odświeżenia listy
  const [refreshKey, setRefreshKey] = useState(0);

  // Callback wywoływany po dodaniu recenzji
  const handleReviewAdded = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="relative">
      {/* Dekoracyjne tło */}
      <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full bg-linear-to-b from-amber-400 via-orange-500 to-rose-500"></div>
      
      <div className="pl-6">
        <h3 className={`text-xl font-black mb-6 flex items-center gap-3 ${isAdmin ? "text-white" : "text-slate-900"}`}>
          <span className="text-2xl">💬</span>
          <span>Recenzje czytelników</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-linear-to-r from-amber-400 to-orange-500 text-white">
            HOT
          </span>
        </h3>

        {/* Formularz recenzji */}
        <ReviewForm bookId={bookId} isAdmin={isAdmin} onReviewAdded={handleReviewAdded} />

        {/* Lista recenzji - klucz wymusza ponowne renderowanie */}
        <ReviewsList key={refreshKey} bookId={bookId} isAdmin={isAdmin} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
