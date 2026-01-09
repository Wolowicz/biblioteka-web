/**
 * ADMIN USERS CLIENT - Zarządzanie użytkownikami
 */

"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/app/_components/AdminLayout";
import type { UserSession } from "@/domain/types";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleName: string;
  active: boolean;
  deleted: boolean;
  createdAt: string;
}

interface EditModalData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
}

export default function AdminUsersClient({ user }: { user: UserSession }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showDeleted, setShowDeleted] = useState(false);
  const [editModal, setEditModal] = useState<EditModalData | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, showDeleted]);

  async function fetchUsers() {
    try {
      setLoading(true);
      let url = "/api/admin/users?";
      if (roleFilter !== "all") url += `role=${roleFilter}&`;
      if (showDeleted) url += "includeDeleted=true";
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!editModal) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/users/${editModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editModal.firstName,
          lastName: editModal.lastName,
          email: editModal.email,
          role: editModal.role,
          active: editModal.active,
        }),
      });

      if (!response.ok) throw new Error("Failed to update user");
      
      setEditModal(null);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Nie udało się zaktualizować użytkownika");
    } finally {
      setProcessing(false);
    }
  }

  async function handleSoftDelete(userId: number, userName: string) {
    if (!confirm(`Czy na pewno chcesz usunąć konto ${userName}? (soft delete)`)) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Nie udało się usunąć użytkownika");
    }
  }

  async function handleRestore(userId: number) {
    if (!confirm("Czy na pewno chcesz przywrócić to konto?")) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/restore`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to restore user");
      await fetchUsers();
    } catch (error) {
      console.error("Error restoring user:", error);
      alert("Nie udało się przywrócić użytkownika");
    }
  }

  function getRoleBadge(role: string) {
    const colors: Record<string, string> = {
      ADMIN: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      LIBRARIAN: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      READER: "bg-green-500/10 text-green-400 border-green-500/30",
    };
    
    const labels: Record<string, string> = {
      ADMIN: "Administrator",
      LIBRARIAN: "Bibliotekarz",
      READER: "Czytelnik",
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${colors[role] || colors.READER}`}>
        {labels[role] || role}
      </span>
    );
  }

  return (
    <AdminLayout user={user}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Zarządzanie Użytkownikami</h1>
        <p className="text-gray-400">Edytuj dane, role i uprawnienia użytkowników</p>
      </div>

      {/* Filters */}
      <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Rola</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">Wszystkie role</option>
              <option value="ADMIN">Administratorzy</option>
              <option value="LIBRARIAN">Bibliotekarze</option>
              <option value="READER">Czytelnicy</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Widoczność</label>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showDeleted
                  ? "bg-red-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {showDeleted ? "Ukryj usunięte" : "Pokaż usunięte"}
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-12 text-center">
          <i className="fas fa-users text-4xl text-gray-600 mb-4" aria-hidden="true"></i>
          <p className="text-gray-400">Brak użytkowników do wyświetlenia</p>
        </div>
      ) : (
        <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Użytkownik</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Rola</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-800/50 transition-colors ${u.deleted ? "opacity-50" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{u.firstName} {u.lastName}</p>
                        <p className="text-sm text-gray-500">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{u.email}</td>
                  <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                  <td className="px-6 py-4">
                    {u.deleted ? (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
                        Usunięty
                      </span>
                    ) : u.active ? (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                        Aktywny
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/30">
                        Nieaktywny
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {!u.deleted && (
                        <>
                          <button
                            onClick={() => setEditModal({
                              id: u.id,
                              firstName: u.firstName,
                              lastName: u.lastName,
                              email: u.email,
                              role: u.role,
                              active: u.active,
                            })}
                            className="px-3 py-1 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                          >
                            <i className="fas fa-edit mr-1" aria-hidden="true"></i>
                            Edytuj
                          </button>
                          <button
                            onClick={() => handleSoftDelete(u.id, `${u.firstName} ${u.lastName}`)}
                            className="px-3 py-1 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          >
                            <i className="fas fa-trash mr-1" aria-hidden="true"></i>
                            Usuń
                          </button>
                        </>
                      )}
                      {u.deleted && (
                        <button
                          onClick={() => handleRestore(u.id)}
                          className="px-3 py-1 text-sm bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                        >
                          <i className="fas fa-undo mr-1" aria-hidden="true"></i>
                          Przywróć
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edytuj użytkownika</h2>
              <button
                onClick={() => setEditModal(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Imię</label>
                  <input
                    type="text"
                    value={editModal.firstName}
                    onChange={(e) => setEditModal({ ...editModal, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nazwisko</label>
                  <input
                    type="text"
                    value={editModal.lastName}
                    onChange={(e) => setEditModal({ ...editModal, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={editModal.email}
                  onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Rola</label>
                <select
                  value={editModal.role}
                  onChange={(e) => setEditModal({ ...editModal, role: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="READER">Czytelnik</option>
                  <option value="LIBRARIAN">Bibliotekarz</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={editModal.active}
                  onChange={(e) => setEditModal({ ...editModal, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm text-gray-300">
                  Konto aktywne
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditModal(null)}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleUpdate}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
                    Zapisuję...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2" aria-hidden="true"></i>
                    Zapisz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-sm text-blue-300">
          <i className="fas fa-info-circle mr-2" aria-hidden="true"></i>
          Wyświetlono {users.length} użytkowników. Rozbudowana edycja (zmiana roli, soft delete) zostanie dodana w kolejnym kroku.
        </p>
      </div>
    </AdminLayout>
  );
}
