/**
 * LIBRARIAN DASHBOARD CLIENT - Panel główny bibliotekarza
 * 
 * Grey mode dashboard z:
 * - Statystykami w czasie rzeczywistym
 * - Szybkimi akcjami
 * - Ostatnią aktywnością
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import LibrarianLayout from "@/app/_components/LibrarianLayout";
import type { UserSession } from "@/domain/types";

interface Stats {
  totalBooks: number;
  availableBooks: number;
  activeBorrowings: number;
  overdueBorrowings: number;
  pendingReviews: number;
  unpaidFines: number;
  totalFines: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  userFirstName?: string;
  userLastName?: string;
}

export default function LibrarianDashboardClient({ user }: { user: UserSession }) {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/stats", { credentials: "include" });
      if (!response.ok) throw new Error("Błąd");
      const data = await response.json();
      
      // Pobierz liczbę oczekujących recenzji
      const reviewsRes = await fetch("/api/reviews?status=pending&count=true", { credentials: "include" });
      const reviewsData = reviewsRes.ok ? await reviewsRes.json() : { count: 0 };
      
      setStats({
        totalBooks: data.books?.total || 0,
        availableBooks: data.books?.available || 0,
        activeBorrowings: data.borrowings?.active || 0,
        overdueBorrowings: data.borrowings?.overdue || 0,
        pendingReviews: reviewsData.count || 0,
        unpaidFines: data.unpaidFines || 0,
        totalFines: data.totalFines || 0,
      });
      
      setRecentActivity(data.recentActivity || []);
    } catch (error) {
      console.error("Błąd ładowania statystyk:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getActivityIcon = (type: string) => {
    const icons: Record<string, { icon: string; color: string }> = {
      BOOK_BORROWED: { icon: "fa-book", color: "text-blue-400" },
      BOOK_RETURNED: { icon: "fa-check-circle", color: "text-emerald-400" },
      BOOK_ADDED: { icon: "fa-book-medical", color: "text-purple-400" },
      USER_REGISTERED: { icon: "fa-user-plus", color: "text-indigo-400" },
      REVIEW_ADDED: { icon: "fa-star", color: "text-amber-400" },
      FINE_PAID: { icon: "fa-coins", color: "text-yellow-400" },
      DEFAULT: { icon: "fa-circle", color: "text-gray-400" },
    };
    return icons[type] || icons.DEFAULT;
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Przed chwilą";
    if (minutes < 60) return `${minutes} min temu`;
    if (hours < 24) return `${hours} godz. temu`;
    return `${days} dni temu`;
  };

  if (loading) {
    return (
      <LibrarianLayout user={user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      </LibrarianLayout>
    );
  }

  return (
    <LibrarianLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-linear-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <i className="fas fa-book-reader text-2xl text-white" aria-hidden="true"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Witaj, {user.firstName}!
              </h1>
              <p className="text-gray-400">
                Oto przegląd Twojego panelu bibliotekarza
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Books */}
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <i className="fas fa-books text-blue-400" aria-hidden="true"></i>
              </div>
              <span className="text-sm text-gray-400">Książki w systemie</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalBooks || 0}</p>
            <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1">
              <i className="fas fa-check-circle" aria-hidden="true"></i>
              {stats?.availableBooks || 0} dostępnych
            </p>
          </div>

          {/* Active Borrowings */}
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <i className="fas fa-book-reader text-emerald-400" aria-hidden="true"></i>
              </div>
              <span className="text-sm text-gray-400">Aktywne wypożyczenia</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.activeBorrowings || 0}</p>
            <p className="text-sm text-gray-400 mt-1">w trakcie</p>
          </div>

          {/* Overdue */}
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-400" aria-hidden="true"></i>
              </div>
              <span className="text-sm text-gray-400">Przetrzymane</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.overdueBorrowings || 0}</p>
            <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
              <i className="fas fa-clock" aria-hidden="true"></i>
              wymagają uwagi
            </p>
          </div>

          {/* Pending Reviews */}
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <i className="fas fa-star-half-alt text-amber-400" aria-hidden="true"></i>
              </div>
              <span className="text-sm text-gray-400">Oczekujące recenzje</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.pendingReviews || 0}</p>
            <p className="text-sm text-amber-400 mt-1 flex items-center gap-1">
              <i className="fas fa-hourglass-half" aria-hidden="true"></i>
              do moderacji
            </p>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <i className="fas fa-bolt text-amber-400" aria-hidden="true"></i>
              Szybkie akcje
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/librarian/borrowings")}
                className="p-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-left transition-colors border border-gray-600/30 group"
              >
                <i className="fas fa-plus-circle text-blue-400 text-xl mb-2 group-hover:scale-110 transition-transform" aria-hidden="true"></i>
                <h3 className="font-semibold text-white text-sm">Nowe wypożyczenie</h3>
                <p className="text-xs text-gray-400">Wydaj książkę</p>
              </button>
              
              <button
                onClick={() => router.push("/librarian/borrowings")}
                className="p-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-left transition-colors border border-gray-600/30 group"
              >
                <i className="fas fa-undo text-emerald-400 text-xl mb-2 group-hover:scale-110 transition-transform" aria-hidden="true"></i>
                <h3 className="font-semibold text-white text-sm">Przyjmij zwrot</h3>
                <p className="text-xs text-gray-400">Oznacz jako zwrócone</p>
              </button>
              
              <button
                onClick={() => router.push("/librarian/inventory")}
                className="p-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-left transition-colors border border-gray-600/30 group"
              >
                <i className="fas fa-book-medical text-purple-400 text-xl mb-2 group-hover:scale-110 transition-transform" aria-hidden="true"></i>
                <h3 className="font-semibold text-white text-sm">Dodaj książkę</h3>
                <p className="text-xs text-gray-400">Nowa pozycja</p>
              </button>
              
              <button
                onClick={() => router.push("/librarian/reviews")}
                className="p-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-left transition-colors border border-gray-600/30 group"
              >
                <i className="fas fa-star text-amber-400 text-xl mb-2 group-hover:scale-110 transition-transform" aria-hidden="true"></i>
                <h3 className="font-semibold text-white text-sm">Moderuj recenzje</h3>
                <p className="text-xs text-gray-400">{stats?.pendingReviews || 0} oczekuje</p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-history text-gray-400" aria-hidden="true"></i>
                Ostatnia aktywność
              </h2>
              <button
                onClick={fetchStats}
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <i className="fas fa-sync-alt" aria-hidden="true"></i>
                Odśwież
              </button>
            </div>
            
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-inbox text-3xl mb-2" aria-hidden="true"></i>
                <p>Brak ostatniej aktywności</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => {
                  const { icon, color } = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center shrink-0 ${color}`}>
                        <i className={`fas ${icon}`} aria-hidden="true"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.userFirstName && activity.userLastName && (
                            <span className="text-gray-400">
                              {activity.userFirstName} {activity.userLastName} •{" "}
                            </span>
                          )}
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Fines Overview */}
        <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fas fa-coins text-amber-400" aria-hidden="true"></i>
              Przegląd kar
            </h2>
            <button
              onClick={() => router.push("/librarian/borrowings")}
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              Zobacz wszystkie
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <p className="text-sm text-gray-400 mb-1">Nieopłacone kary</p>
              <p className="text-2xl font-bold text-red-400">
                {(stats?.unpaidFines || 0).toFixed(2)} zł
              </p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <p className="text-sm text-gray-400 mb-1">Stawka dzienna</p>
              <p className="text-2xl font-bold text-amber-400">2.00 zł</p>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <p className="text-sm text-gray-400 mb-1">Przetrzymanych książek</p>
              <p className="text-2xl font-bold text-white">{stats?.overdueBorrowings || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </LibrarianLayout>
  );
}
