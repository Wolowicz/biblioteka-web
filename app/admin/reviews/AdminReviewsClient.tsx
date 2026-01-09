"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/app/_components/AdminLayout";
import type { UserSession } from "@/domain/types";

interface Review {
  id: number;
  bookId: number;
  bookTitle: string;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  status: "Oczekuje" | "Zatwierdzona" | "Odrzucona";
  reported: number;
  reportReason: string | null;
  createdAt: string;
}

export default function AdminReviewsClient({ user }: { user: UserSession }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"Oczekuje" | "all">("Oczekuje");
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  async function fetchReviews() {
    try {
      setLoading(true);
      const response = await fetch("/api/reviews?all=true");
      const data = await response.json();
      
      let filtered = data.reviews || [];
      if (statusFilter !== "all") {
        filtered = filtered.filter((r: Review) => r.status === statusFilter);
      }
      
      setReviews(filtered);
    } catch (error) {
      console.error("Błąd pobierania recenzji:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleModerate(reviewId: number, newStatus: "Zatwierdzona" | "Odrzucona") {
    if (processing) return;

    try {
      setProcessing(reviewId);
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateStatus",
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchReviews(); // Refresh list
      } else {
        const data = await response.json();
        alert(data.error || "Błąd moderacji recenzji");
      }
    } catch (error) {
      console.error("Błąd moderacji:", error);
      alert("Wystąpił błąd podczas moderacji");
    } finally {
      setProcessing(null);
    }
  }

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? "text-yellow-400" : "text-gray-600"}`}
            aria-hidden="true"
          ></i>
        ))}
      </div>
    );
  }

  function getStatusBadge(status: string) {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      Oczekuje: { bg: "bg-yellow-500/20", text: "text-yellow-300", label: "Oczekuje" },
      Zatwierdzona: { bg: "bg-green-500/20", text: "text-green-300", label: "Zatwierdzona" },
      Odrzucona: { bg: "bg-red-500/20", text: "text-red-300", label: "Odrzucona" },
    };

    const s = statusMap[status] || statusMap.Oczekuje;
    return <span className={`px-3 py-1 text-xs font-medium rounded-full ${s.bg} ${s.text}`}>{s.label}</span>;
  }

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-linear-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Moderacja Recenzji
        </h1>
        <p className="text-gray-400">Przeglądaj i moderuj recenzje użytkowników</p>
      </div>

      {/* Filtry */}
      <div className="bg-[#141414] rounded-xl p-6 border border-white/5 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-400">Status:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("Oczekuje")}
              className={`px-4 py-2 rounded-lg transition-all ${
                statusFilter === "Oczekuje"
                  ? "bg-purple-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Oczekujące
            </button>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg transition-all ${
                statusFilter === "all"
                  ? "bg-purple-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Wszystkie
            </button>
          </div>
        </div>
      </div>

      {/* Lista recenzji */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-gray-400 mt-4">Ładowanie recenzji...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-[#141414] rounded-xl p-12 border border-white/5 text-center">
          <i className="fas fa-inbox text-4xl text-gray-600 mb-4" aria-hidden="true"></i>
          <p className="text-gray-400">Brak recenzji do wyświetlenia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#141414] rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{review.bookTitle}</h3>
                    {getStatusBadge(review.status)}
                    {review.reported === 1 && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-300">
                        <i className="fas fa-flag mr-1" aria-hidden="true"></i>
                        Zgłoszona
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>
                      <i className="fas fa-user mr-2" aria-hidden="true"></i>
                      {review.userName}
                    </span>
                    <span>
                      <i className="fas fa-calendar mr-2" aria-hidden="true"></i>
                      {new Date(review.createdAt).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              <div className="bg-[#0A0A0A] rounded-lg p-4 mb-4 border border-white/5">
                <p className="text-gray-300 leading-relaxed">{review.comment}</p>
              </div>

              {review.reportReason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-300">
                    <i className="fas fa-exclamation-triangle mr-2" aria-hidden="true"></i>
                    <strong>Powód zgłoszenia:</strong> {review.reportReason}
                  </p>
                </div>
              )}

              {review.status === "Oczekuje" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleModerate(review.id, "Zatwierdzona")}
                    disabled={processing === review.id}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 font-medium py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing === review.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-300 border-t-transparent"></div>
                        Przetwarzanie...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check" aria-hidden="true"></i>
                        Zatwierdź
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleModerate(review.id, "Odrzucona")}
                    disabled={processing === review.id}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing === review.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-transparent"></div>
                        Przetwarzanie...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times" aria-hidden="true"></i>
                        Odrzuć
                      </>
                    )}
                  </button>
                </div>
              )}

              {review.status !== "Oczekuje" && (
                <div className="text-center py-2 text-sm text-gray-500">
                  Recenzja została {review.status === "Zatwierdzona" ? "zatwierdzona" : "odrzucona"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
