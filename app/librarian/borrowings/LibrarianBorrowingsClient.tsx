"use client";

import { useState, useEffect, useCallback } from "react";
import LibrarianLayout from "@/app/_components/LibrarianLayout";
import type { UserSession } from "@/domain/types";

interface Borrowing {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  copyId: number;
  copyNumber: string;
  bookId: number;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  extensions: number;
}

interface Fine {
  id: number;
  borrowingId: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  bookTitle?: string;
}

interface BookForBorrowing {
  id: number;
  title: string;
  availableCopies: number;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export default function LibrarianBorrowingsClient({ user }: { user: UserSession }) {
  const [activeSection, setActiveSection] = useState<"borrowings" | "fines">("borrowings");
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "overdue" | "all">("active");
  const [finesTab, setFinesTab] = useState<"unpaid" | "paid" | "all">("unpaid");
  
  // Modal states
  const [showNewModal, setShowNewModal] = useState(false);
  const [books, setBooks] = useState<BookForBorrowing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [returning, setReturning] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [settlingFine, setSettlingFine] = useState<number | null>(null);

  const fetchBorrowings = useCallback(async () => {
    try {
      let url = "/api/borrowings?all=true";
      if (activeTab === "active") url += "&status=ACTIVE";
      else if (activeTab === "overdue") url += "&status=OVERDUE";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Błąd");
      const data = await response.json();
      setBorrowings(data.borrowings || []);
    } catch {
      console.error("Błąd ładowania wypożyczeń");
      setBorrowings([]);
    }
  }, [activeTab]);

  const fetchFines = useCallback(async () => {
    try {
      let url = "/api/fines?all=true";
      if (finesTab === "unpaid") url += "&status=NIEOPLACONA";
      else if (finesTab === "paid") url += "&status=OPLACONA";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Błąd");
      const data = await response.json();
      setFines(data.fines || []);
    } catch {
      console.error("Błąd ładowania kar");
      setFines([]);
    }
  }, [finesTab]);

  const fetchBooksAndUsers = async () => {
    try {
      const [booksRes, usersRes] = await Promise.all([
        fetch("/api/books?available=true"),
        fetch("/api/admin/users?role=READER")
      ]);
      const booksData = await booksRes.json();
      const usersData = await usersRes.json();
      setBooks(booksData.books || []);
      setUsers(usersData.users || []);
    } catch {
      console.error("Błąd ładowania danych");
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeSection === "borrowings") {
      fetchBorrowings().finally(() => setLoading(false));
    } else {
      fetchFines().finally(() => setLoading(false));
    }
  }, [activeSection, fetchBorrowings, fetchFines]);

