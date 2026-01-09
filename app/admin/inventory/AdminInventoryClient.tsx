"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/app/_components/AdminLayout";
import type { UserSession } from "@/domain/types";

interface Book {
  KsiazkaId: number;
  Tytul: string;
  Autor: string;
  ISBN: string;
  RokWydania: number;
  Wydawnictwo: string;
  NazwaGatunku: string;
  gatunekIds?: number[];
  ebookCount: number;
  coverUrl?: string | null;
  description?: string | null;
  pageCount?: number | null;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  unavailableCopies: number;
}

interface Copy {
  EgzemplarzId: number;
  KodKreskowy: string;
  Status: "Dostepny" | "Wypozyczony" | "Uszkodzony" | "Zaginiony";
  DataDodania: string;
  IsDeleted: number;
  borrowedBy: string | null;
  DataWypozyczenia: string | null;
  TerminZwrotu: string | null;
}

interface Genre {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  bookCount?: number;
}

export default function AdminInventoryClient({ user }: { user: UserSession }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedBookId, setExpandedBookId] = useState<number | null>(null);
  const [copies, setCopies] = useState<Copy[]>([]);
  const [loadingCopies, setLoadingCopies] = useState(false);

  // Modals
  const [editBookModal, setEditBookModal] = useState<Book | null>(null);
  const [addCopyModal, setAddCopyModal] = useState<number | null>(null);
  const [editCopyModal, setEditCopyModal] = useState<Copy | null>(null);

  // Form states
  const [newCopyBarcode, setNewCopyBarcode] = useState("");
  const [newCopyCondition, setNewCopyCondition] = useState("Dobry");
  const [newEbookUrl, setNewEbookUrl] = useState("");
  const [addingEbook, setAddingEbook] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchGenres();
    fetchBooks();
  }, [search, genreFilter, statusFilter]);

  async function fetchGenres() {
    try {
      const response = await fetch("/api/genres");
      const data = await response.json();
      setGenres(data.genres || []);
    } catch (error) {
      console.error("Błąd pobierania gatunków:", error);
      setGenres([]);
    }
  }

  async function fetchBooks() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (genreFilter) params.append("genre", genreFilter);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/admin/inventory?${params.toString()}`);
      const data = await response.json();
      // normalize genres ids
      const normalized = (data || []).map((b: any) => ({
        ...b,
        gatunekIds: b.NazwaGatunekIds ? b.NazwaGatunekIds.split(',').filter(Boolean).map((s: string) => parseInt(s)) : [],
      }));
      setBooks(normalized);
    } catch (error) {
      console.error("Błąd pobierania książek:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpandBook(bookId: number) {
    if (expandedBookId === bookId) {
      setExpandedBookId(null);
      setCopies([]);
    } else {
      setExpandedBookId(bookId);
      await fetchCopies(bookId);
    }
  }

  async function fetchCopies(bookId: number) {
    try {
      setLoadingCopies(true);
      const response = await fetch(`/api/admin/books/${bookId}/copies`);
      const data = await response.json();
      setCopies(data);
    } catch (error) {
      console.error("Błąd pobierania egzemplarzy:", error);
    } finally {
      setLoadingCopies(false);
    }
  }

  async function handleUpdateBook() {
    if (!editBookModal || savingBook) return;

    // --- Client-side validation ---
    const errors: { [key: string]: string } = {};
    if (!editBookModal.Tytul || !editBookModal.Tytul.trim()) {
      errors.Tytul = 'Tytuł jest wymagany';
    }
    if (editBookModal.pageCount !== undefined && editBookModal.pageCount !== null) {
      if (!Number.isFinite(editBookModal.pageCount) || editBookModal.pageCount <= 0) {
        errors.pageCount = 'Podaj poprawną liczbę stron';
      }
    }

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSavingBook(true);

    try {
      const body: any = {
        title: editBookModal.Tytul,
        isbn: editBookModal.ISBN,
        year: editBookModal.RokWydania,
        publisher: editBookModal.Wydawnictwo,
      };
      if (editBookModal.gatunekIds) body.genreIds = editBookModal.gatunekIds;
      // Send coverUrl only when defined (server expects a string to update)
      if (editBookModal.coverUrl !== undefined) body.coverUrl = editBookModal.coverUrl ?? '';
      // Send description and pageCount
      if (editBookModal.description !== undefined) body.description = editBookModal.description ?? '';
      if (editBookModal.pageCount !== undefined) body.pageCount = editBookModal.pageCount || null;

      const response = await fetch(`/api/books/${editBookModal.KsiazkaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setEditBookModal(null);
        fetchBooks();
      } else {
        const data = await response.json();
        alert(data.error || "Błąd aktualizacji książki");
      }
    } catch (error) {
      console.error("Błąd aktualizacji książki:", error);
      alert("Wystąpił błąd podczas aktualizacji");
    } finally {
      setSavingBook(false);
    }
  }

  async function addEbook() {
    if (!editBookModal) return;
    if (!newEbookUrl.trim()) { alert('Podaj URL e-booka'); return; }
    try {
      setAddingEbook(true);
      const response = await fetch('/api/ebooks', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${editBookModal.Tytul} (e-book)`,
          filePath: newEbookUrl.trim(),
          format: 'PDF',
          bookId: editBookModal.KsiazkaId,
          accessLevel: 'Czytelnik'
        })
      });
      const data = await response.json();
      if (response.ok) {
        setNewEbookUrl('');
        fetchBooks();
        alert('E-book dodany');
      } else {
        alert(data.error || 'Błąd dodawania e-booka');
      }
    } catch (err) {
      console.error('Błąd dodawania e-booka:', err);
      alert('Wystąpił błąd podczas dodawania e-booka');
    } finally {
      setAddingEbook(false);
    }
  }

  async function adjustStock(bookId: number, delta: number) {
    try {
      const response = await fetch(`/api/books/${bookId}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Błąd zmiany stanu');
      fetchBooks();
      if (expandedBookId === bookId) fetchCopies(bookId);
    } catch (err:any) {
      console.error('Błąd zmiany stanu:', err);
      alert((err && err.message) || 'Wystąpił błąd');
    }
  }

  async function handleAddCopy() {
    if (!addCopyModal) return;

    try {
      const payload = { barcode: newCopyBarcode || null, condition: newCopyCondition };
      const response = await fetch(`/api/admin/books/${addCopyModal}/copies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setAddCopyModal(null);
        setNewCopyBarcode("");
        setNewCopyCondition("Dobry");
        if (expandedBookId === addCopyModal) {
          fetchCopies(addCopyModal);
        }
        fetchBooks(); // Refresh to update counts
      } else {
        const data = await response.json();
        alert(data.error || "Błąd dodawania egzemplarza");
      }
    } catch (error: any) {
      console.error("Błąd dodawania egzemplarza:", error);
      alert((error && error.message) || "Wystąpił błąd podczas dodawania");
    }
  }

  async function handleUpdateCopy() {
    if (!editCopyModal) return;

    try {
      const response = await fetch(`/api/copies/${editCopyModal.EgzemplarzId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editCopyModal.Status,
          barcode: editCopyModal.KodKreskowy,
        }),
      });

      if (response.ok) {
        setEditCopyModal(null);
        if (expandedBookId) {
          fetchCopies(expandedBookId);
        }
      } else {
        const data = await response.json();
        alert(data.error || "Błąd aktualizacji egzemplarza");
      }
    } catch (error) {
      console.error("Błąd aktualizacji egzemplarza:", error);
      alert("Wystąpił błąd podczas aktualizacji");
    }
  }

  async function handleSoftDeleteCopy(copyId: number) {
    if (!confirm("Czy na pewno chcesz usunąć ten egzemplarz?")) return;

    try {
      const response = await fetch(`/api/copies/${copyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (expandedBookId) {
          fetchCopies(expandedBookId);
        }
        fetchBooks();
      } else {
        const data = await response.json();
        alert(data.error || "Błąd usuwania egzemplarza");
      }
    } catch (error) {
      console.error("Błąd usuwania egzemplarza:", error);
      alert("Wystąpił błąd podczas usuwania");
    }
  }

  function getStatusBadge(book: Book) {
    if (book.totalCopies === 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">Brak egzemplarzy</span>;
    }
    if (book.availableCopies === 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-300">Wszystkie wypożyczone</span>;
    }
    if (book.availableCopies <= 2) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300">Niski stan</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300">Dostępne</span>;
  }

  function getCopyStatusBadge(status: string) {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      Dostepny: { bg: "bg-green-500/20", text: "text-green-300", label: "Dostępny" },
      Wypozyczony: { bg: "bg-blue-500/20", text: "text-blue-300", label: "Wypożyczony" },
      Uszkodzony: { bg: "bg-orange-500/20", text: "text-orange-300", label: "Uszkodzony" },
      Zagubiony: { bg: "bg-red-500/20", text: "text-red-300", label: "Zagubiony" },
    };

    const s = statusMap[status] || statusMap.Dostepny;
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${s.bg} ${s.text}`}>{s.label}</span>;
  }

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Ewidencja Książek
        </h1>
        <p className="text-gray-400">Zarządzaj stanem magazynowym i egzemplarzami</p>
      </div>

      {/* Filtry */}
      <div className="bg-[#141414] rounded-xl p-6 border border-white/5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Szukaj (tytuł/autor)</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Wpisz tytuł lub autora..."
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Gatunek</label>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Wszystkie</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Status dostępności</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Wszystkie</option>
              <option value="available">Dostępne</option>
              <option value="low-stock">Niski stan</option>
              <option value="borrowed-all">Wszystkie wypożyczone</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela książek */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-gray-400 mt-4">Ładowanie książek...</p>
        </div>
      ) : (
        <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0A0A] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12"></th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tytuł i Autor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    ISBN
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Gatunek
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Egzemplarze
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {books.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      Brak książek spełniających kryteria
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <>
                      <tr
                        key={book.KsiazkaId}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="w-12 h-16 overflow-hidden rounded">
                            {book.coverUrl ? (
                              <img src={book.coverUrl} alt={book.Tytul} className="w-full h-full object-cover" />
                            ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-600 to-blue-600 text-white font-bold">{book.Tytul.charAt(0)}</div>
                            )}
                          </div>
                          <button
                            onClick={() => toggleExpandBook(book.KsiazkaId)}
                            className="ml-2 text-gray-400 hover:text-white transition-colors"
                          >
                            <i
                              className={`fas fa-chevron-${expandedBookId === book.KsiazkaId ? "down" : "right"}`}
                              aria-hidden="true"
                            ></i>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{book.Tytul}</div>
                          <div className="text-sm text-gray-400">{book.Autor}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{book.ISBN}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{book.NazwaGatunku}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">{book.availableCopies}</span>
                            <span className="text-gray-500">/</span>
                            <span>{book.totalCopies}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(book)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.role === "ADMIN" && (
                              <button
                                onClick={() => setEditBookModal(book)}
                                className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
                                title="Edytuj metadane"
                              >
                                <i className="fas fa-edit" aria-hidden="true"></i>
                              </button>
                            )}
                            <button
                              onClick={() => setAddCopyModal(book.KsiazkaId)}
                              className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors"
                              title="Dodaj egzemplarz"
                            >
                              <i className="fas fa-plus" aria-hidden="true"></i>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row - copies */}
                      {expandedBookId === book.KsiazkaId && (
                        <tr>
                          <td colSpan={7} className="bg-[#0A0A0A] px-6 py-4">
                            {loadingCopies ? (
                              <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-purple-500 border-t-transparent"></div>
                              </div>
                            ) : copies.length === 0 ? (
                              <div className="text-gray-400 text-center py-4">
                                Brak egzemplarzy dla tej książki
                              </div>
                            ) : (
                              <table className="w-full">
                                <thead>
                                  <tr className="text-left text-xs text-gray-500 uppercase">
                                    <th className="pb-2">Kod kreskowy</th>
                                    <th className="pb-2">Status</th>
                                    <th className="pb-2">Wypożyczony przez</th>
                                    <th className="pb-2">Data dodania</th>
                                    <th className="pb-2">Akcje</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {copies.map((copy) => (
                                    <tr key={copy.EgzemplarzId} className={copy.IsDeleted ? "opacity-50" : ""}>
                                      <td className="py-2 text-sm text-gray-300">
                                        {copy.KodKreskowy || <span className="text-gray-600 italic">brak</span>}
                                      </td>
                                      <td className="py-2">{getCopyStatusBadge(copy.Status)}</td>
                                      <td className="py-2 text-sm text-gray-300">
                                        {copy.borrowedBy || <span className="text-gray-600">-</span>}
                                      </td>
                                      <td className="py-2 text-sm text-gray-400">
                                        {new Date(copy.DataDodania).toLocaleDateString("pl-PL")}
                                      </td>
                                      <td className="py-2">
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => setEditCopyModal(copy)}
                                            className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs transition-colors"
                                          >
                                            <i className="fas fa-edit" aria-hidden="true"></i>
                                          </button>
                                          {user.role === "ADMIN" && !copy.IsDeleted && (
                                            <button
                                              onClick={() => handleSoftDeleteCopy(copy.EgzemplarzId)}
                                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs transition-colors"
                                            >
                                              <i className="fas fa-trash" aria-hidden="true"></i>
                                            </button>
                                          )}
                                          {copy.IsDeleted && (
                                            <span className="text-xs text-red-400">Usunięty</span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Edit Book */}
      {editBookModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <i className="fas fa-book text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edytuj książkę</h2>
                  <p className="text-sm text-gray-400">ID: {editBookModal.KsiazkaId}</p>
                </div>
              </div>
              <button
                onClick={() => setEditBookModal(null)}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - Cover & Stats */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Cover Preview */}
                  <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-4">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Okładka</label>
                    <div className="aspect-2/3 rounded-lg overflow-hidden bg-slate-800 border border-white/5 flex items-center justify-center mb-3">
                      {editBookModal.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={editBookModal.coverUrl}
                          alt="Podgląd okładki"
                          onError={(e: any) => (e.currentTarget.src = '/biblio.png')}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <i className="fas fa-image text-4xl mb-2"></i>
                          <p className="text-xs">Brak okładki</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={editBookModal.coverUrl || ""}
                      onChange={(e) => setEditBookModal({ ...editBookModal, coverUrl: e.target.value })}
                      placeholder="https://.../cover.jpg"
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setEditBookModal({ ...editBookModal, coverUrl: '' })}
                        className="flex-1 text-xs px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-gray-400"
                      >
                        <i className="fas fa-trash mr-1"></i> Usuń
                      </button>
                      {editBookModal.coverUrl && (
                        <a
                          href={editBookModal.coverUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-xs px-2 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 rounded text-indigo-300 text-center"
                        >
                          <i className="fas fa-external-link-alt mr-1"></i> Otwórz
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-4">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Stan magazynowy</label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-white">{editBookModal.totalCopies}</div>
                        <div className="text-xs text-gray-500">Wszystkich</div>
                      </div>
                      <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-emerald-400">{editBookModal.availableCopies}</div>
                        <div className="text-xs text-emerald-400/70">Dostępnych</div>
                      </div>
                      <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-amber-400">{editBookModal.borrowedCopies}</div>
                        <div className="text-xs text-amber-400/70">Wypożyczonych</div>
                      </div>
                      <div className="bg-red-500/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-red-400">{editBookModal.unavailableCopies}</div>
                        <div className="text-xs text-red-400/70">Niedostępnych</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Zmień ilość:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustStock(editBookModal.KsiazkaId, -1)}
                          disabled={editBookModal.availableCopies <= 0}
                          className="w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <button
                          onClick={() => adjustStock(editBookModal.KsiazkaId, 1)}
                          className="w-10 h-10 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 flex items-center justify-center"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* E-books */}
                  <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-4">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">E-booki</label>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-purple-400">{editBookModal.ebookCount || 0}</span>
                      <span className="text-xs text-gray-500">plików PDF</span>
                    </div>
                    <input
                      type="text"
                      value={newEbookUrl}
                      onChange={(e) => setNewEbookUrl(e.target.value)}
                      placeholder="https://.../book.pdf"
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 mb-2"
                    />
                    <button
                      onClick={addEbook}
                      disabled={addingEbook || !newEbookUrl.trim()}
                      className="w-full py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingEbook ? <><i className="fas fa-spinner fa-spin mr-2"></i>Dodawanie...</> : <><i className="fas fa-plus mr-2"></i>Dodaj e-book</>}
                    </button>
                  </div>
                </div>

                {/* Right Column - Form Fields */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Basic Info Section */}
                  <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-4">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Informacje podstawowe</label>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Tytuł <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={editBookModal.Tytul}
                          onChange={(e) => setEditBookModal({ ...editBookModal, Tytul: e.target.value })}
                          className={`w-full bg-[#1a1a1a] border ${formErrors.Tytul ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500`}
                        />
                        {formErrors.Tytul && <p className="text-xs text-red-400 mt-1">{formErrors.Tytul}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Autor</label>
                        <input
                          type="text"
                          value={editBookModal.Autor}
                          onChange={(e) => setEditBookModal({ ...editBookModal, Autor: e.target.value })}
                          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">ISBN</label>
                          <input
                            type="text"
                            value={editBookModal.ISBN}
                            onChange={(e) => setEditBookModal({ ...editBookModal, ISBN: e.target.value })}
                            placeholder="978-..."
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">Rok wydania</label>
                          <input
                            type="number"
                            value={editBookModal.RokWydania || ""}
                            onChange={(e) => setEditBookModal({ ...editBookModal, RokWydania: parseInt(e.target.value) || 0 })}
                            placeholder="np. 2024"
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">Wydawnictwo</label>
                          <input
                            type="text"
                            value={editBookModal.Wydawnictwo || ""}
                            onChange={(e) => setEditBookModal({ ...editBookModal, Wydawnictwo: e.target.value })}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1.5">Liczba stron</label>
                          <input
                            type="number"
                            value={editBookModal.pageCount || ""}
                            onChange={(e) => setEditBookModal({ ...editBookModal, pageCount: e.target.value ? parseInt(e.target.value) : null })}
                            placeholder="np. 288"
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Genres Section */}
                  <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-4">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Gatunki</label>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((g) => {
                        const isSelected = editBookModal.gatunekIds?.includes(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              const current = editBookModal.gatunekIds || [];
                              const updated = isSelected 
                                ? current.filter(id => id !== g.id)
                                : [...current, g.id];
                              setEditBookModal({ ...editBookModal, gatunekIds: updated });
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              isSelected 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {isSelected && <i className="fas fa-check mr-1.5 text-xs"></i>}
                            {g.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-4">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Opis książki</label>
                    <textarea
                      value={editBookModal.description || ""}
                      onChange={(e) => setEditBookModal({ ...editBookModal, description: e.target.value })}
                      placeholder="Opis fabuły, treści książki..."
                      rows={4}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{editBookModal.description?.length || 0} znaków</span>
                      <span>Zalecane: 100-500 znaków</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0A0A0A]">
              <p className="text-xs text-gray-500">
                <i className="fas fa-info-circle mr-1"></i>
                Zmiany zostaną zapisane natychmiast
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditBookModal(null)}
                  disabled={savingBook}
                  className="px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-all disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleUpdateBook}
                  disabled={savingBook}
                  className="px-6 py-2.5 rounded-lg bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {savingBook ? (
                    <><i className="fas fa-spinner fa-spin"></i> Zapisywanie...</>
                  ) : (
                    <><i className="fas fa-save"></i> Zapisz zmiany</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Add Copy */}
      {addCopyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] rounded-2xl border border-white/10 max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Dodaj egzemplarz</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Kod kreskowy (opcjonalny)</label>
                <input
                  type="text"
                  value={newCopyBarcode}
                  onChange={(e) => setNewCopyBarcode(e.target.value)}
                  placeholder="np. 9788324631766"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Stan fizyczny</label>
                <select
                  value={newCopyCondition}
                  onChange={(e) => setNewCopyCondition(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Dobry">Dobry</option>
                  <option value="Średni">Średni</option>
                  <option value="Zły">Zły</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddCopy}
                className="flex-1 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
              >
                Dodaj
              </button>
              <button
                onClick={() => {
                  setAddCopyModal(null);
                  setNewCopyBarcode("");
                  setNewCopyCondition("Dobry");
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-lg transition-all"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Edit Copy */}
      {editCopyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] rounded-2xl border border-white/10 max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Edytuj egzemplarz</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Kod kreskowy</label>
                <input
                  type="text"
                  value={editCopyModal.KodKreskowy || ""}
                  onChange={(e) => setEditCopyModal({ ...editCopyModal, KodKreskowy: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={editCopyModal.Status}
                  onChange={(e) => setEditCopyModal({ ...editCopyModal, Status: e.target.value as any })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  disabled={editCopyModal.Status === "Wypozyczony"}
                >
                  <option value="Dostepny">Dostępny</option>
                  <option value="Wypozyczony">Wypożyczony</option>
                  <option value="Uszkodzony">Uszkodzony</option>
                  <option value="Zaginiony">Zagubiony</option>
                </select>
                {editCopyModal.Status === "Wypozyczony" && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Nie można zmienić statusu wypożyczonego egzemplarza
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdateCopy}
                className="flex-1 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
              >
                Zapisz
              </button>
              <button
                onClick={() => setEditCopyModal(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-lg transition-all"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
