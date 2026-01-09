"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import LibrarianLayout from "@/app/_components/LibrarianLayout";
import type { UserSession } from "@/domain/types";

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publicationYear: number;
  category: string;
  description: string;
  coverUrl: string | null;
  totalCopies: number;
  availableCopies: number;
  rating: number;
  reviewCount: number;
}

interface Copy {
  id: number;
  bookId: number;
  copyNumber: string;
  status: string;
  condition: string;
  location: string;
  createdAt: string;
}

interface Genre {
  id: number;
  name: string;
}

export default function LibrarianInventoryClient({ user }: { user: UserSession }) {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Book form modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publicationYear: new Date().getFullYear(),
    category: "",
    description: "",
    coverUrl: "",
  });
  const [saving, setSaving] = useState(false);
  
  // Copy management
  const [showCopiesModal, setShowCopiesModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [copies, setCopies] = useState<Copy[]>([]);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const [addingCopy, setAddingCopy] = useState(false);
  const [newCopyLocation, setNewCopyLocation] = useState("");

  const fetchBooks = useCallback(async () => {
    try {
      let url = `/api/books?page=${currentPage}&limit=12`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (selectedGenre) url += `&genre=${encodeURIComponent(selectedGenre)}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Błąd");
      const data = await response.json();
      setBooks(data.books || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      console.error("Błąd ładowania książek");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedGenre]);

  const fetchGenres = async () => {
    try {
      const response = await fetch("/api/genres");
      if (response.ok) {
        const data = await response.json();
        setGenres(data.genres || []);
      }
    } catch {
      console.error("Błąd ładowania gatunków");
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, [fetchBooks]);

  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookForm({
      title: "",
      author: "",
      isbn: "",
      publisher: "",
      publicationYear: new Date().getFullYear(),
      category: "",
      description: "",
      coverUrl: "",
    });
    setShowBookModal(true);
  };

  const handleOpenEditBook = (book: Book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || "",
      publisher: book.publisher || "",
      publicationYear: book.publicationYear,
      category: book.category || "",
      description: book.description || "",
      coverUrl: book.coverUrl || "",
    });
    setShowBookModal(true);
  };

  const handleSaveBook = async () => {
    if (!bookForm.title || !bookForm.author) {
      alert("Tytuł i autor są wymagane");
      return;
    }
    setSaving(true);
    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : "/api/books";
      const method = editingBook ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookForm),
      });
      
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Błąd zapisu książki");
        return;
      }
      
      setShowBookModal(false);
      fetchBooks();
    } catch {
      alert("Błąd zapisu książki");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm("Czy na pewno usunąć tę książkę? Ta operacja jest nieodwracalna.")) return;
    
    try {
      const response = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Błąd usuwania książki");
        return;
      }
      fetchBooks();
    } catch {
      alert("Błąd usuwania książki");
    }
  };

  const handleOpenCopies = async (book: Book) => {
    setSelectedBook(book);
    setShowCopiesModal(true);
    setLoadingCopies(true);
    
    try {
      const response = await fetch(`/api/copies?bookId=${book.id}`);
      if (response.ok) {
        const data = await response.json();
        setCopies(data.copies || []);
      }
    } catch {
      console.error("Błąd ładowania egzemplarzy");
    } finally {
      setLoadingCopies(false);
    }
  };

  const handleAddCopy = async () => {
    if (!selectedBook) return;
    setAddingCopy(true);
    
    try {
      const response = await fetch("/api/copies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBook.id,
          location: newCopyLocation || "Biblioteka główna",
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Błąd dodawania egzemplarza");
        return;
      }
      
      setNewCopyLocation("");
      // Reload copies
      const copiesRes = await fetch(`/api/copies?bookId=${selectedBook.id}`);
      if (copiesRes.ok) {
        const data = await copiesRes.json();
        setCopies(data.copies || []);
      }
      fetchBooks();
    } catch {
      alert("Błąd dodawania egzemplarza");
    } finally {
      setAddingCopy(false);
    }
  };

  const handleDeleteCopy = async (copyId: number) => {
    if (!confirm("Czy na pewno usunąć ten egzemplarz?")) return;
    
    try {
      const response = await fetch(`/api/copies/${copyId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Błąd usuwania egzemplarza");
        return;
      }
      
      setCopies(copies.filter(c => c.id !== copyId));
      fetchBooks();
    } catch {
      alert("Błąd usuwania egzemplarza");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DOSTEPNA":
        return <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Dostępna</span>;
      case "WYPOZYCZONA":
        return <span className="px-2 py-1 text-xs rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">Wypożyczona</span>;
      case "ZAREZERWOWANA":
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Zarezerwowana</span>;
      case "USZKODZONA":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Uszkodzona</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-300 border border-gray-500/30">{status}</span>;
    }
  };

  return (
    <LibrarianLayout user={user}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <i className="fas fa-books text-white"></i>
            </div>
            Ewidencja książek
          </h2>
          <p className="text-gray-400 mt-1">Zarządzaj katalogiem i egzemplarzami</p>
        </div>
        <button
          onClick={handleOpenAddBook}
          className="px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
        >
          <i className="fas fa-plus"></i>
          Dodaj książkę
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj po tytule lub autorze..."
                className="w-full pl-10 pr-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">Wszystkie gatunki</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.name}>{genre.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="bg-[#2D2D35] rounded-xl p-8 flex items-center justify-center border border-gray-700/50">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-12 text-center">
          <i className="fas fa-books text-5xl text-gray-500 mb-4"></i>
          <h3 className="text-xl font-semibold text-white mb-2">Brak książek</h3>
          <p className="text-gray-400">Dodaj pierwszą książkę do katalogu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-4 hover:border-emerald-500/50 transition-colors group"
            >
              <div className="flex gap-3 mb-3">
                <div className="w-16 h-24 rounded-lg bg-[#1F1F23] shrink-0 overflow-hidden">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <i className="fas fa-book text-2xl"></i>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{book.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{book.author}</p>
                  <p className="text-xs text-gray-500 mt-1">{book.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-emerald-400">
                      <i className="fas fa-book-copy mr-1"></i>
                      {book.availableCopies}/{book.totalCopies}
                    </span>
                    {book.rating > 0 && (
                      <span className="text-xs text-amber-400">
                        <i className="fas fa-star mr-1"></i>
                        {book.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-gray-700/50">
                <button
                  onClick={() => router.push(`/books/${book.id}`)}
                  className="flex-1 px-3 py-1.5 text-xs bg-[#1F1F23] text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  title="Podgląd"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  onClick={() => handleOpenEditBook(book)}
                  className="flex-1 px-3 py-1.5 text-xs bg-teal-500/20 text-teal-300 rounded-lg hover:bg-teal-500/30 transition-colors"
                  title="Edytuj"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleOpenCopies(book)}
                  className="flex-1 px-3 py-1.5 text-xs bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors"
                  title="Egzemplarze"
                >
                  <i className="fas fa-copy"></i>
                </button>
                <button
                  onClick={() => handleDeleteBook(book.id)}
                  className="flex-1 px-3 py-1.5 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                  title="Usuń"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#2D2D35] text-gray-300 rounded-lg hover:bg-[#3D3D45] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="px-4 py-2 bg-[#2D2D35] text-white rounded-lg">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[#2D2D35] text-gray-300 rounded-lg hover:bg-[#3D3D45] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Book Form Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className={`fas ${editingBook ? "fa-edit" : "fa-plus"} text-emerald-400`}></i>
                {editingBook ? "Edytuj książkę" : "Dodaj książkę"}
              </h2>
              <button
                onClick={() => setShowBookModal(false)}
                className="w-8 h-8 rounded-lg bg-[#1F1F23] hover:bg-gray-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Tytuł *</label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Tytuł książki"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Autor *</label>
                <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Imię i nazwisko"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ISBN</label>
                <input
                  type="text"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="978-..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Wydawnictwo</label>
                <input
                  type="text"
                  value={bookForm.publisher}
                  onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Nazwa wydawnictwa"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rok wydania</label>
                <input
                  type="number"
                  value={bookForm.publicationYear}
                  onChange={(e) => setBookForm({ ...bookForm, publicationYear: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  min="1800"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gatunek</label>
                <select
                  value={bookForm.category}
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Wybierz gatunek</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.name}>{genre.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL okładki</label>
                <input
                  type="url"
                  value={bookForm.coverUrl}
                  onChange={(e) => setBookForm({ ...bookForm, coverUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="https://..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Opis</label>
                <textarea
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Opis książki..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBookModal(false)}
                className="px-4 py-2 bg-[#1F1F23] text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleSaveBook}
                disabled={saving}
                className="px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Zapisz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copies Modal */}
      {showCopiesModal && selectedBook && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <i className="fas fa-copy text-emerald-400"></i>
                  Egzemplarze
                </h2>
                <p className="text-gray-400 text-sm">{selectedBook.title}</p>
              </div>
              <button
                onClick={() => setShowCopiesModal(false)}
                className="w-8 h-8 rounded-lg bg-[#1F1F23] hover:bg-gray-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Add copy form */}
            <div className="bg-[#1F1F23] rounded-lg p-4 mb-6 flex gap-3">
              <input
                type="text"
                value={newCopyLocation}
                onChange={(e) => setNewCopyLocation(e.target.value)}
                placeholder="Lokalizacja (np. Regał A3)"
                className="flex-1 px-4 py-2 bg-[#2D2D35] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleAddCopy}
                disabled={addingCopy}
                className="px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {addingCopy ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-plus"></i>
                    Dodaj egzemplarz
                  </>
                )}
              </button>
            </div>
            
            {/* Copies list */}
            {loadingCopies ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
              </div>
            ) : copies.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <i className="fas fa-box-open text-4xl mb-3"></i>
                <p>Brak egzemplarzy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {copies.map((copy) => (
                  <div
                    key={copy.id}
                    className="bg-[#1F1F23] rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#2D2D35] flex items-center justify-center text-gray-400">
                        <i className="fas fa-book"></i>
                      </div>
                      <div>
                        <p className="font-mono text-white">{copy.copyNumber}</p>
                        <p className="text-sm text-gray-400">
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {copy.location || "Brak lokalizacji"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(copy.status)}
                      {copy.status === "DOSTEPNA" && (
                        <button
                          onClick={() => handleDeleteCopy(copy.id)}
                          className="px-3 py-1.5 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </LibrarianLayout>
  );
}
