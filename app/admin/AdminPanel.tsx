/**
 * =============================================================================
 * ADMIN PANEL - Panel zarządzania dla administratorów
 * =============================================================================
 * 
 * Nowoczesny panel administracyjny z prawdziwymi danymi z API.
 * 
 * @packageDocumentation
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdminPanelProps } from "@/domain/types";
import { useToast } from "@/app/_components/ui/Toast";
import { Modal, ConfirmModal } from "@/app/_components/ui/Modal";

// =============================================================================
// TYPY
// =============================================================================

interface Stats {
  users: { total: number; trend: string };
  books: { total: number; available: number; trend: string };
  borrowings: { active: number; overdue: number; trend: string };
  reservations: { pending: number };
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: number;
  type: string;
  description: string;
  entity: string;
  timestamp: string;
  userFirstName?: string;
  userLastName?: string;
}

type ModalType = "addUser" | "addBook" | "reports" | "settings" | "trash" | null;

// =============================================================================
// KOMPONENTY POMOCNICZE
// =============================================================================

function StatCard({ 
  icon, 
  iconBg, 
  value, 
  label, 
  trend, 
  trendUp,
  isAdmin,
  delay = 0
}: {
  icon: string;
  iconBg: string;
  value: number;
  label: string;
  trend?: string;
  trendUp?: boolean;
  isAdmin: boolean;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`p-6 rounded-2xl border transition-all duration-500 card-hover ${
        isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <i className={`fas ${icon}`} aria-hidden="true"></i>
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
            trendUp 
              ? isAdmin ? "bg-emerald-500/10 text-emerald-400" : "bg-green-100 text-green-700"
              : isAdmin ? "bg-amber-500/10 text-amber-400" : "bg-yellow-100 text-yellow-700"
          }`}>
            {trend} {trendUp ? "↑" : "↓"}
          </span>
        )}
      </div>
      <p className={`text-3xl font-bold ${isAdmin ? "text-white" : "text-slate-900"}`}>
        {value.toLocaleString("pl-PL")}
      </p>
      <p className={`text-sm mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>
        {label}
      </p>
    </div>
  );
}

function ActionButton({
  icon,
  iconColor,
  title,
  subtitle,
  onClick,
  isAdmin,
  delay = 0
}: {
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onClick: () => void;
  isAdmin: boolean;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg btn-interactive ${
        isAdmin 
          ? "bg-slate-800/50 border-slate-700 hover:border-slate-500" 
          : "bg-white border-gray-200 hover:border-gray-300"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <i className={`fas ${icon} text-lg mb-2 ${iconColor}`} aria-hidden="true"></i>
      <p className={`font-medium ${isAdmin ? "text-white" : "text-slate-900"}`}>{title}</p>
      <p className={`text-xs mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p>
    </button>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const iconMap: Record<string, { icon: string; color: string }> = {
    USER_REGISTERED: { icon: "fa-user-plus", color: "text-indigo-400" },
    BOOK_BORROWED: { icon: "fa-book", color: "text-blue-400" },
    BOOK_RETURNED: { icon: "fa-check-circle", color: "text-emerald-400" },
    RESERVATION_MADE: { icon: "fa-bookmark", color: "text-purple-400" },
    BOOK_ADDED: { icon: "fa-book-medical", color: "text-teal-400" },
    LOGIN: { icon: "fa-sign-in-alt", color: "text-sky-400" },
    LOGOUT: { icon: "fa-sign-out-alt", color: "text-slate-400" },
    DEFAULT: { icon: "fa-circle", color: "text-gray-400" }
  };
  
  const { icon, color } = iconMap[type] || iconMap.DEFAULT;
  return <i className={`fas ${icon} ${color}`} aria-hidden="true"></i>;
}

// =============================================================================
// FORMULARZE W MODALACH
// =============================================================================

function AddUserForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "READER"
  });
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd rejestracji");
      }

      toast.success("Użytkownik dodany", `${formData.firstName} ${formData.lastName} został zarejestrowany`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Błąd", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Imię</label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="Jan"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nazwisko</label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="Kowalski"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          placeholder="jan@biblioteka.pl"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Hasło</label>
        <input
          type="password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Rola</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        >
          <option value="READER">Czytelnik</option>
          <option value="LIBRARIAN">Bibliotekarz</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              Dodawanie...
            </>
          ) : (
            <>
              <i className="fas fa-user-plus" aria-hidden="true"></i>
              Dodaj użytkownika
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function AddBookForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    publisher: "",
    publicationYear: new Date().getFullYear(),
    totalCopies: 1,
    description: ""
  });
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd dodawania książki");
      }

      toast.success("Książka dodana", `"${formData.title}" została dodana do katalogu`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Błąd", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tytuł</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          placeholder="Tytuł książki"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Autor</label>
          <input
            type="text"
            required
            value={formData.author}
            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Imię i nazwisko"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ISBN</label>
          <input
            type="text"
            required
            value={formData.isbn}
            onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="978-0-12-345678-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gatunek</label>
          <select
            value={formData.genre}
            onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="">Wybierz gatunek</option>
            <option value="Beletrystyka">Beletrystyka</option>
            <option value="Fantastyka">Fantastyka</option>
            <option value="Kryminał">Kryminał</option>
            <option value="Science Fiction">Science Fiction</option>
            <option value="Romans">Romans</option>
            <option value="Horror">Horror</option>
            <option value="Biografia">Biografia</option>
            <option value="Historia">Historia</option>
            <option value="Naukowe">Naukowe</option>
            <option value="Poradnik">Poradnik</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Wydawnictwo</label>
          <input
            type="text"
            value={formData.publisher}
            onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Nazwa wydawnictwa"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rok wydania</label>
          <input
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            value={formData.publicationYear}
            onChange={(e) => setFormData(prev => ({ ...prev, publicationYear: parseInt(e.target.value) }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Liczba egzemplarzy</label>
          <input
            type="number"
            min="1"
            value={formData.totalCopies}
            onChange={(e) => setFormData(prev => ({ ...prev, totalCopies: parseInt(e.target.value) }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Opis (opcjonalnie)</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
          placeholder="Krótki opis książki..."
        />
      </div>

      <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              Dodawanie...
            </>
          ) : (
            <>
              <i className="fas fa-book-medical" aria-hidden="true"></i>
              Dodaj książkę
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function ReportsPanel({ isAdmin }: { isAdmin: boolean }) {
  const [generating, setGenerating] = useState<string | null>(null);
  const toast = useToast();

  const reports = [
    { id: "borrowings", icon: "fa-book", title: "Raport wypożyczeń", desc: "Lista wszystkich wypożyczeń" },
    { id: "overdue", icon: "fa-exclamation-triangle", title: "Książki przeterminowane", desc: "Zwroty po terminie" },
    { id: "users", icon: "fa-users", title: "Aktywni użytkownicy", desc: "Statystyki czytelników" },
    { id: "popular", icon: "fa-fire", title: "Popularne książki", desc: "Najczęściej wypożyczane" },
  ];

  const handleGenerate = async (reportId: string) => {
    setGenerating(reportId);
    // Symulacja generowania raportu
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Raport wygenerowany", "Plik PDF został pobrany");
    setGenerating(null);
  };

  return (
    <div className="space-y-3">
      {reports.map(report => (
        <button
          key={report.id}
          onClick={() => handleGenerate(report.id)}
          disabled={generating !== null}
          className={`w-full p-4 rounded-xl border text-left transition-all hover:shadow-md ${
            isAdmin 
              ? "bg-slate-800/50 border-slate-700 hover:border-purple-500/50" 
              : "bg-white border-gray-200 hover:border-purple-300"
          } ${generating === report.id ? "opacity-70" : ""}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isAdmin ? "bg-purple-500/20" : "bg-purple-100"}`}>
              <i className={`fas ${report.icon} ${isAdmin ? "text-purple-400" : "text-purple-600"}`} aria-hidden="true"></i>
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isAdmin ? "text-white" : "text-slate-900"}`}>{report.title}</p>
              <p className={`text-sm ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>{report.desc}</p>
            </div>
            {generating === report.id ? (
              <i className="fas fa-spinner fa-spin text-purple-500" aria-hidden="true"></i>
            ) : (
              <i className={`fas fa-download ${isAdmin ? "text-slate-500" : "text-slate-400"}`} aria-hidden="true"></i>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// KOMPONENT GŁÓWNY
// =============================================================================

export default function AdminPanel({ user }: AdminPanelProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const toast = useToast();
  
  const role = user.role;
  const isAdmin = role === "ADMIN";

  // Pobierz statystyki
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Błąd pobierania danych");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      toast.error("Błąd", "Nie udało się pobrać statystyk");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Formatuj czas względny
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

  return (
    <div className="space-y-8">
      {/* ================================================================ */}
      {/* NAGŁÓWEK Z STATUSEM */}
      {/* ================================================================ */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isAdmin ? "text-white" : "text-slate-900"}`}>
            Panel Zarządzania
          </h1>
          <p className={`text-sm mt-1 ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>
            Witaj, {user.firstName} {user.lastName}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${isAdmin ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-green-100 text-green-700"}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System aktywny
        </div>
      </div>

      {/* ================================================================ */}
      {/* STATYSTYKI */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          // Skeleton loading
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className={`p-6 rounded-2xl border animate-pulse ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${isAdmin ? "bg-slate-700" : "bg-slate-200"}`}></div>
                  <div className={`w-16 h-6 rounded-full ${isAdmin ? "bg-slate-700" : "bg-slate-200"}`}></div>
                </div>
                <div className={`h-8 w-24 rounded ${isAdmin ? "bg-slate-700" : "bg-slate-200"} mb-2`}></div>
                <div className={`h-4 w-32 rounded ${isAdmin ? "bg-slate-700" : "bg-slate-200"}`}></div>
              </div>
            ))}
          </>
        ) : stats && (
          <>
            <StatCard
              icon="fa-users"
              iconBg={isAdmin ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-100 text-indigo-600"}
              value={stats.users.total}
              label="Aktywnych użytkowników"
              trend={stats.users.trend.replace("+", "").replace("-", "")}
              trendUp={stats.users.trend.startsWith("+")}
              isAdmin={isAdmin}
              delay={100}
            />
            <StatCard
              icon="fa-book"
              iconBg={isAdmin ? "bg-blue-500/10 text-blue-400" : "bg-blue-100 text-blue-600"}
              value={stats.books.total}
              label="Książek w katalogu"
              trend={stats.books.trend.replace("+", "").replace("-", "")}
              trendUp={stats.books.trend.startsWith("+")}
              isAdmin={isAdmin}
              delay={200}
            />
            <StatCard
              icon="fa-exchange-alt"
              iconBg={isAdmin ? "bg-purple-500/10 text-purple-400" : "bg-purple-100 text-purple-600"}
              value={stats.borrowings.active}
              label="Aktywnych wypożyczeń"
              trend={stats.borrowings.trend.replace("+", "").replace("-", "")}
              trendUp={stats.borrowings.trend.startsWith("+")}
              isAdmin={isAdmin}
              delay={300}
            />
          </>
        )}
      </div>

      {/* Dodatkowe statystyki */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          {/* Przeterminowane */}
          {stats.borrowings.overdue > 0 && (
            <div className={`p-4 rounded-xl border ${isAdmin ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isAdmin ? "bg-red-500/20" : "bg-red-100"}`}>
                  <i className={`fas fa-exclamation-circle ${isAdmin ? "text-red-400" : "text-red-600"}`} aria-hidden="true"></i>
                </div>
                <div>
                  <p className={`font-semibold ${isAdmin ? "text-red-400" : "text-red-700"}`}>
                    {stats.borrowings.overdue} przeterminowanych
                  </p>
                  <p className={`text-sm ${isAdmin ? "text-red-300/70" : "text-red-600"}`}>
                    Książki wymagające interwencji
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Oczekujące rezerwacje */}
          {stats.reservations.pending > 0 && (
            <div className={`p-4 rounded-xl border ${isAdmin ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isAdmin ? "bg-amber-500/20" : "bg-amber-100"}`}>
                  <i className={`fas fa-clock ${isAdmin ? "text-amber-400" : "text-amber-600"}`} aria-hidden="true"></i>
                </div>
                <div>
                  <p className={`font-semibold ${isAdmin ? "text-amber-400" : "text-amber-700"}`}>
                    {stats.reservations.pending} oczekujących rezerwacji
                  </p>
                  <p className={`text-sm ${isAdmin ? "text-amber-300/70" : "text-amber-600"}`}>
                    Książki do przygotowania
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* SZYBKIE AKCJE */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionButton
          icon="fa-user-plus"
          iconColor={isAdmin ? "text-indigo-400" : "text-indigo-600"}
          title="Dodaj użytkownika"
          subtitle="Nowe konto"
          onClick={() => setActiveModal("addUser")}
          isAdmin={isAdmin}
          delay={400}
        />
        <ActionButton
          icon="fa-book-medical"
          iconColor={isAdmin ? "text-blue-400" : "text-blue-600"}
          title="Dodaj książkę"
          subtitle="Nowa pozycja"
          onClick={() => setActiveModal("addBook")}
          isAdmin={isAdmin}
          delay={500}
        />
        <ActionButton
          icon="fa-chart-line"
          iconColor={isAdmin ? "text-purple-400" : "text-purple-600"}
          title="Raporty"
          subtitle="Statystyki"
          onClick={() => setActiveModal("reports")}
          isAdmin={isAdmin}
          delay={600}
        />
        <ActionButton
          icon="fa-cog"
          iconColor={isAdmin ? "text-amber-400" : "text-amber-600"}
          title="Ustawienia"
          subtitle="Konfiguracja"
          onClick={() => setActiveModal("settings")}
          isAdmin={isAdmin}
          delay={700}
        />
      </div>

      {/* ================================================================ */}
      {/* OSTATNIA AKTYWNOŚĆ */}
      {/* ================================================================ */}
      <div className={`rounded-2xl border overflow-hidden animate-fade-in-up ${isAdmin ? "bg-slate-800/30 border-slate-700" : "bg-white border-gray-200"}`} style={{ animationDelay: "0.8s" }}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isAdmin ? "border-slate-700" : "border-gray-100"}`}>
          <h2 className={`font-semibold ${isAdmin ? "text-white" : "text-slate-900"}`}>Ostatnia aktywność</h2>
          <button 
            onClick={fetchStats}
            className={`text-sm flex items-center gap-2 transition-colors ${isAdmin ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`}
          >
            <i className="fas fa-sync-alt" aria-hidden="true"></i>
            Odśwież
          </button>
        </div>
        <div className={`divide-y ${isAdmin ? "divide-slate-700/50" : "divide-gray-100"}`}>
          {loading ? (
            // Skeleton
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className={`w-10 h-10 rounded-lg ${isAdmin ? "bg-slate-700" : "bg-slate-200"}`}></div>
                  <div className="flex-1">
                    <div className={`h-4 w-48 rounded ${isAdmin ? "bg-slate-700" : "bg-slate-200"} mb-2`}></div>
                    <div className={`h-3 w-24 rounded ${isAdmin ? "bg-slate-700" : "bg-slate-200"}`}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((item, i) => (
              <div 
                key={item.id} 
                className={`px-6 py-4 flex items-center gap-4 transition-colors ${isAdmin ? "hover:bg-slate-700/30" : "hover:bg-gray-50"}`}
                style={{ animationDelay: `${0.9 + i * 0.1}s` }}
              >
                <div className={`p-2 rounded-lg ${isAdmin ? "bg-slate-700/50" : "bg-slate-100"}`}>
                  <ActivityIcon type={item.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${isAdmin ? "text-white" : "text-slate-900"}`}>
                    {item.description}
                  </p>
                  <p className={`text-xs ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>
                    {item.userFirstName && item.userLastName 
                      ? `${item.userFirstName} ${item.userLastName}`
                      : "System"
                    }
                  </p>
                </div>
                <span className={`text-xs whitespace-nowrap ${isAdmin ? "text-slate-500" : "text-slate-400"}`}>
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <i className={`fas fa-inbox text-4xl mb-3 ${isAdmin ? "text-slate-600" : "text-slate-300"}`} aria-hidden="true"></i>
              <p className={`text-sm ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Brak ostatniej aktywności</p>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* KOSZ */}
      {/* ================================================================ */}
      <div className={`p-6 rounded-2xl border animate-fade-in-up ${isAdmin ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-200"}`} style={{ animationDelay: "1s" }}>
        <h2 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${isAdmin ? "text-red-400" : "text-red-700"}`}>
          <i className="fas fa-trash" aria-hidden="true"></i>
          Kosz
        </h2>
        <p className={`text-sm mb-4 ${isAdmin ? "text-red-300/70" : "text-red-600"}`}>
          Elementy usunięte logicznie. Możesz je przywrócić lub usunąć trwale.
        </p>
        <button 
          onClick={() => setActiveModal("trash")}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all btn-interactive ${isAdmin ? "bg-red-500/20 hover:bg-red-500/30 text-red-400" : "bg-red-100 hover:bg-red-200 text-red-700"}`}
        >
          <i className="fas fa-folder-open" aria-hidden="true"></i>
          Przeglądaj kosz
        </button>
      </div>

      {/* ================================================================ */}
      {/* MODALE */}
      {/* ================================================================ */}
      
      {/* Modal: Dodaj użytkownika */}
      <Modal
        isOpen={activeModal === "addUser"}
        onClose={() => setActiveModal(null)}
        title="Dodaj nowego użytkownika"
        size="md"
      >
        <AddUserForm onClose={() => setActiveModal(null)} onSuccess={fetchStats} />
      </Modal>

      {/* Modal: Dodaj książkę */}
      <Modal
        isOpen={activeModal === "addBook"}
        onClose={() => setActiveModal(null)}
        title="Dodaj nową książkę"
        size="lg"
      >
        <AddBookForm onClose={() => setActiveModal(null)} onSuccess={fetchStats} />
      </Modal>

      {/* Modal: Raporty */}
      <Modal
        isOpen={activeModal === "reports"}
        onClose={() => setActiveModal(null)}
        title="Generuj raport"
        size="md"
      >
        <ReportsPanel isAdmin={isAdmin} />
      </Modal>

      {/* Modal: Ustawienia */}
      <Modal
        isOpen={activeModal === "settings"}
        onClose={() => setActiveModal(null)}
        title="Ustawienia systemu"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-500 text-sm">
            Konfiguracja systemu bibliotecznego. Niektóre opcje są dostępne tylko dla administratorów.
          </p>
          <div className={`p-4 rounded-xl border ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isAdmin ? "text-white" : "text-slate-900"}`}>Powiadomienia email</p>
                <p className={`text-sm ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Automatyczne przypomnienia o terminach</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-indigo-600 relative">
                <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></span>
              </button>
            </div>
          </div>
          <div className={`p-4 rounded-xl border ${isAdmin ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isAdmin ? "text-white" : "text-slate-900"}`}>Tryb ciemny</p>
                <p className={`text-sm ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Preferowany motyw kolorystyczny</p>
              </div>
              <button className={`w-12 h-6 rounded-full relative ${isAdmin ? "bg-indigo-600" : "bg-slate-300"}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white ${isAdmin ? "right-1" : "left-1"}`}></span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Kosz */}
      <Modal
        isOpen={activeModal === "trash"}
        onClose={() => setActiveModal(null)}
        title="Kosz systemowy"
        size="lg"
      >
        <div className="text-center py-8">
          <i className={`fas fa-trash-alt text-5xl mb-4 ${isAdmin ? "text-slate-600" : "text-slate-300"}`} aria-hidden="true"></i>
          <p className={`${isAdmin ? "text-slate-400" : "text-slate-500"}`}>Kosz jest pusty</p>
          <p className={`text-sm mt-1 ${isAdmin ? "text-slate-500" : "text-slate-400"}`}>Usunięte elementy pojawią się tutaj</p>
        </div>
      </Modal>
    </div>
  );
}