  const handleOpenNewModal = () => {
    fetchBooksAndUsers();
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 30);
    setDueDate(defaultDue.toISOString().split("T")[0]);
    setShowNewModal(true);
  };

  const handleCreateBorrowing = async () => {
    if (!selectedBook || !selectedUser || !dueDate) return;
    setCreating(true);
    try {
      const response = await fetch("/api/borrowings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: selectedBook, userId: selectedUser, dueDate }),
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Błąd tworzenia wypożyczenia");
        return;
      }
      setShowNewModal(false);
      setSelectedBook(null);
      setSelectedUser(null);
      setUserSearch("");
      setBookSearch("");
      fetchBorrowings();
    } catch {
      alert("Błąd tworzenia wypożyczenia");
    } finally {
      setCreating(false);
    }
  };

  const handleReturn = async (borrowingId: number) => {
    if (!confirm("Czy na pewno oznaczyć jako zwrócone?")) return;
    setReturning(borrowingId);
    try {
      const response = await fetch(`/api/borrowings/${borrowingId}/return`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Błąd zwrotu");
        return;
      }
      fetchBorrowings();
    } catch {
      alert("Błąd zwrotu");
    } finally {
      setReturning(null);
    }
  };

  const handleSettleFine = async (fineId: number) => {
    if (!confirm("Czy na pewno oznaczyć karę jako opłaconą?")) return;
    setSettlingFine(fineId);
    try {
      const response = await fetch(`/api/fines/${fineId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "OPLACONA" }),
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Błąd rozliczania kary");
        return;
      }
      fetchFines();
    } catch {
      alert("Błąd rozliczania kary");
    } finally {
      setSettlingFine(null);
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== "ZWROCONA";
    if (status === "ZWROCONA") return <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Zwrócona</span>;
    if (isOverdue) return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Przetrzymana</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">Aktywna</span>;
  };

  const getFineStatusBadge = (status: string) => {
    if (status === "OPLACONA") return <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Opłacona</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Nieopłacona</span>;
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) && b.availableCopies > 0
  );

  return (
    <LibrarianLayout user={user}>
      {/* Section Toggle */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setActiveSection("borrowings")}
          className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
            activeSection === "borrowings"
              ? "bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
              : "bg-[#2D2D35] text-gray-400 hover:bg-[#3D3D45] hover:text-white border border-gray-700/50"
          }`}
        >
          <i className="fas fa-book-reader"></i>
          Wypożyczenia
        </button>
        <button
          onClick={() => setActiveSection("fines")}
          className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
            activeSection === "fines"
              ? "bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
              : "bg-[#2D2D35] text-gray-400 hover:bg-[#3D3D45] hover:text-white border border-gray-700/50"
          }`}
        >
          <i className="fas fa-coins"></i>
          Kary finansowe
        </button>
      </div>

      {/* Borrowings Section */}
      {activeSection === "borrowings" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <i className="fas fa-book-reader text-white"></i>
                </div>
                Zarządzanie wypożyczeniami
              </h2>
              <p className="text-gray-400 mt-1">Twórz, przeglądaj i rozliczaj wypożyczenia</p>
            </div>
            <button
              onClick={handleOpenNewModal}
              className="px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
            >
              <i className="fas fa-plus"></i>
              Nowe wypożyczenie
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-[#2D2D35] p-1 rounded-lg border border-gray-700/50 w-fit">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "active" ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <i className="fas fa-clock mr-2"></i>Aktywne
            </button>
            <button
              onClick={() => setActiveTab("overdue")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "overdue" ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <i className="fas fa-exclamation-triangle mr-2"></i>Przetrzymane
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

          {/* Table */}
          {loading ? (
            <div className="bg-[#2D2D35] rounded-xl p-8 flex items-center justify-center border border-gray-700/50">
              <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
          ) : borrowings.length === 0 ? (
            <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-12 text-center">
              <i className="fas fa-inbox text-5xl text-gray-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-white mb-2">Brak wypożyczeń</h3>
              <p className="text-gray-400">Nie znaleziono wypożyczeń dla wybranych filtrów</p>
            </div>
          ) : (
            <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#1F1F23] border-b border-gray-700/50">
                      <th className="text-left p-4 font-medium text-gray-300">Czytelnik</th>
                      <th className="text-left p-4 font-medium text-gray-300">Książka</th>
                      <th className="text-left p-4 font-medium text-gray-300">Egzemplarz</th>
                      <th className="text-left p-4 font-medium text-gray-300">Wypożyczono</th>
                      <th className="text-left p-4 font-medium text-gray-300">Termin</th>
                      <th className="text-left p-4 font-medium text-gray-300">Status</th>
                      <th className="text-left p-4 font-medium text-gray-300">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowings.map((b) => (
                      <tr key={b.id} className="border-b border-gray-700/30 hover:bg-[#3D3D45]/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{b.userName}</div>
                          <div className="text-sm text-gray-400">{b.userEmail}</div>
                        </td>
                        <td className="p-4 text-gray-300 max-w-xs truncate">{b.bookTitle}</td>
                        <td className="p-4 text-gray-400 font-mono text-sm">{b.copyNumber}</td>
                        <td className="p-4 text-gray-400">{new Date(b.borrowDate).toLocaleDateString("pl-PL")}</td>
                        <td className="p-4 text-gray-400">{new Date(b.dueDate).toLocaleDateString("pl-PL")}</td>
                        <td className="p-4">{getStatusBadge(b.status, b.dueDate)}</td>
                        <td className="p-4">
                          {b.status !== "ZWROCONA" && (
                            <button
                              onClick={() => handleReturn(b.id)}
                              disabled={returning === b.id}
                              className="px-3 py-1.5 text-sm bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 disabled:opacity-50 border border-emerald-500/30 transition-colors flex items-center gap-1.5"
                            >
                              {returning === b.id ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <>
                                  <i className="fas fa-undo"></i>
                                  Zwróć
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fines Section */}
      {activeSection === "fines" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <i className="fas fa-coins text-white"></i>
                </div>
                Zarządzanie karami
              </h2>
              <p className="text-gray-400 mt-1">Przeglądaj i rozliczaj kary finansowe</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-[#2D2D35] p-1 rounded-lg border border-gray-700/50 w-fit">
            <button
              onClick={() => setFinesTab("unpaid")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                finesTab === "unpaid" ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <i className="fas fa-exclamation-circle mr-2"></i>Nieopłacone
            </button>
            <button
              onClick={() => setFinesTab("paid")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                finesTab === "paid" ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <i className="fas fa-check-circle mr-2"></i>Opłacone
            </button>
            <button
              onClick={() => setFinesTab("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                finesTab === "all" ? "bg-[#1F1F23] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <i className="fas fa-list mr-2"></i>Wszystkie
            </button>
          </div>

          {/* Fines Table */}
          {loading ? (
            <div className="bg-[#2D2D35] rounded-xl p-8 flex items-center justify-center border border-gray-700/50">
              <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
          ) : fines.length === 0 ? (
            <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-12 text-center">
              <i className="fas fa-coins text-5xl text-gray-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-white mb-2">Brak kar</h3>
              <p className="text-gray-400">Nie znaleziono kar dla wybranych filtrów</p>
            </div>
          ) : (
            <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#1F1F23] border-b border-gray-700/50">
                      <th className="text-left p-4 font-medium text-gray-300">Czytelnik</th>
                      <th className="text-left p-4 font-medium text-gray-300">Powód</th>
                      <th className="text-left p-4 font-medium text-gray-300">Kwota</th>
                      <th className="text-left p-4 font-medium text-gray-300">Data</th>
                      <th className="text-left p-4 font-medium text-gray-300">Status</th>
                      <th className="text-left p-4 font-medium text-gray-300">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map((fine) => (
                      <tr key={fine.id} className="border-b border-gray-700/30 hover:bg-[#3D3D45]/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{fine.userName}</div>
                          <div className="text-sm text-gray-400">{fine.userEmail}</div>
                        </td>
                        <td className="p-4 text-gray-300">
                          {fine.reason}
                          {fine.bookTitle && (
                            <div className="text-sm text-gray-400">{fine.bookTitle}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-amber-400">{fine.amount.toFixed(2)} zł</span>
                        </td>
                        <td className="p-4 text-gray-400">{new Date(fine.createdAt).toLocaleDateString("pl-PL")}</td>
                        <td className="p-4">{getFineStatusBadge(fine.status)}</td>
                        <td className="p-4">
                          {fine.status !== "OPLACONA" && (
                            <button
                              onClick={() => handleSettleFine(fine.id)}
                              disabled={settlingFine === fine.id}
                              className="px-3 py-1.5 text-sm bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 disabled:opacity-50 border border-emerald-500/30 transition-colors flex items-center gap-1.5"
                            >
                              {settlingFine === fine.id ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <>
                                  <i className="fas fa-check"></i>
                                  Rozlicz
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fines Summary */}
          {!loading && fines.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <i className="fas fa-coins text-amber-400"></i>
                  </div>
                  <span className="text-sm text-gray-400">Suma nieopłaconych</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {fines.filter(f => f.status !== "OPLACONA").reduce((sum, f) => sum + f.amount, 0).toFixed(2)} zł
                </p>
              </div>
              <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <i className="fas fa-check-circle text-emerald-400"></i>
                  </div>
                  <span className="text-sm text-gray-400">Suma opłaconych</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {fines.filter(f => f.status === "OPLACONA").reduce((sum, f) => sum + f.amount, 0).toFixed(2)} zł
                </p>
              </div>
              <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                    <i className="fas fa-receipt text-teal-400"></i>
                  </div>
                  <span className="text-sm text-gray-400">Liczba kar</span>
                </div>
                <p className="text-2xl font-bold text-white">{fines.length}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Borrowing Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-book-reader text-emerald-400"></i>
                Nowe wypożyczenie
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-lg bg-[#1F1F23] hover:bg-gray-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <i className="fas fa-user mr-2"></i>Wyszukaj czytelnika
              </label>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Email lub imię..."
                className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors mb-2"
              />
              <div className="max-h-40 overflow-y-auto bg-[#1F1F23] border border-gray-700/50 rounded-lg">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user.id)}
                    className={`p-3 cursor-pointer hover:bg-[#3D3D45] ${
                      selectedUser === user.id ? "bg-emerald-500/20 border-l-2 border-emerald-500" : ""
                    } transition-colors`}
                  >
                    <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="p-3 text-gray-500 text-center">Brak wyników</div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <i className="fas fa-book mr-2"></i>Wyszukaj książkę
              </label>
              <input
                type="text"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                placeholder="Tytuł..."
                className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors mb-2"
              />
              <div className="max-h-40 overflow-y-auto bg-[#1F1F23] border border-gray-700/50 rounded-lg">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBook(book.id)}
                    className={`p-3 cursor-pointer hover:bg-[#3D3D45] ${
                      selectedBook === book.id ? "bg-emerald-500/20 border-l-2 border-emerald-500" : ""
                    } transition-colors`}
                  >
                    <div className="font-medium text-white">{book.title}</div>
                    <div className="text-sm text-emerald-400">
                      <i className="fas fa-check-circle mr-1"></i>
                      Dostępnych: {book.availableCopies}
                    </div>
                  </div>
                ))}
                {filteredBooks.length === 0 && (
                  <div className="p-3 text-gray-500 text-center">Brak dostępnych książek</div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <i className="fas fa-calendar-alt mr-2"></i>Termin zwrotu
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 bg-[#1F1F23] text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleCreateBorrowing}
                disabled={creating || !selectedBook || !selectedUser}
                className="px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Tworzenie...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Utwórz wypożyczenie
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </LibrarianLayout>
  );
}
