"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/app/_components/AppShell";
import { useToast } from "@/app/_components/ui/Toast";

interface BookRow {
  id: number;
  title: string;
  authors: string;
  isbn: string | null;
  availableCopies: number;
  available: boolean;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<BookRow | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [stockDelta, setStockDelta] = useState(0);
  const toast = useToast();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      setBooks(data.books || []);
    } catch (e) {
      toast.error("Błąd pobierania książek");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const openEdit = (b: BookRow) => { setEditing(b); setShowEdit(true); };

  const saveEdit = async (updated: Partial<BookRow>) => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/books/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Błąd");
      toast.success("Zapisano zmianę książki");
      setShowEdit(false);
      fetchBooks();
    } catch {
      toast.error("Błąd zapisu");
    }
  };

  const adjustStock = async (delta: number) => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/books/${editing.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      if (!res.ok) throw new Error("Błąd");
      toast.success("Stan magazynowy zaktualizowany");
      setStockDelta(0);
      setShowEdit(false);
      fetchBooks();
    } catch {
      toast.error("Błąd aktualizacji stanu");
    }
  };

  const forceReturn = async (bookId: number) => {
    if (!confirm("Zwrócić wszystkie aktywne wypożyczenia tej książki?")) return;
    try {
      const res = await fetch(`/api/books/${bookId}/force-return`, { method: "POST" });
      if (!res.ok) throw new Error("Błąd");
      toast.success("Zwrócono aktywne wypożyczenia dla tej książki");
      fetchBooks();
    } catch {
      toast.error("Błąd podczas zwrotu");
    }
  };

  return (
    <AppShell>
      <div className="p-6 rounded-2xl bg-slate-900 text-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Zarządzanie książkami</h1>
          <button onClick={() => window.location.reload()} className="px-3 py-2 bg-indigo-600 rounded">Odśwież</button>
        </div>

        <div className="overflow-auto rounded bg-slate-800 p-4">
          <table className="w-full">
            <thead>
              <tr className="text-sm text-slate-400">
                <th className="p-2 text-left">Tytuł</th>
                <th className="p-2 text-left">Autorzy</th>
                <th className="p-2 text-left">ISBN</th>
                <th className="p-2 text-left">Dostępne</th>
                <th className="p-2 text-left">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className="border-t border-slate-700">
                  <td className="p-2">{b.title}</td>
                  <td className="p-2 text-sm text-slate-300">{b.authors}</td>
                  <td className="p-2 text-sm">{b.isbn || '-'}</td>
                  <td className="p-2 text-sm">{b.availableCopies}</td>
                  <td className="p-2 text-sm flex gap-2">
                    <button onClick={() => openEdit(b)} className="px-2 py-1 bg-indigo-600 rounded">Edytuj</button>
                    <button onClick={() => { setEditing(b); setStockDelta(1); setShowEdit(true); }} className="px-2 py-1 bg-emerald-600 rounded">+ Egz.</button>
                    <button onClick={() => forceReturn(b.id)} className="px-2 py-1 bg-rose-600 rounded">Wymuś zwrot</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit modal */}
        {showEdit && editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-slate-900 p-6 rounded w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Edytuj książkę</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Tytuł</label>
                  <input className="w-full p-2 rounded bg-slate-800" defaultValue={editing.title} id="edit-title" />
                </div>
                <div>
                  <label className="text-sm">ISBN</label>
                  <input className="w-full p-2 rounded bg-slate-800" defaultValue={editing.isbn ?? ''} id="edit-isbn" />
                </div>
                <div>
                  <label className="text-sm">Autorzy</label>
                  <input className="w-full p-2 rounded bg-slate-800" defaultValue={editing.authors} id="edit-authors" />
                </div>
                <div>
                  <label className="text-sm">Dostępne egzemplarze (zmiana)</label>
                  <input type="number" value={stockDelta} onChange={(e) => setStockDelta(Number(e.target.value))} className="w-full p-2 rounded bg-slate-800" />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setShowEdit(false)} className="px-3 py-2 rounded bg-gray-700">Anuluj</button>
                <button onClick={() => saveEdit({
                  title: (document.getElementById('edit-title') as HTMLInputElement).value,
                  isbn: (document.getElementById('edit-isbn') as HTMLInputElement).value || null,
                  authors: (document.getElementById('edit-authors') as HTMLInputElement).value
                })} className="px-3 py-2 rounded bg-indigo-600">Zapisz</button>
                <button onClick={() => adjustStock(stockDelta)} className="px-3 py-2 rounded bg-emerald-600">Zmień stan</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
