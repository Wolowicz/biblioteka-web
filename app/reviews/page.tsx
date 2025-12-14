"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";

interface Review {
  id: number;
  bookId: number;
  bookTitle: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const router = useRouter();

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch("/api/reviews?my=true");
      if (!response.ok) throw new Error("Błąd");
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch {
      console.error("Błąd ładowania recenzji");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });
      if (!response.ok) throw new Error("Błąd");
      setEditingReview(null);
      fetchReviews();
    } catch {
      console.error("Błąd zapisywania");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę recenzję?")) return;
    setDeleting(id);
    try {
      const response = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Błąd");
      fetchReviews();
    } catch {
      console.error("Błąd usuwania");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Zatwierdzona") return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Zatwierdzona</span>;
    if (status === "Oczekujaca") return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Oczekująca</span>;
    if (status === "Odrzucona") return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Odrzucona</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "text-yellow-400" : "text-gray-300"}>★</span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Moje recenzje</h1>

      {reviews.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center text-blue-700">
          Nie napisałeś jeszcze żadnych recenzji. Po wypożyczeniu i przeczytaniu książki, możesz dodać recenzję ze strony szczegółów książki.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <button
                    onClick={() => router.push(`/books/${review.bookId}`)}
                    className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                  >
                    {review.bookTitle}
                  </button>
                  <div className="flex items-center gap-3 mt-2">
                    {renderStars(review.rating)}
                    {getStatusBadge(review.status)}
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-3">{review.comment}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(review)} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    Edytuj
                  </button>
                  <button onClick={() => handleDelete(review.id)} disabled={deleting === review.id} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50">
                    {deleting === review.id ? "..." : "Usuń"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edytuj recenzję</h2>
            <p className="text-gray-600 mb-4">{editingReview.bookTitle}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ocena</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setEditRating(star)} className={`text-3xl ${star <= editRating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 transition`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Treść recenzji</label>
              <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingReview(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Anuluj
              </button>
              <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "Zapisywanie..." : "Zapisz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
