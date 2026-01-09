"use client";

import { useState, useEffect, useCallback } from "react";
import LibrarianLayout from "@/app/_components/LibrarianLayout";
import type { UserSession } from "@/domain/types";

interface Review {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  bookId: number;
  bookTitle: string;
  rating: number;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function LibrarianReviewsClient({ user }: { user: UserSession }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      let url = "/api/reviews?all=true";
      if (activeTab === "pending") url += "&status=OCZEKUJE";
      else if (activeTab === "approved") url += "&status=ZAAKCEPTOWANA";
      else if (activeTab === "rejected") url += "&status=ODRZUCONA";
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Błąd");
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch {
      console.error("Błąd ładowania recenzji");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (reviewId: number) => {
    setProcessingId(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ZAAKCEPTOWANA" }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Błąd akceptacji recenzji");
        return;
      }
      
      fetchReviews();
    } catch {
      alert("Błąd akceptacji recenzji");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reviewId: number) => {
    if (!confirm("Czy na pewno odrzucić tę recenzję?")) return;
    
    setProcessingId(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ODRZUCONA" }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Błąd odrzucania recenzji");
        return;
      }
      
      fetchReviews();
    } catch {
      alert("Błąd odrzucania recenzji");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Czy na pewno usunąć tę recenzję? Ta operacja jest nieodwracalna.")) return;
    
    setProcessingId(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Błąd usuwania recenzji");
        return;
      }
      
      fetchReviews();
    } catch {
      alert("Błąd usuwania recenzji");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ZAAKCEPTOWANA":
        return <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Zaakceptowana</span>;
      case "ODRZUCONA":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Odrzucona</span>;
      case "OCZEKUJE":
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Oczekuje</span>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star text-sm ${star <= rating ? "text-amber-400" : "text-gray-600"}`}
          ></i>
        ))}
      </div>
    );
  };

  const pendingCount = reviews.filter(r => r.status === "OCZEKUJE").length;

  return (
    <LibrarianLayout user={user}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <i className="fas fa-comments text-white"></i>
            </div>
            Moderacja recenzji
          </h2>
          <p className="text-gray-400 mt-1">Przeglądaj i akceptuj recenzje czytelników</p>
        </div>
        {activeTab === "pending" && pendingCount > 0 && (
          <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 flex items-center gap-2">
            <i className="fas fa-clock"></i>
            <span><strong>{pendingCount}</strong> recenzji oczekuje na moderację</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-[#2D2D35] p-1 rounded-lg border border-gray-700/50 w-fit mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "pending" ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <i className="fas fa-clock"></i>
          Oczekujące
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/30 text-amber-300">{pendingCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "approved" ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <i className="fas fa-check-circle mr-2"></i>Zaakceptowane
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "rejected" ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <i className="fas fa-times-circle mr-2"></i>Odrzucone
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "all" ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <i className="fas fa-list mr-2"></i>Wszystkie
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="bg-[#2D2D35] rounded-xl p-8 flex items-center justify-center border border-gray-700/50">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-12 text-center">
          <i className="fas fa-comments text-5xl text-gray-500 mb-4"></i>
          <h3 className="text-xl font-semibold text-white mb-2">Brak recenzji</h3>
          <p className="text-gray-400">
            {activeTab === "pending" 
              ? "Wszystkie recenzje zostały zmoderowane" 
              : "Nie znaleziono recenzji dla wybranych filtrów"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-5 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                        {review.userName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <span className="font-medium text-white">{review.userName}</span>
                        <span className="text-gray-500 text-sm ml-2">{review.userEmail}</span>
                      </div>
                    </div>
                    {getStatusBadge(review.status)}
                  </div>
                  
                  <div className="mb-3">
                    <a
                      href={`/books/${review.bookId}`}
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      <i className="fas fa-book mr-2"></i>
                      {review.bookTitle}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-gray-400 text-sm">
                      {new Date(review.createdAt).toLocaleDateString("pl-PL", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed">{review.content}</p>
                </div>
                
                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:w-32">
                  {review.status === "OCZEKUJE" && (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={processingId === review.id}
                        className="flex-1 lg:w-full px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 disabled:opacity-50 border border-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        {processingId === review.id ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <>
                            <i className="fas fa-check"></i>
                            <span className="hidden sm:inline">Akceptuj</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        disabled={processingId === review.id}
                        className="flex-1 lg:w-full px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 disabled:opacity-50 border border-red-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-times"></i>
                        <span className="hidden sm:inline">Odrzuć</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={processingId === review.id}
                    className="flex-1 lg:w-full px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 disabled:opacity-50 border border-gray-600/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-trash"></i>
                    <span className="hidden sm:inline">Usuń</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {!loading && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <i className="fas fa-clock text-amber-400"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{reviews.filter(r => r.status === "OCZEKUJE").length}</p>
                <p className="text-sm text-gray-400">Oczekujące</p>
              </div>
            </div>
          </div>
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <i className="fas fa-check-circle text-emerald-400"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{reviews.filter(r => r.status === "ZAAKCEPTOWANA").length}</p>
                <p className="text-sm text-gray-400">Zaakceptowane</p>
              </div>
            </div>
          </div>
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <i className="fas fa-times-circle text-red-400"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{reviews.filter(r => r.status === "ODRZUCONA").length}</p>
                <p className="text-sm text-gray-400">Odrzucone</p>
              </div>
            </div>
          </div>
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <i className="fas fa-star text-teal-400"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : "0.0"}
                </p>
                <p className="text-sm text-gray-400">Średnia ocena</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </LibrarianLayout>
  );
}
