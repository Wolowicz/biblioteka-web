"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/app/_components/AppShell";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleName: string;
  active: boolean;
  createdAt: string;
}

interface Log {
  id: number;
  userId: number;
  userEmail: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalBooks: number;
  totalBorrowings: number;
  activeBorrowings: number;
  overdueBorrowings: number;
  unpaidFines: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"users" | "logs" | "stats">("stats");
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ email: "", firstName: "", lastName: "", password: "", role: "READER", active: true });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const response = await fetch("/api/admin/users");
        const data = await response.json();
        setUsers(data.users || []);
      } else if (activeTab === "logs") {
        const response = await fetch("/api/admin/logs");
        const data = await response.json();
        setLogs(data.logs || []);
      } else if (activeTab === "stats") {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();
        setStats(data.stats);
      }
    } catch {
      console.error("Błąd ładowania danych");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleNewUser = () => {
    setEditingUser(null);
    setUserForm({ email: "", firstName: "", lastName: "", password: "", role: "READER", active: true });
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ email: user.email, firstName: user.firstName, lastName: user.lastName, password: "", role: user.role, active: user.active });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    setSaving(true);
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";
      const body: Record<string, unknown> = { ...userForm };
      if (editingUser && !userForm.password) delete body.password;
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Błąd");
        return;
      }
      setShowUserModal(false);
      fetchData();
    } catch {
      alert("Błąd zapisywania użytkownika");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Czy na pewno usunąć tego użytkownika?")) return;
    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Błąd");
      fetchData();
    } catch {
      alert("Błąd usuwania");
    } finally {
      setDeleting(null);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Admin</span>;
    if (role === "LIBRARIAN") return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">Bibliotekarz</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Czytelnik</span>;
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
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Panel administratora</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("stats")} className={`px-4 py-2 rounded-lg font-medium ${activeTab === "stats" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          📊 Statystyki
        </button>
        <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded-lg font-medium ${activeTab === "users" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          👥 Użytkownicy
        </button>
        <button onClick={() => setActiveTab("logs")} className={`px-4 py-2 rounded-lg font-medium ${activeTab === "logs" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          📋 Logi
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-gray-500">Użytkowników</div>
          </div>
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="text-3xl font-bold text-green-600">{stats.totalBooks}</div>
            <div className="text-gray-500">Książek</div>
          </div>
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">{stats.totalBorrowings}</div>
            <div className="text-gray-500">Wypożyczeń</div>
          </div>
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="text-3xl font-bold text-indigo-600">{stats.activeBorrowings}</div>
            <div className="text-gray-500">Aktywnych wypożyczeń</div>
          </div>
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="text-3xl font-bold text-red-600">{stats.overdueBorrowings}</div>
            <div className="text-gray-500">Przetrzymanych</div>
          </div>
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="text-3xl font-bold text-orange-600">{stats.unpaidFines.toFixed(2)} zł</div>
            <div className="text-gray-500">Nieopłaconych kar</div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={handleNewUser} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              + Nowy użytkownik
            </button>
          </div>
          <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium text-gray-700">Użytkownik</th>
                  <th className="text-left p-4 font-medium text-gray-700">Email</th>
                  <th className="text-left p-4 font-medium text-gray-700">Rola</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Data rejestracji</th>
                  <th className="text-left p-4 font-medium text-gray-700">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{user.firstName} {user.lastName}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${user.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {user.active ? "Aktywny" : "Nieaktywny"}
                      </span>
                    </td>
                    <td className="p-4">{new Date(user.createdAt).toLocaleDateString("pl-PL")}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditUser(user)} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                          Edytuj
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} disabled={deleting === user.id} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50">
                          {deleting === user.id ? "..." : "Usuń"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 font-medium text-gray-700">Data</th>
                <th className="text-left p-4 font-medium text-gray-700">Użytkownik</th>
                <th className="text-left p-4 font-medium text-gray-700">Akcja</th>
                <th className="text-left p-4 font-medium text-gray-700">Szczegóły</th>
                <th className="text-left p-4 font-medium text-gray-700">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{new Date(log.createdAt).toLocaleString("pl-PL")}</td>
                  <td className="p-4">{log.userEmail || "-"}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 font-mono">{log.action}</span>
                  </td>
                  <td className="p-4 max-w-xs truncate text-sm text-gray-600">{log.details}</td>
                  <td className="p-4 text-sm text-gray-500">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editingUser ? "Edytuj użytkownika" : "Nowy użytkownik"}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
                  <input type="text" value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
                  <input type="text" value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasło {editingUser && <span className="text-gray-400">(zostaw puste, aby nie zmieniać)</span>}
                </label>
                <input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rola</label>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="READER">Czytelnik</option>
                  <option value="LIBRARIAN">Bibliotekarz</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={userForm.active} onChange={(e) => setUserForm({ ...userForm, active: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Aktywny</label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowUserModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Anuluj
              </button>
              <button onClick={handleSaveUser} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "Zapisywanie..." : "Zapisz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
