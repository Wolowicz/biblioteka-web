"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/app/_components/AdminLayout";
import type { UserSession } from "@/domain/types";

interface Borrowing {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  copyId: number;
  copyBarcode: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: "Aktywne" | "Zakonczone" | "Przedluzone";
  overdue: boolean;
  daysOverdue: number;
  fineAmount: number;
}

export default function AdminBorrowingsClient({ user }: { user: UserSession }) {
  const router = useRouter();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "Aktywne" | "overdue">("all");
  const [searchUser, setSearchUser] = useState("");
  const [searchBook, setSearchBook] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchBorrowings();
  }, [statusFilter, searchUser, searchBook]);

  async function fetchBorrowings() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("all", "true"); // Admin/Bibliotekarz widzi wszystkie
      if (statusFilter === "Aktywne") params.append("status", "ACTIVE");
      if (statusFilter === "overdue") params.append("status", "OVERDUE");
      if (searchUser) params.append("user", searchUser);
      if (searchBook) params.append("book", searchBook);

      const response = await fetch(`/api/borrowings?${params.toString()}`);
      const data = await response.json();
      
      // Map dane do interfejsu Borrowing
      const mappedBorrowings = (data.borrowings || []).map((b: any) => ({
        id: b.id,
        userId: b.userId,
        userName: b.userName,
        userEmail: b.userEmail,
        bookId: b.bookId,
        bookTitle: b.bookTitle,
        bookAuthor: "", // API nie zwraca autora w getAllBorrowings
        copyId: b.copyId,
        copyBarcode: b.copyNumber || "",
        borrowDate: b.borrowDate,
        dueDate: b.dueDate,
        returnDate: b.returnDate,
        status: b.status || "Aktywne",
        overdue: !b.returnDate && new Date(b.dueDate) < new Date(),
        daysOverdue: !b.returnDate ? Math.max(0, Math.floor((new Date().getTime() - new Date(b.dueDate).getTime()) / (1000 * 60 * 60 * 24))) : 0,
        fineAmount: 0, // Kary można pobrać osobno
      }));
      
      setBorrowings(mappedBorrowings);
    } catch (error) {
      console.error("Błąd pobierania wypożyczeń:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExtend(borrowingId: number) {
    if (processing) return;
    if (!confirm("Czy na pewno chcesz przedłużyć to wypożyczenie o 14 dni?")) return;

    try {
      setProcessing(borrowingId);
      const response = await fetch(`/api/borrowings/${borrowingId}/extend`, {
        method: "POST",
      });

      if (response.ok) {
        fetchBorrowings();
      } else {
        const data = await response.json();
        alert(data.error || "Błąd przedłużenia wypożyczenia");
      }
    } catch (error) {
      console.error("Błąd przedłużenia:", error);
      alert("Wystąpił błąd podczas przedłużania");
    } finally {
      setProcessing(null);
    }
  }

  async function handleForceReturn(borrowingId: number) {
    if (processing) return;
    if (!confirm("Czy na pewno chcesz wymusić zwrot tej książki? (dla zagubionej/zniszczonej)")) return;

    try {
      setProcessing(borrowingId);
      const response = await fetch(`/api/books/${borrowingId}/force-return`, {
        method: "POST",
      });

      if (response.ok) {
        fetchBorrowings();
      } else {
        const data = await response.json();
        alert(data.error || "Błąd wymuszenia zwrotu");
      }
    } catch (error) {
      console.error("Błąd wymuszenia zwrotu:", error);
      alert("Wystąpił błąd podczas wymuszania zwrotu");
    } finally {
      setProcessing(null);
    }
  }

  async function handleWaiveFine(borrowingId: number) {
    if (processing) return;
    if (!confirm("Czy na pewno chcesz anulować wszystkie kary dla tego wypożyczenia?")) return;

    try {
      setProcessing(borrowingId);
      // Find all fines for this borrowing
      const finesResponse = await fetch(`/api/fines?borrowingId=${borrowingId}`);
      const finesData = await finesResponse.json();
      
      // Waive each unpaid fine
      for (const fine of finesData.fines || []) {
        if (fine.status === "Naliczona") {
          await fetch(`/api/fines/${fine.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Anulowana" }),
          });
        }
      }

      fetchBorrowings();
      alert("Kary zostały anulowane");
    } catch (error) {
      console.error("Błąd anulowania kar:", error);
      alert("Wystąpił błąd podczas anulowania kar");
    } finally {
      setProcessing(null);
    }
  }

  function getStatusBadge(borrowing: Borrowing) {
    if (borrowing.status === "Zakonczone") {
      return <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">Zakończone</span>;
    }
    if (borrowing.overdue) {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-300">
          Przeterminowane ({borrowing.daysOverdue} dni)
        </span>
      );
    }
    if (borrowing.status === "Przedluzone") {
      return <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300">Przedłużone</span>;
    }
    return <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300">Aktywne</span>;
  }

  return (
    <AdminLayout user={user}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Wypożyczenia
          </h1>
          <p className="text-gray-400">Zarządzaj wypożyczeniami i zwrotami</p>
        </div>
        <button
          onClick={() => router.push("/admin/fines")}
          className="px-6 py-3 bg-linear-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all flex items-center gap-2"
        >
          <i className="fas fa-money-bill-wave" aria-hidden="true"></i>
          Regulacja Kar
        </button>
      </div>

      {/* Filtry */}
      <div className="bg-[#141414] rounded-xl p-6 border border-white/5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">Wszystkie</option>
              <option value="Aktywne">Aktywne</option>
              <option value="overdue">Przeterminowane</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Użytkownik</label>
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Imię lub nazwisko..."
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Książka</label>
            <input
              type="text"
              value={searchBook}
              onChange={(e) => setSearchBook(e.target.value)}
              placeholder="Tytuł książki..."
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Tabela wypożyczeń */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-gray-400 mt-4">Ładowanie wypożyczeń...</p>
        </div>
      ) : borrowings.length === 0 ? (
        <div className="bg-[#141414] rounded-xl p-12 border border-white/5 text-center">
          <i className="fas fa-inbox text-4xl text-gray-600 mb-4" aria-hidden="true"></i>
          <p className="text-gray-400">Brak wypożyczeń spełniających kryteria</p>
        </div>
      ) : (
        <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0A0A] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Użytkownik
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Książka
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Data wypożyczenia
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Termin zwrotu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Kara
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {borrowings.map((borrowing) => (
                  <tr key={borrowing.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{borrowing.userName}</div>
                      <div className="text-sm text-gray-400">{borrowing.userEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{borrowing.bookTitle}</div>
                      <div className="text-sm text-gray-400">{borrowing.bookAuthor}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(borrowing.borrowDate).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(borrowing.dueDate).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(borrowing)}</td>
                    <td className="px-6 py-4">
                      {borrowing.fineAmount > 0 ? (
                        <span className="text-red-400 font-medium">{borrowing.fineAmount.toFixed(2)} zł</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {borrowing.status === "Aktywne" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExtend(borrowing.id)}
                            disabled={processing === borrowing.id}
                            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-xs disabled:opacity-50"
                            title="Przedłuż o 14 dni"
                          >
                            <i className="fas fa-clock" aria-hidden="true"></i>
                          </button>
                          {user.role === "ADMIN" && (
                            <>
                              <button
                                onClick={() => handleForceReturn(borrowing.id)}
                                disabled={processing === borrowing.id}
                                className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors text-xs disabled:opacity-50"
                                title="Wymuś zwrot"
                              >
                                <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                              </button>
                              {borrowing.fineAmount > 0 && (
                                <button
                                  onClick={() => handleWaiveFine(borrowing.id)}
                                  disabled={processing === borrowing.id}
                                  className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors text-xs disabled:opacity-50"
                                  title="Anuluj kary"
                                >
                                  <i className="fas fa-hand-holding-usd" aria-hidden="true"></i>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Zakończone</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
