"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";

interface Fine {
  id: number;
  borrowingId: number;
  bookId: number;
  bookTitle: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
  daysOverdue: number;
}

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "UNPAID" | "PAID">("all");
  const router = useRouter();

  const fetchFines = useCallback(async () => {
    try {
      setLoading(true);
      const url = filter === "all" ? "/api/fines" : `/api/fines?status=${filter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Błąd");
      const data = await response.json();
      setFines(data.fines || []);
    } catch {
      console.error("Błąd ładowania kar");
      setFines([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchFines(); }, [fetchFines]);

  // Statusy z bazy: Naliczona, Zaplacona, Anulowana
  const totalUnpaid = fines.filter(f => f.status === "Naliczona").reduce((sum, f) => sum + f.amount, 0);
  const unpaidCount = fines.filter(f => f.status === "Naliczona").length;
  const paidCount = fines.filter(f => f.status === "Zaplacona").length;

  const getStatusBadge = (status: string) => {
    if (status === "Zaplacona") return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Opłacona</span>;
    if (status === "Naliczona") return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Nieopłacona</span>;
    if (status === "Anulowana") return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Anulowana</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
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
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Moje kary</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="text-2xl font-bold text-red-600">{totalUnpaid.toFixed(2)} zł</div>
          <div className="text-sm text-gray-500">Do zapłaty</div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{unpaidCount}</div>
          <div className="text-sm text-gray-500">Nieopłaconych</div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{paidCount}</div>
          <div className="text-sm text-gray-500">Opłaconych</div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg font-medium ${filter === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          Wszystkie
        </button>
        <button onClick={() => setFilter("UNPAID")} className={`px-4 py-2 rounded-lg font-medium ${filter === "UNPAID" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          Nieopłacone
        </button>
        <button onClick={() => setFilter("PAID")} className={`px-4 py-2 rounded-lg font-medium ${filter === "PAID" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          Opłacone
        </button>
      </div>

      {/* Table */}
      {fines.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center text-green-700">
          Brak kar do wyświetlenia
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 font-medium text-gray-700">Książka</th>
                <th className="text-left p-4 font-medium text-gray-700">Kwota</th>
                <th className="text-left p-4 font-medium text-gray-700">Dni spóźnienia</th>
                <th className="text-left p-4 font-medium text-gray-700">Data naliczenia</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Data opłacenia</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((fine) => (
                <tr key={fine.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <button
                      onClick={() => router.push(`/books/${fine.bookId}`)}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium text-left"
                    >
                      {fine.bookTitle}
                    </button>
                  </td>
                  <td className="p-4 font-semibold">{fine.amount.toFixed(2)} zł</td>
                  <td className="p-4">{fine.daysOverdue}</td>
                  <td className="p-4">{new Date(fine.createdAt).toLocaleDateString("pl-PL")}</td>
                  <td className="p-4">{getStatusBadge(fine.status)}</td>
                  <td className="p-4">{fine.paidAt ? new Date(fine.paidAt).toLocaleDateString("pl-PL") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalUnpaid > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 flex items-center gap-2">
          <span className="text-amber-600">⚠️</span>
          <span className="text-amber-800">Masz nieopłacone kary. Prosimy o uregulowanie należności w bibliotece.</span>
        </div>
      )}
    </AppShell>
  );
}
