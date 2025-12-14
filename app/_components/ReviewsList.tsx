"use client";

/**
 * =============================================================================
 * REVIEWS LIST COMPONENT - Lista recenzji książki
 * =============================================================================
 */

import { useEffect, useState } from "react";

interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reported?: boolean;
}

interface ReviewsListProps {
  bookId: number;
  isAdmin: boolean;
  currentUserId?: number;
}

export default function ReviewsList({ bookId, isAdmin, currentUserId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportedIds, setReportedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?bookId=${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating?.average || 0);
      }
    } catch {
      console.error("Błąd ładowania recenzji");
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (reviewId: number) => {
    if (reportReason.length < 5) {
      alert("Powód zgłoszenia musi mieć minimum 5 znaków");
      return;
    }

    setSubmittingReport(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report", reportReason }),
      });

      if (res.ok) {
        setReportedIds(prev => new Set([...prev, reviewId]));
        setReportingId(null);
        setReportReason("");
      } else {
        const data = await res.json();
        alert(data.error || "Błąd zgłaszania recenzji");
      }
    } catch {
      alert("Błąd połączenia");
    } finally {
      setSubmittingReport(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`${rating >= star ? "fas fa-star text-amber-400" : "far fa-star text-gray-300"} text-sm`}
            aria-hidden="true"
          ></i>
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-pulse">
            <i className="fas fa-spinner fa-spin text-white text-xl" aria-hidden="true"></i>
          </div>
          <span className="text-slate-400 text-sm">Ładowanie recenzji...</span>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4">
          <span className="text-4xl">💭</span>
        </div>
        <p className={`font-bold text-lg ${isAdmin ? "text-white" : "text-slate-800"}`}>Brak recenzji</p>
        <p className={`text-sm mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Bądź pierwszy i podziel się swoją opinią! 🚀</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Podsumowanie - stylowe */}
      <div className={`relative p-5 rounded-2xl overflow-hidden ${isAdmin ? "bg-slate-800/50" : "bg-linear-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-100"}`}>
        {/* Dekoracja */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative flex items-center gap-6">
          <div className="text-center">
            <div className={`text-5xl font-black ${isAdmin ? "text-white" : "bg-linear-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent"}`}>
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center text-amber-400 text-xl mt-2 gap-0.5">
              {renderStars(Math.round(averageRating))}
            </div>
          </div>
          <div className={`h-16 w-px ${isAdmin ? "bg-slate-700" : "bg-amber-200"}`}></div>
          <div>
            <p className={`font-bold ${isAdmin ? "text-white" : "text-slate-800"}`}>
              {reviews.length} {reviews.length === 1 ? "recenzja" : reviews.length < 5 ? "recenzje" : "recenzji"}
            </p>
            <p className={`text-sm ${isAdmin ? "text-slate-400" : "text-amber-600"}`}>
              od naszych czytelników ❤️
            </p>
          </div>
        </div>
      </div>

      {/* Lista recenzji - młodzieżowa */}
      {reviews.map((review, index) => {
        const isOwnReview = currentUserId === review.userId;
        const isReported = reportedIds.has(review.id) || review.reported;
        
        // Losowe kolory dla avatarów
        const avatarColors = [
          "from-indigo-400 to-purple-500",
          "from-pink-400 to-rose-500",
          "from-emerald-400 to-teal-500",
          "from-amber-400 to-orange-500",
          "from-cyan-400 to-blue-500"
        ];
        const avatarColor = avatarColors[index % avatarColors.length];

        return (
          <div
            key={review.id}
            className={`group p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${isAdmin ? "bg-slate-800/30 border-slate-700 hover:border-slate-600" : "bg-white border-gray-100 hover:border-indigo-200 hover:shadow-indigo-500/5"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${avatarColor} flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={`font-bold ${isAdmin ? "text-white" : "text-slate-900"}`}>
                    {review.userName}
                    {isOwnReview && <span className="ml-2 text-xs text-indigo-500">(Ty)</span>}
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${isAdmin ? "text-slate-500" : "text-gray-400"}`}>
                    <i className="far fa-calendar-alt"></i>
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Rating badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                  <span className="text-amber-500 font-bold text-sm">{review.rating}</span>
                  <i className="fas fa-star text-amber-400 text-xs"></i>
                </div>
                
                {/* Przycisk zgłoszenia */}
                {currentUserId && !isOwnReview && !isReported && (
                  <button
                    onClick={() => setReportingId(reportingId === review.id ? null : review.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    title="Zgłoś recenzję"
                  >
                    <i className="fas fa-flag text-sm" aria-hidden="true"></i>
                  </button>
                )}
                {isReported && (
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 font-medium">
                    ⚠️ Zgłoszona
                  </span>
                )}
              </div>
            </div>

            {review.comment && (
              <div className={`mt-3 p-4 rounded-xl ${isAdmin ? "bg-slate-900/30" : "bg-slate-50"}`}>
                <p className={`text-sm leading-relaxed ${isAdmin ? "text-slate-300" : "text-gray-700"}`}>
                  "{review.comment}"
                </p>
              </div>
            )}

            {/* Formularz zgłoszenia */}
            {reportingId === review.id && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200">
                <p className="text-sm font-bold mb-2 text-rose-700 flex items-center gap-2">
                  <i className="fas fa-flag"></i>
                  Zgłoś tę recenzję
                </p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Podaj powód zgłoszenia (min. 5 znaków)..."
                  className="w-full p-3 text-sm rounded-xl border-2 border-rose-200 focus:border-rose-400 outline-none resize-none bg-white"
                  rows={2}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleReport(review.id)}
                    disabled={submittingReport || reportReason.length < 5}
                    className="px-4 py-2 text-sm font-bold bg-linear-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submittingReport ? "Wysyłanie..." : "🚨 Wyślij zgłoszenie"}
                  </button>
                  <button
                    onClick={() => {
                      setReportingId(null);
                      setReportReason("");
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
