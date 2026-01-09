"use client";

import { useState } from "react";
import { AdminLayout } from "@/app/_components/AdminLayout";
import type { UserSession } from "@/domain/types";

export default function AdminSettingsClient({ user }: { user: UserSession }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSaveProfile() {
    try {
      setSaving(true);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
        }),
      });

      if (response.ok) {
        alert("Dane zostały zaktualizowane");
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || "Błąd aktualizacji danych");
      }
    } catch (error) {
      console.error("Błąd aktualizacji:", error);
      alert("Wystąpił błąd podczas aktualizacji");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      alert("Nowe hasła nie są identyczne");
      return;
    }

    if (newPassword.length < 8) {
      alert("Hasło musi mieć co najmniej 8 znaków");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        alert("Hasło zostało zmienione");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        alert(data.error || "Błąd zmiany hasła");
      }
    } catch (error) {
      console.error("Błąd zmiany hasła:", error);
      alert("Wystąpił błąd podczas zmiany hasła");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ustawienia</h1>
        <p className="text-gray-400">Zarządzaj swoim kontem i preferencjami</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-user-circle text-purple-400" aria-hidden="true"></i>
            Dane profilowe
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Imię</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nazwisko</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Rola</label>
              <div className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400">
                {user.role === "ADMIN" ? "Administrator" : user.role === "LIBRARIAN" ? "Bibliotekarz" : "Czytelnik"}
                <span className="ml-2 text-xs">(nie można zmienić)</span>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all"
            >
              {saving ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-lock text-purple-400" aria-hidden="true"></i>
            Zmiana hasła
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Obecne hasło</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nowe hasło</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 znaków</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Potwierdź nowe hasło</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all"
            >
              {saving ? "Zmiana hasła..." : "Zmień hasło"}
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-info-circle text-purple-400" aria-hidden="true"></i>
            Informacje o koncie
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">ID użytkownika</span>
              <span className="font-mono text-gray-300">#{user.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Status konta</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                Aktywne
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Typ konta</span>
              <span className="text-gray-300">
                {user.role === "ADMIN" ? "Administrator" : user.role === "LIBRARIAN" ? "Bibliotekarz" : "Czytelnik"}
              </span>
            </div>
          </div>
        </div>


      </div>
    </AdminLayout>
  );
}
