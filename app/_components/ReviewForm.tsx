"use client";

/**
 * =============================================================================
 * REVIEW FORM COMPONENT - Formularz dodawania recenzji z gwiazdkami
 * =============================================================================
 */

import { useState } from "react";

interface ReviewFormProps {
  bookId: number;
  isAdmin: boolean;
  onReviewAdded?: () => void;
}

export default function ReviewForm({ bookId, isAdmin, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Wybierz ocenę gwiazdkową");
      return;
    }

    // Content jest wymagany przez API i musi mieć min 10 znaków
    const content = reviewText.trim();
    if (content.length < 10) {
      setError("Recenzja musi mieć minimum 10 znaków");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          rating,
          content,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Nie udało się dodać recenzji");
      }

      setSubmitted(true);
      setRating(0);
      setReviewText("");
      
      // Powiadom rodzica o dodaniu recenzji
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`p-6 rounded-2xl border-2 mb-6 ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-linear-to-r from-emerald-50 to-teal-50 border-emerald-200"}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <span className="text-2xl">🎉</span>
          </div>
          <div>
            <p className={`font-bold text-lg ${isAdmin ? "text-white" : "text-emerald-700"}`}>Super! Dziękujemy za recenzję!</p>
            <p className={`text-sm ${isAdmin ? "text-slate-400" : "text-emerald-600"}`}>Twoja opinia pomoże innym czytelnikom</p>
          </div>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Dodaj kolejną recenzję
        </button>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl border-2 mb-6 transition-all duration-300 hover:shadow-lg ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-linear-to-br from-white to-amber-50/30 border-amber-100 hover:border-amber-200"}`}>
      <p className={`font-bold text-lg mb-4 flex items-center gap-2 ${isAdmin ? "text-white" : "text-slate-900"}`}>
        <span>✍️</span> Dodaj swoją recenzję
      </p>

      {/* Wybór gwiazdek - większe i bardziej interaktywne */}
      <div className="flex flex-wrap items-center gap-3 mb-5 p-4 rounded-xl bg-amber-50/50">
        <span className={`text-sm font-medium ${isAdmin ? "text-slate-400" : "text-amber-700"}`}>
          Twoja ocena:
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1.5 transition-all duration-200 hover:scale-125 focus:outline-none"
              aria-label={`Ocena ${star} gwiazdek`}
            >
              <i
                className={`text-3xl transition-all duration-200 ${
                  (hoverRating || rating) >= star
                    ? "fas fa-star text-amber-400 drop-shadow-lg"
                    : "far fa-star text-amber-200"
                }`}
                aria-hidden="true"
              ></i>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-linear-to-r from-amber-400 to-orange-500 text-white shadow-lg">
            {rating}/5 ⭐
          </span>
        )}
      </div>

      {/* Pole tekstowe - ładniejsze */}
      <div className="relative">
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className={`w-full p-4 rounded-xl border-2 h-28 text-sm transition-all outline-none resize-none
            ${isAdmin
              ? "bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500"
              : "border-amber-100 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 bg-white"
            }
          `}
          placeholder="💭 Napisz swoją opinię o tej książce (min. 10 znaków)..."
        />
        <span className={`absolute bottom-3 right-3 text-xs ${reviewText.length >= 10 ? "text-emerald-500" : "text-slate-400"}`}>
          {reviewText.length}/10+ znaków
        </span>
      </div>

      {/* Błąd */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
          <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
          {error}
        </div>
      )}

      {/* Przycisk wysyłania - gradientowy */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className={`mt-4 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]
          ${isSubmitting || rating === 0
            ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
            : "bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
          }
        `}
      >
        {isSubmitting ? (
          <>
            <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
            Wysyłanie...
          </>
        ) : (
          <>
            <i className="fas fa-paper-plane" aria-hidden="true"></i>
            Dodaj recenzję
            <span>🚀</span>
          </>
        )}
      </button>
    </div>
  );
}
