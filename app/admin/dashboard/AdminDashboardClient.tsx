/**
 * ADMIN DASHBOARD CLIENT - Interaktywny dashboard
 */

"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/app/_components/AdminLayout";
import type { UserSession } from "@/domain/types";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    trend: number;
  };
  borrowings: {
    active: number;
    overdue: number;
    trend: number;
  };
  fines: {
    unpaid: number;
    totalAmount: number;
    trend: number;
  };
  inventory: {
    totalBooks: number;
    totalCopies: number;
    available: number;
    borrowed: number;
  };
}

interface StatCardProps {
  icon: string;
  iconBg: string;
  label: string;
  value: number;
  subtitle: string;
  trend?: number;
  delay: number;
}

function StatCard({ icon, iconBg, label, value, subtitle, trend, delay }: StatCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`bg-[#141414] border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <i className={`fas ${icon} text-xl text-white`} aria-hidden="true"></i>
        </div>
        {trend !== undefined && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${trend >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            <i className={`fas fa-arrow-${trend >= 0 ? "up" : "down"} mr-1`} aria-hidden="true"></i>
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-sm text-gray-400 mb-1">{label}</h3>
      <p className="text-3xl font-bold mb-1">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

export default function AdminDashboardClient({ user }: { user: UserSession }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard-stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout user={user}>
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout user={user}>
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-12 text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4" aria-hidden="true"></i>
          <p className="text-gray-400">Nie udało się załadować statystyk</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout user={user}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Witaj, {user.firstName}! Przegląd kluczowych statystyk systemu
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <a href="/admin/users" className="block">
          <StatCard
            icon="fa-users"
            iconBg="bg-gradient-to-br from-blue-600 to-cyan-600"
            label="Użytkownicy"
            value={stats.users.total}
            subtitle={`${stats.users.active} aktywnych`}
            trend={stats.users.trend}
            delay={0}
          />
        </a>
        <a href="/admin/borrowings" className="block">
          <StatCard
            icon="fa-book-reader"
            iconBg="bg-gradient-to-br from-purple-600 to-pink-600"
            label="Wypożyczenia"
            value={stats.borrowings.active}
            subtitle={`${stats.borrowings.overdue} przetrzymane`}
            trend={stats.borrowings.trend}
            delay={100}
          />
        </a>
        <a href="/admin/fines" className="block">
          <StatCard
            icon="fa-money-bill-wave"
            iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
            label="Kary"
            value={stats.fines.unpaid}
            subtitle={`${stats.fines.totalAmount.toFixed(2)} PLN`}
            trend={stats.fines.trend}
            delay={200}
          />
        </a>
        <a href="/admin/inventory" className="block">
          <StatCard
            icon="fa-warehouse"
            iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
            label="Inwentarz"
            value={stats.inventory.totalBooks}
            subtitle={`${stats.inventory.available} dostępne`}
            delay={300}
          />
        </a>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-bolt text-purple-400" aria-hidden="true"></i>
          Szybkie akcje
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/fines"
            className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 rounded-xl transition-all group"
          >
            <i className="fas fa-money-bill-wave text-2xl text-orange-400 mb-2 group-hover:scale-110 transition-transform" aria-hidden="true"></i>
            <h3 className="font-bold mb-1">Rozlicz Kary</h3>
            <p className="text-sm text-gray-400">
              {stats.fines.unpaid} kar do rozliczenia
            </p>
          </a>
          <a
            href="/admin/inventory"
            className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 rounded-xl transition-all group"
          >
            <i className="fas fa-plus-circle text-2xl text-green-400 mb-2 group-hover:scale-110 transition-transform" aria-hidden="true"></i>
            <h3 className="font-bold mb-1">Dodaj Książkę</h3>
            <p className="text-sm text-gray-400">Nowa pozycja do katalogu</p>
          </a>
          <a
            href="/admin/reviews"
            className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 rounded-xl transition-all group"
          >
            <i className="fas fa-comment-dots text-2xl text-purple-400 mb-2 group-hover:scale-110 transition-transform" aria-hidden="true"></i>
            <h3 className="font-bold mb-1">Moderuj Recenzje</h3>
            <p className="text-sm text-gray-400">Sprawdź nowe opinie</p>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-history text-purple-400" aria-hidden="true"></i>
          Ostatnia aktywność
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <i className="fas fa-check text-green-500" aria-hidden="true"></i>
            </div>
            <div className="flex-1">
              <p className="font-medium">Nowe wypożyczenie</p>
              <p className="text-sm text-gray-400">
                Użytkownik wypożyczył książkę
              </p>
            </div>
            <span className="text-sm text-gray-500">Ostatnio</span>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <i className="fas fa-user-plus text-blue-500" aria-hidden="true"></i>
            </div>
            <div className="flex-1">
              <p className="font-medium">Nowy użytkownik</p>
              <p className="text-sm text-gray-400">Rejestracja w systemie</p>
            </div>
            <span className="text-sm text-gray-500">Dzisiaj</span>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <i className="fas fa-star text-purple-500" aria-hidden="true"></i>
            </div>
            <div className="flex-1">
              <p className="font-medium">Nowa recenzja</p>
              <p className="text-sm text-gray-400">
                Oczekuje na moderację
              </p>
            </div>
            <span className="text-sm text-gray-500">Wczoraj</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
