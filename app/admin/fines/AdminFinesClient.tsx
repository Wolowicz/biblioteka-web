/**
 * =============================================================================
 * ADMIN FINES CLIENT - Komponent kliencki regulacji kar
 * =============================================================================
 */

"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/app/_components/AdminLayout";
import type { UserSession } from "@/domain/types";

interface Fine {
  id: number;
  borrowingId: number;
  bookId: number;
  bookTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  description: string;
  status: "Naliczona" | "Zaplacona" | "Anulowana";
  createdAt: string;
  paidAt: string | null;
  daysOverdue: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminFinesClient({ user }: { user: UserSession }) {
  const [fines, setFines] = useState<Fine[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [processingFineId, setProcessingFineId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "paid">("unpaid");

  useEffect(() => {
    fetchAllFines();
  }, [statusFilter]);

  async function fetchAllFines() {
    try {
      setLoading(true);
      const url = statusFilter === "all" 
        ? "/api/fines?all=true"
        : `/api/fines?all=true&status=${statusFilter === "unpaid" ? "UNPAID" : "PAID"}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch fines");
      const data = await response.json();
      setFines(data.fines || []);
    } catch (error) {
      console.error("Error fetching fines:", error);
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers(query: string) {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to search users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  }

  async function handleSelectUser(selectedUser: User) {
    setSelectedUser(selectedUser);
    setSearchQuery("");
    setUsers([]);

    // Pobierz kary tego użytkownika
    try {
      setLoading(true);
      const response = await fetch(`/api/fines?userId=${selectedUser.id}&all=true`);
      if (!response.ok) throw new Error("Failed to fetch user fines");
      const data = await response.json();
      setFines(data.fines || []);
    } catch (error) {
      console.error("Error fetching user fines:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSettleFine(fineId: number) {
    if (!confirm("Czy na pewno chcesz rozliczyć tę karę?")) return;

    setProcessingFineId(fineId);
    try {
      const response = await fetch(`/api/fines/${fineId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Zaplacona" }),
      });

      if (!response.ok) throw new Error("Failed to settle fine");

      // Odśwież listę
      if (selectedUser) {
        await handleSelectUser(selectedUser);
      } else {
        await fetchAllFines();
      }
    } catch (error) {
      console.error("Error settling fine:", error);
      alert("Nie udało się rozliczyć kary");
    } finally {
      setProcessingFineId(null);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "Zaplacona":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
            <i className="fas fa-check-circle mr-1" aria-hidden="true"></i>
            Opłacona
          </span>
        );
      case "Anulowana":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/30">
            <i className="fas fa-ban mr-1" aria-hidden="true"></i>
            Anulowana
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
            <i className="fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
            Naliczona
          </span>
        );
    }
  }

  const totalUnpaid = fines
    .filter((f) => f.status === "Naliczona")
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <AdminLayout user={user}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Regulacja Kar</h1>
            <p className="text-gray-400">
              Zarządzaj karami i płatnościami użytkowników
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Suma nieopłaconych</p>
            <p className="text-2xl font-bold text-red-400">{totalUnpaid.toFixed(2)} PLN</p>
          </div>
        </div>
      </div>

      {/* Search User */}
      <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Wyszukaj Użytkownika</h2>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchUsers(e.target.value);
            }}
            placeholder="Wpisz nazwisko lub email..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true"></i>

          {/* Search Results */}
          {users.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                >
                  <p className="font-medium">{u.firstName} {u.lastName}</p>
                  <p className="text-sm text-gray-400">{u.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-medium">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-sm text-gray-400">{selectedUser.email}</p>
            </div>
            <button
              onClick={() => {
                setSelectedUser(null);
                fetchAllFines();
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setStatusFilter("unpaid")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            statusFilter === "unpaid"
              ? "bg-red-500 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Nieopłacone ({fines.filter((f) => f.status === "Naliczona").length})
        </button>
        <button
          onClick={() => setStatusFilter("paid")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            statusFilter === "paid"
              ? "bg-green-500 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Opłacone ({fines.filter((f) => f.status === "Zaplacona").length})
        </button>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            statusFilter === "all"
              ? "bg-purple-500 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Wszystkie ({fines.length})
        </button>
      </div>

      {/* Fines List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : fines.length === 0 ? (
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-12 text-center">
          <i className="fas fa-receipt text-4xl text-gray-600 mb-4" aria-hidden="true"></i>
          <p className="text-gray-400">Brak kar do wyświetlenia</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fines.map((fine) => (
            <div
              key={fine.id}
              className="bg-[#141414] border border-gray-800 rounded-xl p-4 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold">{fine.bookTitle}</h3>
                    {getStatusBadge(fine.status)}
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    <i className="fas fa-user mr-2" aria-hidden="true"></i>
                    {fine.userName} ({fine.userEmail})
                  </p>
                  <p className="text-sm text-gray-500">
                    {fine.description} • {fine.daysOverdue} dni spóźnienia
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Naliczona: {new Date(fine.createdAt).toLocaleDateString("pl-PL")}
                    {fine.paidAt && ` • Opłacona: ${new Date(fine.paidAt).toLocaleDateString("pl-PL")}`}
                  </p>
                </div>

                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-red-400 mb-2">
                    {fine.amount.toFixed(2)} PLN
                  </p>
                  {fine.status === "Naliczona" && (
                    <button
                      onClick={() => handleSettleFine(fine.id)}
                      disabled={processingFineId === fine.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    >
                      {processingFineId === fine.id ? (
                        <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                      ) : (
                        <>
                          <i className="fas fa-check mr-2" aria-hidden="true"></i>
                          Rozlicz
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
