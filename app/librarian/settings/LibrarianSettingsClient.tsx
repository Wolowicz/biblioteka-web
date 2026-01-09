"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LibrarianLayout from "@/app/_components/LibrarianLayout";
import type { UserSession } from "@/domain/types";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
}

export default function LibrarianSettingsClient({ user }: { user: UserSession }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<"profile" | "password" | "notifications">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Profile form
  const [profileForm, setProfileForm] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
  });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailOverdue: true,
    emailNewReservations: true,
    emailNewReviews: true,
    systemUpdates: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfileForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
        });
      }
    } catch {
      console.error("Błąd ładowania profilu");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Błąd zapisu");
      }
      
      setMessage({ type: "success", text: "Profil został zaktualizowany" });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Błąd zapisu profilu" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Hasła nie są identyczne" });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: "error", text: "Hasło musi mieć minimum 8 znaków" });
      return;
    }
    
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Błąd zmiany hasła");
      }
      
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Hasło zostało zmienione" });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Błąd zmiany hasła" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/welcome");
    } catch {
      console.error("Błąd wylogowania");
    }
  };

  return (
    <LibrarianLayout user={user}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <i className="fas fa-cog text-white"></i>
          </div>
          Ustawienia konta
        </h2>
        <p className="text-gray-400 mt-1">Zarządzaj swoim profilem i preferencjami</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
          message.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          <i className={`fas ${message.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto text-current opacity-70 hover:opacity-100"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-2 space-y-1">
            <button
              onClick={() => setActiveSection("profile")}
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-colors ${
                activeSection === "profile"
                  ? "bg-linear-to-r from-emerald-500/20 to-teal-600/20 text-white border-l-2 border-emerald-500"
                  : "text-gray-400 hover:bg-[#3D3D45] hover:text-white"
              }`}
            >
              <i className="fas fa-user w-5"></i>
              Dane osobowe
            </button>
            <button
              onClick={() => setActiveSection("password")}
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-colors ${
                activeSection === "password"
                  ? "bg-linear-to-r from-emerald-500/20 to-teal-600/20 text-white border-l-2 border-emerald-500"
                  : "text-gray-400 hover:bg-[#3D3D45] hover:text-white"
              }`}
            >
              <i className="fas fa-lock w-5"></i>
              Zmiana hasła
            </button>
            <button
              onClick={() => setActiveSection("notifications")}
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-colors ${
                activeSection === "notifications"
                  ? "bg-linear-to-r from-emerald-500/20 to-teal-600/20 text-white border-l-2 border-emerald-500"
                  : "text-gray-400 hover:bg-[#3D3D45] hover:text-white"
              }`}
            >
              <i className="fas fa-bell w-5"></i>
              Powiadomienia
            </button>
            <div className="border-t border-gray-700/50 my-2"></div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <i className="fas fa-sign-out-alt w-5"></i>
              Wyloguj się
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-[#2D2D35] rounded-xl p-8 flex items-center justify-center border border-gray-700/50">
              <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Profile Section */}
              {activeSection === "profile" && (
                <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <i className="fas fa-user text-emerald-400"></i>
                    Dane osobowe
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Imię</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        placeholder="Imię"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nazwisko</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        placeholder="Nazwisko"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email nie może być zmieniony</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Telefon</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        placeholder="+48 123 456 789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Data urodzenia</label>
                      <input
                        type="date"
                        value={profileForm.birthDate}
                        onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Adres</label>
                      <textarea
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                        placeholder="Ulica, numer, miasto..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-6 py-2 bg-linear-to-rrom-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Zapisywanie...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          Zapisz zmiany
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Password Section */}
              {activeSection === "password" && (
                <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <i className="fas fa-lock text-emerald-400"></i>
                    Zmiana hasła
                  </h3>
                  
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Obecne hasło</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nowe hasło</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        placeholder="Minimum 8 znaków"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Potwierdź nowe hasło</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1F1F23] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        placeholder="Powtórz hasło"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleChangePassword}
                      disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
                      className="px-6 py-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Zmienianie...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-key"></i>
                          Zmień hasło
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <div className="bg-[#2D2D35] border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <i className="fas fa-bell text-emerald-400"></i>
                    Powiadomienia
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#1F1F23] rounded-lg">
                      <div>
                        <p className="font-medium text-white">Przetrzymane książki</p>
                        <p className="text-sm text-gray-400">Powiadomienia email o przetrzymanych wypożyczeniach</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailOverdue}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailOverdue: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-[#1F1F23] rounded-lg">
                      <div>
                        <p className="font-medium text-white">Nowe rezerwacje</p>
                        <p className="text-sm text-gray-400">Powiadomienia o nowych rezerwacjach książek</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNewReservations}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNewReservations: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-[#1F1F23] rounded-lg">
                      <div>
                        <p className="font-medium text-white">Nowe recenzje</p>
                        <p className="text-sm text-gray-400">Powiadomienia o recenzjach do moderacji</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNewReviews}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNewReviews: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-[#1F1F23] rounded-lg">
                      <div>
                        <p className="font-medium text-white">Aktualizacje systemu</p>
                        <p className="text-sm text-gray-400">Powiadomienia o nowych funkcjach i zmianach</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.systemUpdates}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, systemUpdates: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    <i className="fas fa-info-circle mr-2"></i>
                    Ustawienia powiadomień zostaną zapisane automatycznie
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Role Badge */}
      <div className="mt-6 bg-[#2D2D35] border border-gray-700/50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold">
            {user.firstName?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300">
          <i className="fas fa-id-badge mr-2"></i>
          Bibliotekarz
        </div>
      </div>
    </LibrarianLayout>
  );
}
