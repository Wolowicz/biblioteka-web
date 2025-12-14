"use client";

/**
 * =============================================================================
 * BOOK RATING COMPONENT - Dynamiczna średnia ocena książki
 * =============================================================================
 */

import { useEffect, useState } from "react";

interface BookRatingProps {
  bookId: number;
  isAdmin: boolean;
}

export default function BookRating({ bookId, isAdmin }: BookRatingProps) {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRating();
  }, [bookId]);

  const fetchRating = async () => {
    try {
      const res = await fetch(`/api/reviews?bookId=${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setAverageRating(data.averageRating?.average || 0);
        setReviewCount(data.averageRating?.count || 0);
      }
    } catch {
      console.error("Błąd ładowania oceny");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    return (
      <div className="flex text-amber-400 text-lg">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            return <i key={star} className="fas fa-star" aria-hidden="true"></i>;
          } else if (star === fullStars + 1 && hasHalfStar) {
            return <i key={star} className="fas fa-star-half-alt" aria-hidden="true"></i>;
          } else {
            return <i key={star} className="far fa-star" aria-hidden="true"></i>;
          }
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 mt-5">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="w-6 h-6 rounded-lg bg-amber-100 animate-pulse"></div>
          ))}
        </div>
        <span className={`text-sm ${isAdmin ? "text-slate-500" : "text-gray-400"}`}>
          Ładowanie ocen...
        </span>
      </div>
    );
  }

  if (reviewCount === 0) {
    return (
      <div className="flex flex-wrap items-center gap-3 mt-5">
        <div className="flex items-center gap-1 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
          {[1, 2, 3, 4, 5].map((star) => (
            <i key={star} className="far fa-star text-amber-300 text-lg" aria-hidden="true"></i>
          ))}
        </div>
        <span className="text-sm text-slate-500 flex items-center gap-1">
          <span>🆕</span> Bądź pierwszy i oceń tę książkę!
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mt-5">
      {/* Rating z gradientowym tłem */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg shadow-amber-500/10">
        {renderStars(averageRating)}
        <span className="font-black text-amber-600 text-lg ml-1">{averageRating.toFixed(1)}</span>
      </div>
      
      {/* Badge z liczbą ocen */}
      <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium flex items-center gap-1.5">
        <i className="far fa-comment-dots text-xs"></i>
        {reviewCount} {reviewCount === 1 ? "recenzja" : reviewCount < 5 ? "recenzje" : "recenzji"}
      </span>
      
      {/* Popularność */}
      {averageRating >= 4 && (
        <span className="px-3 py-1 rounded-full bg-linear-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-emerald-500/25">
          <span>🔥</span> Polecana!
        </span>
      )}
    </div>
  );
}
