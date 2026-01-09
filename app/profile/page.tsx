"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";

interface ProfileData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  createdAt: string;
  stats: {
    totalBorrowings: number;
    activeBorrowings: number;
    totalReviews: number;
    unpaidFines: number;
  };
}

type TabType = "overview" | "edit" | "password" | "settings" | "borrowings" | "reviews" | "fines" | "favorites";

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Read tab from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "edit", "password", "settings", "borrowings", "reviews", "fines", "favorites"].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);
  
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Additional data states
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [loadingBorrowings, setLoadingBorrowings] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingFines, setLoadingFines] = useState(false);

  // Borrowings filter states
  const [borrowingsFilter, setBorrowingsFilter] = useState<"all" | "active" | "history" | "overdue">("all");
  const [borrowingsSearch, setBorrowingsSearch] = useState("");
  const [extendingId, setExtendingId] = useState<number | null>(null);

  // Fines filter state
  const [finesFilter, setFinesFilter] = useState<"all" | "unpaid" | "paid">("all");

  // Favorites states
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [removingFavoriteId, setRemovingFavoriteId] = useState<number | null>(null);

  // Reviews states
  const [reviewsSubTab, setReviewsSubTab] = useState<"my" | "reported">("my");
  const [reportedReviews, setReportedReviews] = useState<any[]>([]);
  const [loadingReportedReviews, setLoadingReportedReviews] = useState(false);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [unreportingId, setUnreportingId] = useState<number | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Nie udało się pobrać profilu");
      const data = await response.json();
      // API zwraca dane bezpośrednio, nie w data.profile
      setProfile(data);
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setEmail(data.email || "");
    } catch {
      setError("Błąd podczas ładowania profilu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Fetch favorites count on load
  useEffect(() => {
    fetch("/api/favorites")
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.favorites || []);
        setFavorites(list);
      })
      .catch(() => setFavorites([]));
  }, []);

  // Fetch borrowings when tab is selected
  useEffect(() => {
    if (activeTab === "borrowings" && borrowings.length === 0) {
      setLoadingBorrowings(true);
      fetch("/api/borrowings")
        .then(res => res.json())
        .then(data => {
          const list = Array.isArray(data) ? data : (data.borrowings || []);
          setBorrowings(list);
        })
        .catch(() => setBorrowings([]))
        .finally(() => setLoadingBorrowings(false));
    }
  }, [activeTab, borrowings.length]);

  // Fetch reviews when tab is selected
  useEffect(() => {
    if (activeTab === "reviews" && reviews.length === 0) {
      setLoadingReviews(true);
      fetch("/api/reviews?my=true")
        .then(res => res.json())
        .then(data => {
          const list = Array.isArray(data) ? data : (data.reviews || []);
          setReviews(list);
        })
        .catch(() => setReviews([]))
        .finally(() => setLoadingReviews(false));
    }
  }, [activeTab, reviews.length]);

  // Fetch reported reviews when sub-tab is selected
  useEffect(() => {
    if (activeTab === "reviews" && reviewsSubTab === "reported" && reportedReviews.length === 0) {
      setLoadingReportedReviews(true);
      fetch("/api/reviews?myReports=true")
        .then(res => res.json())
        .then(data => {
          const list = Array.isArray(data) ? data : (data.reviews || []);
          setReportedReviews(list);
        })
        .catch(() => setReportedReviews([]))
        .finally(() => setLoadingReportedReviews(false));
    }
  }, [activeTab, reviewsSubTab, reportedReviews.length]);

  // Funkcja odświeżania recenzji
  const refreshReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch("/api/reviews?my=true");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.reviews || []);
      setReviews(list);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  // Funkcja odświeżania zgłoszonych recenzji
  const refreshReportedReviews = useCallback(async () => {
    setLoadingReportedReviews(true);
    try {
      const res = await fetch("/api/reviews?myReports=true");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.reviews || []);
      setReportedReviews(list);
    } catch {
      setReportedReviews([]);
    } finally {
      setLoadingReportedReviews(false);
    }
  }, []);

  // Edycja recenzji
  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setEditRating(review.rating || 5);
    setEditComment(review.comment || "");
  };

  const handleSaveReview = async () => {
    if (!editingReview) return;
    setSavingReview(true);
    try {
      const res = await fetch(`/api/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd zapisywania");
      }
      setEditingReview(null);
      refreshReviews();
    } catch (err: any) {
      alert(err.message || "Błąd zapisywania recenzji");
    } finally {
      setSavingReview(false);
    }
  };

  // Usuwanie recenzji
  const handleDeleteReview = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę recenzję?")) return;
    setDeletingReviewId(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Błąd usuwania");
      refreshReviews();
    } catch {
      alert("Błąd usuwania recenzji");
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Cofanie zgłoszenia recenzji
  const handleUnreportReview = async (id: number) => {
    if (!confirm("Czy na pewno chcesz cofnąć zgłoszenie tej recenzji?")) return;
    setUnreportingId(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unreport" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd cofania zgłoszenia");
      }
      refreshReportedReviews();
    } catch (err: any) {
      alert(err.message || "Błąd cofania zgłoszenia");
    } finally {
      setUnreportingId(null);
    }
  };

  // Fetch fines when tab is selected
  useEffect(() => {
    if (activeTab === "fines" && fines.length === 0) {
      setLoadingFines(true);
      fetch("/api/fines")
        .then(res => res.json())
        .then(data => {
          const list = Array.isArray(data) ? data : (data.fines || []);
          setFines(list);
        })
        .catch(() => setFines([]))
        .finally(() => setLoadingFines(false));
    }
  }, [activeTab, fines.length]);

  // Funkcja usuwania z ulubionych
  const handleRemoveFavorite = async (bookId: number) => {
    setRemovingFavoriteId(bookId);
    try {
      const res = await fetch(`/api/favorites?bookId=${bookId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Błąd usuwania z ulubionych");
      setFavorites(prev => prev.filter(f => f.bookId !== bookId && f.id !== bookId));
    } catch {
      alert("Błąd usuwania z ulubionych");
    } finally {
      setRemovingFavoriteId(null);
    }
  };

  // Borrowings statistics
  const borrowingsStats = {
    all: borrowings.length,
    active: borrowings.filter((b: any) => !b.returnedDate).length,
    returned: borrowings.filter((b: any) => b.returnedDate).length,
    overdue: borrowings.filter((b: any) => !b.returnedDate && new Date(b.dueDate) < new Date()).length,
    totalFines: borrowings.reduce((sum: number, b: any) => sum + (parseFloat(String(b.fine)) || 0), 0),
  };

  // Filter borrowings based on selected tab
  const filteredBorrowings = borrowings.filter((b: any) => {
    // Filter by status
    if (borrowingsFilter === "active" && b.returnedDate) return false;
    if (borrowingsFilter === "history" && !b.returnedDate) return false;
    if (borrowingsFilter === "overdue" && (b.returnedDate || new Date(b.dueDate) >= new Date())) return false;

    // Filter by search
    if (borrowingsSearch.trim()) {
      const query = borrowingsSearch.toLowerCase();
      const title = (b.title || b.bookTitle || "").toLowerCase();
      const author = (b.author || b.authors || "").toLowerCase();
      if (!title.includes(query) && !author.includes(query)) return false;
    }

    return true;
  });

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper function to calculate status badge
  const getStatusBadge = (b: any) => {
    const now = new Date();
    const due = new Date(b.dueDate);

    if (b.returnedDate) {
      return { text: "Zwrócona", className: "bg-slate-100 text-slate-600 border border-slate-200", icon: "fa-check-circle" };
    }
    if (now > due) {
      return { text: "Po terminie", className: "bg-red-50 text-red-600 border border-red-200", icon: "fa-exclamation-circle" };
    }
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
      return { text: `Pozostało ${daysLeft} dni`, className: "bg-amber-50 text-amber-600 border border-amber-200", icon: "fa-clock" };
    }
    return { text: "Wypożyczona", className: "bg-emerald-50 text-emerald-600 border border-emerald-200", icon: "fa-book" };
  };

  // Handle extend borrowing
  const handleExtendBorrowing = async (borrowingId: number) => {
    setExtendingId(borrowingId);
    try {
      const res = await fetch(`/api/borrowings/${borrowingId}/extend`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setBorrowings((prev) =>
          prev.map((b) => b.id === borrowingId ? { ...b, dueDate: data.newDueDate } : b)
        );
      }
    } catch (error) {
      console.error("Extend error:", error);
    } finally {
      setExtendingId(null);
    }
  };

  // Fines statistics
  const finesStats = {
    total: fines.reduce((sum: number, f: any) => sum + (parseFloat(String(f.amount)) || 0), 0),
    unpaid: fines.filter((f: any) => f.status === "Naliczona").length,
    paid: fines.filter((f: any) => f.status === "Zaplacona").length,
  };

  // Filter fines based on selected tab
  const filteredFines = fines.filter((f: any) => {
    if (finesFilter === "unpaid" && f.status !== "Naliczona") return false;
    if (finesFilter === "paid" && f.status !== "Zaplacona") return false;
    return true;
  });

  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Błąd");
      setSuccess("Profil został zaktualizowany");
      fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    if (newPassword !== confirmPassword) { setPasswordError("Hasła nie są zgodne"); return; }
    if (newPassword.length < 8) { setPasswordError("Hasło musi mieć minimum 8 znaków"); return; }
    setChangingPassword(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Błąd");
      setPasswordSuccess("Hasło zostało zmienione");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Błąd");
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN": return "Administrator";
      case "LIBRARIAN": return "Bibliotekarz";
      default: return "Czytelnik";
    }
  };

  const menuItems = [
    { id: "overview" as TabType, label: "Przegląd", icon: "fas fa-user" },
    { id: "edit" as TabType, label: "Edytuj profil", icon: "fas fa-edit" },
    { id: "password" as TabType, label: "Zmień hasło", icon: "fas fa-lock" },
  ];

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          Nie udało się załadować profilu. Spróbuj odświeżyć stronę.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex gap-8">
        {/* ================================================================ */}
        {/* SIDEBAR */}
        {/* ================================================================ */}
        <aside className="w-72 shrink-0">
          {/* Karta użytkownika */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            {/* Tło nagłówka */}
            <div className="h-24 bg-linear-to-r from-indigo-500 to-purple-600 relative">
              <div className="absolute -bottom-8 left-6">
                <div className="w-16 h-16 bg-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center text-xl font-bold text-indigo-600">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </div>
              </div>
            </div>
            
            {/* Info */}
            <div className="pt-12 px-6 pb-5">
              <h2 className="text-lg font-bold text-slate-900">{profile.firstName} {profile.lastName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                  ${profile.role === "ADMIN" 
                    ? "bg-red-100 text-red-700" 
                    : profile.role === "LIBRARIAN" 
                      ? "bg-orange-100 text-orange-700" 
                      : "bg-indigo-100 text-indigo-700"
                  }
                `}>
                  <i className={`${profile.role === "ADMIN" ? "fas fa-shield-alt" : profile.role === "LIBRARIAN" ? "fas fa-book" : "fas fa-user"} text-[8px]`}></i>
                  {getRoleName(profile.role)}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${profile.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  <span className={`w-1 h-1 rounded-full ${profile.active ? "bg-green-500" : "bg-red-500"}`}></span>
                  {profile.active ? "Aktywne" : "Nieaktywne"}
                </span>
              </div>
            </div>
          </div>

          {/* Menu nawigacji */}
          <nav className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all border-l-4
                  ${activeTab === item.id 
                    ? "bg-indigo-50 text-indigo-700 border-indigo-600" 
                    : "text-slate-600 hover:bg-gray-50 border-transparent hover:text-slate-900"
                  }
                `}
              >
                <i className={`${item.icon} w-5 text-center`}></i>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Szybkie akcje */}
          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab("borrowings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                activeTab === "borrowings" 
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700" 
                  : "bg-white border-gray-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                <i className="fas fa-book-reader"></i>
              </div>
              <span className="flex-1 text-left">Moje wypożyczenia</span>
              <span className="text-indigo-600 font-semibold">{profile.stats.activeBorrowings}</span>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                activeTab === "reviews" 
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700" 
                  : "bg-white border-gray-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs">
                <i className="fas fa-star"></i>
              </div>
              <span className="flex-1 text-left">Moje recenzje</span>
              <span className="text-slate-500 font-semibold">{profile.stats.totalReviews}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("favorites")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                activeTab === "favorites" 
                  ? "bg-pink-50 border-pink-300 text-pink-700" 
                  : "bg-white border-gray-200 text-slate-700 hover:border-pink-300 hover:bg-pink-50"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center text-xs">
                <i className="fas fa-heart"></i>
              </div>
              <span className="flex-1 text-left">Ulubione książki</span>
              <span className="text-slate-500 font-semibold">{favorites.length}</span>
            </button>

            {profile.stats.unpaidFines > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("fines")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  activeTab === "fines" 
                    ? "bg-red-100 border-red-300 text-red-700" 
                    : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <span className="flex-1 text-left">Nieopłacone kary</span>
                <span className="font-bold">{profile.stats.unpaidFines.toFixed(2)} zł</span>
              </button>
            )}
          </div>
        </aside>

        {/* ================================================================ */}
        {/* MAIN CONTENT */}
        {/* ================================================================ */}
        <main className="flex-1 min-w-0">
          {/* Tab: Przegląd */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Dane konta */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Dane konta</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1.5"
                  >
                    <i className="fas fa-edit text-xs"></i>
                    Edytuj
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-slate-900">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Data rejestracji</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(profile.createdAt).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Podsumowanie aktywności */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Podsumowanie aktywności</h2>
                
                <div className="grid grid-cols-3 gap-4">
                  {/* Aktywne wypożyczenia */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("borrowings")}
                    className="group relative overflow-hidden bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 text-left transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {/* Efekt tła na hover */}
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                          <i className="fas fa-book-open"></i>
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors">Aktywne</span>
                      </div>
                      <p className="text-3xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{profile.stats.activeBorrowings}</p>
                      <p className="text-xs text-slate-500 mt-1">wypożyczeń w toku</p>
                      
                      {/* Progress bar */}
                      <div className="mt-3 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min((profile.stats.activeBorrowings / Math.max(profile.stats.totalBorrowings, 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Strzałka na hover */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <i className="fas fa-arrow-right text-blue-400"></i>
                    </div>
                  </button>
                  
                  {/* Łącznie wypożyczonych */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("borrowings")}
                    className="group relative overflow-hidden bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 text-left transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-green-600 transition-colors">Łącznie</span>
                      </div>
                      <p className="text-3xl font-bold text-slate-900 group-hover:text-green-700 transition-colors">{profile.stats.totalBorrowings}</p>
                      <p className="text-xs text-slate-500 mt-1">wypożyczonych książek</p>
                      
                      {/* Mini odznaki */}
                      <div className="mt-3 flex items-center gap-1">
                        {[...Array(Math.min(profile.stats.totalBorrowings, 5))].map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-green-400 group-hover:animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                        ))}
                        {profile.stats.totalBorrowings > 5 && (
                          <span className="text-[10px] text-green-600 font-medium ml-1">+{profile.stats.totalBorrowings - 5}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <i className="fas fa-arrow-right text-green-400"></i>
                    </div>
                  </button>
                  
                  {/* Recenzje */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("reviews")}
                    className="group relative overflow-hidden bg-linear-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100 text-left transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-amber-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                          <i className="fas fa-star"></i>
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-amber-600 transition-colors">Recenzje</span>
                      </div>
                      <p className="text-3xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{profile.stats.totalReviews}</p>
                      <p className="text-xs text-slate-500 mt-1">napisanych opinii</p>
                      
                      {/* Gwiazdki */}
                      <div className="mt-3 flex items-center gap-0.5">
                        {[1,2,3,4,5].map((star) => (
                          <i 
                            key={star} 
                            className={`text-xs ${star <= Math.min(profile.stats.totalReviews, 5) ? "fas fa-star text-amber-400 group-hover:animate-pulse" : "far fa-star text-amber-200"}`}
                            style={{ animationDelay: `${star * 100}ms` }}
                          ></i>
                        ))}
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <i className="fas fa-arrow-right text-amber-400"></i>
                    </div>
                  </button>
                </div>

                {/* Dodatkowy wiersz ze statystykami kar */}
                {(profile.stats.unpaidFines > 0 || fines.length > 0) && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab("fines")}
                      className="group w-full relative overflow-hidden bg-linear-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-100 text-left transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-red-500 to-rose-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            <i className="fas fa-coins text-lg"></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600 group-hover:text-red-600 transition-colors">Nieopłacone kary</p>
                            <p className="text-2xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
                              {finesStats.total.toFixed(2)} zł
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Liczba kar</p>
                            <p className="text-lg font-bold text-slate-700">{finesStats.unpaid}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                            <i className="fas fa-arrow-right text-red-500"></i>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pulsująca animacja ostrzeżenia */}
                      {finesStats.total > 0 && (
                        <div className="absolute top-3 right-3">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Wizualizacje i wykresy */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Statystyki wizualne</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Wykres kołowy - stosunek aktywnych do zwróconych */}
                  <div className="bg-linear-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <i className="fas fa-chart-pie text-indigo-500"></i>
                      Status wypożyczeń
                    </h3>
                    
                    <div className="flex items-center gap-6">
                      {/* Donut Chart */}
                      <div className="relative w-28 h-28 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* Tło */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="12"
                          />
                          {/* Zwrócone */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="12"
                            strokeDasharray={`${((profile.stats.totalBorrowings - profile.stats.activeBorrowings) / Math.max(profile.stats.totalBorrowings, 1)) * 251.2} 251.2`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                          {/* Aktywne */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="12"
                            strokeDasharray={`${(profile.stats.activeBorrowings / Math.max(profile.stats.totalBorrowings, 1)) * 251.2} 251.2`}
                            strokeDashoffset={`${-((profile.stats.totalBorrowings - profile.stats.activeBorrowings) / Math.max(profile.stats.totalBorrowings, 1)) * 251.2}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        {/* Środek */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{profile.stats.totalBorrowings}</p>
                            <p className="text-[10px] text-slate-500">łącznie</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Legenda */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                            <span className="text-sm text-slate-600">Aktywne</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900">{profile.stats.activeBorrowings}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-slate-600">Zwrócone</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900">{profile.stats.totalBorrowings - profile.stats.activeBorrowings}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Współczynnik zwrotów</span>
                            <span className="text-sm font-bold text-emerald-600">
                              {profile.stats.totalBorrowings > 0 
                                ? Math.round(((profile.stats.totalBorrowings - profile.stats.activeBorrowings) / profile.stats.totalBorrowings) * 100)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mini wykres słupkowy - aktywność */}
                  <div className="bg-linear-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <i className="fas fa-chart-bar text-purple-500"></i>
                      Przegląd aktywności
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Wypożyczenia */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-slate-600">Wypożyczenia</span>
                          <span className="text-xs font-bold text-slate-900">{profile.stats.totalBorrowings}</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-linear-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ width: `${Math.min((profile.stats.totalBorrowings / 20) * 100, 100)}%` }}
                          >
                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/30 to-white/0 animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Recenzje */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-slate-600">Recenzje</span>
                          <span className="text-xs font-bold text-slate-900">{profile.stats.totalReviews}</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ width: `${Math.min((profile.stats.totalReviews / 10) * 100, 100)}%` }}
                          >
                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/30 to-white/0 animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Współczynnik aktywności */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-600">Poziom aktywności</span>
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const activity = profile.stats.totalBorrowings + profile.stats.totalReviews;
                              const level = activity >= 15 ? "Ekspert" : activity >= 8 ? "Aktywny" : activity >= 3 ? "Początkujący" : "Nowy";
                              const color = activity >= 15 ? "text-purple-600 bg-purple-100" : activity >= 8 ? "text-emerald-600 bg-emerald-100" : activity >= 3 ? "text-blue-600 bg-blue-100" : "text-slate-600 bg-slate-100";
                              return (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
                                  {level}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((level) => {
                            const activity = profile.stats.totalBorrowings + profile.stats.totalReviews;
                            const filled = activity >= level * 3;
                            return (
                              <div 
                                key={level}
                                className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                                  filled 
                                    ? "bg-linear-to-r from-purple-400 to-indigo-500" 
                                    : "bg-gray-200"
                                }`}
                                style={{ transitionDelay: `${level * 100}ms` }}
                              ></div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kreatywne statystyki z prawdziwych danych */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {/* Dni jako czytelnik */}
                  {(() => {
                    const daysAsMember = Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div className="bg-linear-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100 text-center group hover:shadow-md transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-violet-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="w-10 h-10 mx-auto rounded-lg bg-linear-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/25">
                          <i className="fas fa-calendar-check"></i>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{daysAsMember}</p>
                        <p className="text-[10px] text-slate-500">dni z nami</p>
                        <div className="mt-2 text-[9px] text-violet-600 font-medium">
                          {daysAsMember < 30 ? "🌱 Świeżak" : daysAsMember < 180 ? "📖 Stały bywalec" : daysAsMember < 365 ? "⭐ Weteran" : "👑 Legenda"}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Średnia ocena recenzji */}
                  {(() => {
                    const avgRating = reviews.length > 0 
                      ? reviews.reduce((sum: number, r: any) => sum + (r.Ocena || 0), 0) / reviews.length 
                      : 0;
                    return (
                      <div className="bg-linear-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100 text-center group hover:shadow-md transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="w-10 h-10 mx-auto rounded-lg bg-linear-to-br from-amber-400 to-yellow-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/25">
                          <i className="fas fa-star"></i>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
                        <p className="text-[10px] text-slate-500">średnia ocena</p>
                        <div className="mt-2 flex justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i key={star} className={`text-[8px] ${star <= Math.round(avgRating) ? "fas fa-star text-amber-400" : "far fa-star text-amber-200"}`}></i>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Wskaźnik aktywności */}
                  {(() => {
                    const totalActions = profile.stats.totalBorrowings + reviews.length;
                    const activityScore = Math.min(100, totalActions * 5);
                    return (
                      <div className="bg-linear-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100 text-center group hover:shadow-md transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-teal-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="w-10 h-10 mx-auto rounded-lg bg-linear-to-br from-teal-400 to-cyan-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/25">
                          <i className="fas fa-fire"></i>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{activityScore}%</p>
                        <p className="text-[10px] text-slate-500">aktywność</p>
                        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-linear-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${activityScore}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Edytuj profil */}
          {activeTab === "edit" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Edytuj dane osobowe</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 mb-6 flex items-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  {success}
                </div>
              )}
              
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Imię</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nazwisko</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Adres email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                  />
                </div>
                
                <div className="pt-4">
                  <button 
                    type="button"
                    onClick={handleSaveProfile} 
                    disabled={saving} 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Zapisywanie...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Zapisz zmiany
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Zmień hasło */}
          {activeTab === "password" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Zmień hasło</h2>
              <p className="text-sm text-slate-500 mb-6">Upewnij się, że używasz silnego hasła</p>
              
              {passwordError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 mb-6 flex items-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  {passwordSuccess}
                </div>
              )}
              
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Aktualne hasło</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nowe hasło</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Minimum 8 znaków</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Powtórz nowe hasło</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="pt-4">
                  <button 
                    type="button"
                    onClick={handleChangePassword} 
                    disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword} 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {changingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Zmieniam...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key"></i>
                        Zmień hasło
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Ustawienia */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Strefa niebezpieczna - pozostawiona */}
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-red-600 mb-2">Strefa niebezpieczna</h2>
                <p className="text-sm text-slate-500 mb-4">Nieodwracalne akcje związane z Twoim kontem</p>

                <button 
                  type="button"
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all"
                >
                  <i className="fas fa-trash-alt mr-2"></i>
                  Usuń konto
                </button>
              </div>
            </div>
          )} 

          {/* Tab: Wypożyczenia */}
          {activeTab === "borrowings" && (
            <div className="space-y-6">
              {/* Nagłówek */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <i className="fas fa-book-reader text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Moje Wypożyczenia</h2>
                  <p className="text-slate-500">Zarządzaj swoimi aktualnymi i historycznymi wypożyczeniami</p>
                </div>
              </div>

              {loadingBorrowings ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <>
                  {/* Statystyki */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div 
                      onClick={() => setBorrowingsFilter("all")}
                      className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-md ${borrowingsFilter === "all" ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-200"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-100">
                          <i className="fas fa-layer-group text-blue-600"></i>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{borrowingsStats.all}</p>
                          <p className="text-xs text-slate-500">Wszystkich</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      onClick={() => setBorrowingsFilter("active")}
                      className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-md ${borrowingsFilter === "active" ? "ring-2 ring-emerald-500 border-emerald-500" : "border-gray-200"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-100">
                          <i className="fas fa-clock text-emerald-600"></i>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{borrowingsStats.active}</p>
                          <p className="text-xs text-slate-500">Aktywnych</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      onClick={() => setBorrowingsFilter("history")}
                      className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-md ${borrowingsFilter === "history" ? "ring-2 ring-slate-500 border-slate-500" : "border-gray-200"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-100">
                          <i className="fas fa-check-circle text-slate-600"></i>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{borrowingsStats.returned}</p>
                          <p className="text-xs text-slate-500">Zwróconych</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      onClick={() => setBorrowingsFilter("overdue")}
                      className={`p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-md ${borrowingsStats.overdue > 0 ? "bg-red-50/50 border-red-200" : "bg-white border-gray-200"} ${borrowingsFilter === "overdue" ? "ring-2 ring-red-500 border-red-500" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-red-100">
                          <i className="fas fa-exclamation-triangle text-red-600"></i>
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${borrowingsStats.overdue > 0 ? "text-red-600" : "text-slate-900"}`}>{borrowingsStats.overdue}</p>
                          <p className="text-xs text-slate-500">Po terminie</p>
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl border shadow-sm ${borrowingsStats.totalFines > 0 ? "bg-amber-50/50 border-amber-200" : "bg-white border-gray-200"}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-100 shrink-0">
                          <i className="fas fa-coins text-amber-600"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-bold truncate ${borrowingsStats.totalFines > 0 ? "text-red-600" : "text-slate-900"}`}>
                            <span className={`${borrowingsStats.totalFines >= 10000 ? "text-base" : borrowingsStats.totalFines >= 1000 ? "text-lg" : "text-xl"}`}>
                              {borrowingsStats.totalFines.toFixed(2)}
                            </span>
                            <span className="text-xs ml-0.5">zł</span>
                          </div>
                          <p className="text-xs text-slate-500">Suma kar</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toolbar z filtrami i wyszukiwarką */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                      {[
                        { id: "all" as const, label: "Wszystkie", icon: "fa-layer-group", count: borrowingsStats.all },
                        { id: "active" as const, label: "Aktualne", icon: "fa-clock", count: borrowingsStats.active },
                        { id: "history" as const, label: "Historia", icon: "fa-history", count: borrowingsStats.returned },
                        { id: "overdue" as const, label: "Po terminie", icon: "fa-exclamation-triangle", count: borrowingsStats.overdue },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setBorrowingsFilter(tab.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            borrowingsFilter === tab.id
                              ? "bg-slate-900 text-white shadow-md"
                              : "text-slate-500 hover:bg-gray-100"
                          }`}
                        >
                          <i className={`fas ${tab.icon} text-xs`}></i>
                          <span className="hidden sm:inline">{tab.label}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-xs ${borrowingsFilter === tab.id ? "bg-white/20" : "bg-gray-200"}`}>
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative w-full sm:w-auto">
                      <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <input
                        type="text"
                        placeholder="Szukaj książki..."
                        value={borrowingsSearch}
                        onChange={(e) => setBorrowingsSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full sm:w-64 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      {borrowingsSearch && (
                        <button
                          type="button"
                          onClick={() => setBorrowingsSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lista wypożyczeń */}
                  {filteredBorrowings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <i className="fas fa-book-open text-3xl text-slate-400"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {borrowingsSearch ? "Brak wyników" : "Brak wypożyczeń"}
                      </h3>
                      <p className="text-slate-500 max-w-md mx-auto">
                        {borrowingsSearch 
                          ? `Nie znaleziono wypożyczeń pasujących do "${borrowingsSearch}"`
                          : borrowingsFilter === "active" 
                            ? "Wszystkie książki zostały zwrócone. Sprawdź katalog!"
                            : borrowingsFilter === "overdue"
                              ? "Świetnie! Nie masz żadnych książek po terminie."
                              : "Nie masz jeszcze żadnych wypożyczeń."
                        }
                      </p>
                      <a
                        href="/"
                        className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all"
                      >
                        <i className="fas fa-search"></i>
                        Przeglądaj katalog
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredBorrowings.map((b: any) => {
                        const badge = getStatusBadge(b);
                        const isOverdue = !b.returnedDate && new Date() > new Date(b.dueDate);
                        const daysLeft = Math.ceil((new Date(b.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const title = b.title || b.bookTitle || "Nieznany tytuł";
                        const author = b.author || b.authors || "";
                        const fine = parseFloat(String(b.fine)) || 0;

                        return (
                          <div
                            key={b.id}
                            className={`group bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${isOverdue ? "border-red-200" : "border-gray-200"}`}
                          >
                            {/* Progress bar dla aktywnych */}
                            {!b.returnedDate && !isOverdue && (
                              <div className="h-1 bg-gray-100">
                                <div
                                  className="h-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                  style={{ width: `${Math.max(0, Math.min(100, (14 - daysLeft) / 14 * 100))}%` }}
                                />
                              </div>
                            )}

                            <div className="p-5">
                              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                {/* Okładka i informacje */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="relative shrink-0">
                                    {b.coverUrl ? (
                                      <img
                                        src={b.coverUrl}
                                        alt={`Okładka: ${title}`}
                                        className="w-14 h-18 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow"
                                      />
                                    ) : (
                                      <div className="w-14 h-18 rounded-xl bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center">
                                        <i className="fas fa-book text-slate-400 text-lg"></i>
                                      </div>
                                    )}
                                    {isOverdue && (
                                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                        <i className="fas fa-exclamation text-white text-[10px]"></i>
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                      {title}
                                    </h3>
                                    <p className="text-sm text-slate-500">{author}</p>
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          b.returnedDate ? "bg-slate-400" : isOverdue ? "bg-red-500" : "bg-emerald-500"
                                        }`}></span>
                                        {badge.text}
                                      </span>
                                      {fine > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                          <i className="fas fa-coins text-[10px]"></i>
                                          {fine.toFixed(2)} zł kary
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Daty */}
                                <div className="flex items-center gap-6 lg:gap-8 text-sm shrink-0">
                                  <div className="text-center">
                                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1 font-medium">
                                      Wypożyczono
                                    </div>
                                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                                      <i className="far fa-calendar-alt text-slate-400 text-xs"></i>
                                      {formatDate(b.borrowDate)}
                                    </div>
                                  </div>

                                  <div className="hidden sm:block w-px h-10 bg-gray-200"></div>

                                  <div className="text-center">
                                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1 font-medium">
                                      {b.returnedDate ? "Zwrócono" : "Termin"}
                                    </div>
                                    <div className={`flex items-center gap-2 font-semibold ${b.returnedDate ? "text-emerald-600" : isOverdue ? "text-red-600" : "text-slate-700"}`}>
                                      <i className={`text-xs ${b.returnedDate ? "far fa-check-circle text-emerald-500" : isOverdue ? "fas fa-calendar-times text-red-400" : "far fa-calendar-alt text-slate-400"}`}></i>
                                      {formatDate(b.returnedDate || b.dueDate)}
                                    </div>
                                  </div>
                                </div>

                                {/* Akcje */}
                                <div className="flex items-center gap-3 shrink-0 lg:border-l lg:border-gray-200 lg:pl-6">
                                  {!b.returnedDate && !isOverdue && (
                                    <button
                                      type="button"
                                      onClick={() => handleExtendBorrowing(b.id)}
                                      disabled={extendingId === b.id}
                                      className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg disabled:opacity-50"
                                    >
                                      {extendingId === b.id ? (
                                        <i className="fas fa-spinner animate-spin text-xs"></i>
                                      ) : (
                                        <i className="fas fa-clock text-xs"></i>
                                      )}
                                      {extendingId === b.id ? "Przedłużam..." : "Przedłuż"}
                                    </button>
                                  )}
                                  {!b.returnedDate && isOverdue && (
                                    <button
                                      type="button"
                                      disabled
                                      className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white text-slate-400 border border-gray-200 cursor-not-allowed flex items-center gap-2"
                                    >
                                      <i className="fas fa-clock text-xs"></i>
                                      Przedłuż
                                    </button>
                                  )}
                                  {b.returnedDate && (
                                    <div className="flex flex-col items-center px-4 py-1">
                                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-1">
                                        <i className="fas fa-check text-emerald-500"></i>
                                      </div>
                                      <p className="text-xs text-slate-500">Zwrócono</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tab: Recenzje */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Nagłówek */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <i className="fas fa-star text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Recenzje</h2>
                  <p className="text-slate-500">Zarządzaj swoimi recenzjami i zgłoszeniami</p>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                <button
                  type="button"
                  onClick={() => setReviewsSubTab("my")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    reviewsSubTab === "my"
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <i className="fas fa-pen mr-2"></i>
                  Moje recenzje ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewsSubTab("reported")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    reviewsSubTab === "reported"
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <i className="fas fa-flag mr-2"></i>
                  Zgłoszone przeze mnie ({reportedReviews.length})
                </button>
              </div>

              {/* Moje recenzje */}
              {reviewsSubTab === "my" && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  {loadingReviews ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <i className="fas fa-star text-2xl text-slate-400"></i>
                      </div>
                      <p className="font-medium">Brak recenzji</p>
                      <p className="text-sm text-slate-400 mt-1">Nie napisałeś jeszcze żadnej recenzji</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((r: any) => (
                        <div key={r.id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => router.push(`/books/${r.bookId}`)}
                                className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                              >
                                {r.bookTitle || "Nieznana książka"}
                              </button>
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {[1,2,3,4,5].map(star => (
                                  <i key={star} className={`text-sm ${star <= (r.rating || 0) ? "fas fa-star text-amber-400" : "far fa-star text-gray-300"}`}></i>
                                ))}
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                  r.status === "Zatwierdzona" ? "bg-green-100 text-green-700" :
                                  r.status === "Oczekuje" ? "bg-amber-100 text-amber-700" :
                                  r.status === "Odrzucona" ? "bg-red-100 text-red-700" :
                                  "bg-slate-100 text-slate-600"
                                }`}>
                                  {r.status}
                                </span>
                              </div>
                              {r.comment && <p className="mt-2 text-sm text-slate-600 line-clamp-3">{r.comment}</p>}
                              <p className="text-xs text-slate-400 mt-2">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString("pl-PL") : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditReview(r)}
                                className="p-2.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                title="Edytuj"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(r.id)}
                                disabled={deletingReviewId === r.id}
                                className="p-2.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                                title="Usuń"
                              >
                                {deletingReviewId === r.id ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fas fa-trash"></i>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Zgłoszone przeze mnie */}
              {reviewsSubTab === "reported" && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  {loadingReportedReviews ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : reportedReviews.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <i className="fas fa-flag text-2xl text-slate-400"></i>
                      </div>
                      <p className="font-medium">Brak zgłoszonych recenzji</p>
                      <p className="text-sm text-slate-400 mt-1">Nie zgłosiłeś jeszcze żadnej recenzji</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reportedReviews.map((r: any) => (
                        <div key={r.id} className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                                  <i className="fas fa-flag mr-1"></i>Zgłoszona
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => router.push(`/books/${r.bookId}`)}
                                className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                              >
                                {r.bookTitle || "Nieznana książka"}
                              </button>
                              <p className="text-sm text-slate-500 mt-1">Autor recenzji: {r.userName}</p>
                              <div className="flex items-center gap-1 mt-2">
                                {[1,2,3,4,5].map(star => (
                                  <i key={star} className={`text-sm ${star <= (r.rating || 0) ? "fas fa-star text-amber-400" : "far fa-star text-gray-300"}`}></i>
                                ))}
                              </div>
                              {r.comment && <p className="mt-2 text-sm text-slate-600 line-clamp-3">{r.comment}</p>}
                              {r.reportReason && (
                                <div className="mt-3 p-3 bg-red-100/50 rounded-lg">
                                  <p className="text-xs font-medium text-red-700 mb-1">
                                    <i className="fas fa-exclamation-circle mr-1"></i>Powód zgłoszenia:
                                  </p>
                                  <p className="text-sm text-red-600">{r.reportReason}</p>
                                </div>
                              )}
                              <p className="text-xs text-slate-400 mt-2">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString("pl-PL") : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUnreportReview(r.id)}
                                disabled={unreportingId === r.id}
                                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50 text-sm font-medium"
                                title="Cofnij zgłoszenie"
                              >
                                {unreportingId === r.id ? (
                                  <i className="fas fa-spinner fa-spin mr-2"></i>
                                ) : (
                                  <i className="fas fa-undo mr-2"></i>
                                )}
                                Cofnij zgłoszenie
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Modal edycji recenzji */}
              {editingReview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900">Edytuj recenzję</h3>
                      <button
                        type="button"
                        onClick={() => setEditingReview(null)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <p className="text-slate-600 mb-4 font-medium">{editingReview.bookTitle}</p>
                    
                    {/* Ocena */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Ocena</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className={`text-3xl transition-colors ${star <= editRating ? "text-amber-400" : "text-gray-300"} hover:text-amber-400`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Treść */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Treść recenzji</label>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        placeholder="Napisz swoją recenzję (minimum 10 znaków)..."
                      />
                      <p className="text-xs text-slate-400 mt-1">{editComment.length} / min. 10 znaków</p>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingReview(null)}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        Anuluj
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveReview}
                        disabled={savingReview || editComment.length < 10}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingReview ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Zapisywanie...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save mr-2"></i>
                            Zapisz zmiany
                          </>
                        )}
                      </button>
                    </div>
                    
                    <p className="text-xs text-slate-400 mt-4 text-center">
                      <i className="fas fa-info-circle mr-1"></i>
                      Po edycji recenzja będzie wymagać ponownego zatwierdzenia przez moderatora.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Ulubione */}
          {activeTab === "favorites" && (
            <div className="space-y-6">
              {/* Nagłówek */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
                  <i className="fas fa-heart text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Ulubione książki</h2>
                  <p className="text-slate-500">Twoja kolekcja ulubionych pozycji</p>
                </div>
              </div>

              {loadingFavorites ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full"></div>
                </div>
              ) : favorites.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-linear-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                    <i className="fas fa-heart-broken text-3xl text-pink-400"></i>
                  </div>
                  <p className="font-semibold text-slate-700 text-lg">Brak ulubionych książek</p>
                  <p className="text-sm text-slate-400 mt-2">
                    Dodaj książki do ulubionych klikając serduszko na stronie książki
                  </p>
                  <a
                    href="/catalog"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-linear-to-r from-pink-500 to-rose-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg shadow-pink-200"
                  >
                    <i className="fas fa-search"></i>
                    Przeglądaj katalog
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {favorites.map((book: any) => (
                    <div
                      key={book.bookId || book.id}
                      className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-pink-200 transition-all duration-300"
                    >
                      {/* Okładka */}
                      <a href={`/books/${book.bookId || book.id}`} className="block relative aspect-2/3 bg-linear-to-br from-slate-100 to-slate-200 overflow-hidden">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="fas fa-book text-4xl text-slate-300"></i>
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        {/* Hover actions */}
                        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                          <span className="flex-1 text-center py-2 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-medium text-slate-800">
                            Zobacz szczegóły
                          </span>
                        </div>
                      </a>

                      {/* Treść */}
                      <div className="p-4">
                        <a href={`/books/${book.bookId || book.id}`} className="block">
                          <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-pink-600 transition-colors">
                            {book.title}
                          </h3>
                        </a>
                        <p className="text-sm text-slate-500 mt-1 truncate">{book.author || book.authors}</p>

                        {/* Rating jeśli jest */}
                        {(book.avgRating || book.averageRating) && (
                          <div className="flex items-center gap-1 mt-2 text-amber-500">
                            <i className="fas fa-star text-xs"></i>
                            <span className="text-sm font-medium">{parseFloat(book.avgRating || book.averageRating).toFixed(1)}</span>
                          </div>
                        )}

                        {/* Przycisk usuwania */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(book.bookId || book.id)}
                          disabled={removingFavoriteId === (book.bookId || book.id)}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {removingFavoriteId === (book.bookId || book.id) ? (
                            <div className="animate-spin w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full"></div>
                          ) : (
                            <>
                              <i className="fas fa-heart-broken"></i>
                              Usuń z ulubionych
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Kary */}
          {activeTab === "fines" && (
            <div className="space-y-6">
              {/* Nagłówek */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                  <i className="fas fa-coins text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Moje kary</h2>
                  <p className="text-slate-500">Zarządzaj swoimi karami za nieterminowe zwroty</p>
                </div>
              </div>

              {loadingFines ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <>
                  {/* Statystyki */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-5 rounded-xl border shadow-sm ${finesStats.total > 0 ? "bg-red-50/50 border-red-200" : "bg-white border-gray-200"}`}>
                      <p className={`text-3xl font-bold ${finesStats.total > 0 ? "text-red-600" : "text-slate-900"}`}>
                        {finesStats.total.toFixed(2)} zł
                      </p>
                      <p className="text-sm text-slate-500 mt-1">Do zapłaty</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-3xl font-bold text-slate-900">{finesStats.unpaid}</p>
                      <p className="text-sm text-slate-500 mt-1">Nieopłaconych</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-3xl font-bold text-slate-900">{finesStats.paid}</p>
                      <p className="text-sm text-slate-500 mt-1">Opłaconych</p>
                    </div>
                  </div>

                  {/* Filtry */}
                  <div className="flex items-center gap-2">
                    {[
                      { id: "all" as const, label: "Wszystkie" },
                      { id: "unpaid" as const, label: "Nieopłacone" },
                      { id: "paid" as const, label: "Opłacone" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFinesFilter(tab.id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          finesFilter === tab.id
                            ? "bg-slate-900 text-white shadow-md"
                            : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tabela kar */}
                  {filteredFines.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 flex items-center justify-center">
                        <i className="fas fa-check-circle text-2xl text-green-500"></i>
                      </div>
                      <p className="font-medium text-green-700">
                        {finesFilter === "unpaid" ? "Brak nieopłaconych kar!" : finesFilter === "paid" ? "Brak opłaconych kar" : "Brak kar"}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {finesFilter === "unpaid" ? "Wszystkie kary zostały opłacone" : finesFilter === "paid" ? "Nie masz żadnych opłaconych kar" : "Nie masz żadnych kar"}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Nagłówek tabeli */}
                      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-gray-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <div className="col-span-3">Książka</div>
                        <div className="col-span-2 text-center">Kwota</div>
                        <div className="col-span-2 text-center">Dni spóźnienia</div>
                        <div className="col-span-2 text-center">Data naliczenia</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-1 text-center">Data opłacenia</div>
                      </div>

                      {/* Wiersze */}
                      {filteredFines.map((f: any) => (
                        <div key={f.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors items-center">
                          <div className="col-span-3">
                            <a href={f.bookId ? `/books/${f.bookId}` : "#"} className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                              {f.bookTitle || "Nieznana książka"}
                            </a>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="font-bold text-slate-900">{(parseFloat(String(f.amount)) || 0).toFixed(2)} zł</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-slate-600">{f.daysOverdue || 0}</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-slate-600">{f.createdAt ? new Date(f.createdAt).toLocaleDateString("pl-PL") : "-"}</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              f.status === "Zaplacona" 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                            }`}>
                              {f.status === "Zaplacona" ? "Opłacona" : "Nieopłacona"}
                            </span>
                          </div>
                          <div className="col-span-1 text-center text-slate-500">
                            {f.paidAt ? new Date(f.paidAt).toLocaleDateString("pl-PL") : "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ostrzeżenie */}
                  {finesStats.unpaid > 0 && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 rounded-xl border border-amber-200">
                      <i className="fas fa-exclamation-triangle text-amber-500 text-lg"></i>
                      <p className="text-sm text-amber-800">
                        Masz nieopłacone kary. Prosimy o uregulowanie należności w bibliotece.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
}

// Export with Suspense boundary for useSearchParams
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      </AppShell>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}