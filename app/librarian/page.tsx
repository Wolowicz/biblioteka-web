"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/app/_components/AppShell";

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

export default function LibrarianPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "overdue" | "all">("active");
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
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

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

  useEffect(() => { fetchBorrowings(); }, [fetchBorrowings]);

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

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== "ZWROCONA";
    if (status === "ZWROCONA") return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Zwrócona</span>;
    if (isOverdue) return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Przetrzymana</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Aktywna</span>;
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) && b.availableCopies > 0
  );

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Panel bibliotekarza</h1>
        <button onClick={handleOpenNewModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <span>+</span> Nowe wypożyczenie
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("active")} className={`px-4 py-2 rounded-lg font-medium ${activeTab === "active" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          Aktywne
        </button>
        <button onClick={() => setActiveTab("overdue")} className={`px-4 py-2 rounded-lg font-medium ${activeTab === "overdue" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          Przetrzymane
        </button>
        <button onClick={() => setActiveTab("all")} className={`px-4 py-2 rounded-lg font-medium ${activeTab === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          Wszystkie
        </button>
      </div>

      {/* Table */}
      {borrowings.length === 0 ? (
        <div className="bg-gray-50 border rounded-lg p-8 text-center text-gray-500">
          Brak wypożyczeń do wyświetlenia
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 font-medium text-gray-700">Czytelnik</th>
                <th className="text-left p-4 font-medium text-gray-700">Książka</th>
                <th className="text-left p-4 font-medium text-gray-700">Egzemplarz</th>
                <th className="text-left p-4 font-medium text-gray-700">Data wypożyczenia</th>
                <th className="text-left p-4 font-medium text-gray-700">Termin zwrotu</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {borrowings.map((b) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium">{b.userName}</div>
                    <div className="text-sm text-gray-500">{b.userEmail}</div>
                  </td>
                  <td className="p-4">{b.bookTitle}</td>
                  <td className="p-4">{b.copyNumber}</td>
                  <td className="p-4">{new Date(b.borrowDate).toLocaleDateString("pl-PL")}</td>
                  <td className="p-4">{new Date(b.dueDate).toLocaleDateString("pl-PL")}</td>
                  <td className="p-4">{getStatusBadge(b.status, b.dueDate)}</td>
                  <td className="p-4">
                    {b.status !== "ZWROCONA" && (
                      <button onClick={() => handleReturn(b.id)} disabled={returning === b.id} className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50">
                        {returning === b.id ? "..." : "Zwróć"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Borrowing Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nowe wypożyczenie</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Wyszukaj czytelnika</label>
              <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Email lub imię..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-2" />
              <div className="max-h-40 overflow-y-auto border rounded">
                {filteredUsers.map((user) => (
                  <div key={user.id} onClick={() => setSelectedUser(user.id)} className={`p-2 cursor-pointer hover:bg-indigo-50 ${selectedUser === user.id ? "bg-indigo-100" : ""}`}>
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                ))}
                {filteredUsers.length === 0 && <div className="p-2 text-gray-500">Brak wyników</div>}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Wyszukaj książkę</label>
              <input type="text" value={bookSearch} onChange={(e) => setBookSearch(e.target.value)} placeholder="Tytuł..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-2" />
              <div className="max-h-40 overflow-y-auto border rounded">
                {filteredBooks.map((book) => (
                  <div key={book.id} onClick={() => setSelectedBook(book.id)} className={`p-2 cursor-pointer hover:bg-indigo-50 ${selectedBook === book.id ? "bg-indigo-100" : ""}`}>
                    <div className="font-medium">{book.title}</div>
                    <div className="text-sm text-gray-500">Dostępnych: {book.availableCopies}</div>
                  </div>
                ))}
                {filteredBooks.length === 0 && <div className="p-2 text-gray-500">Brak dostępnych książek</div>}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Termin zwrotu</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Anuluj
              </button>
              <button onClick={handleCreateBorrowing} disabled={creating || !selectedBook || !selectedUser} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {creating ? "Tworzenie..." : "Utwórz wypożyczenie"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
