/**
 * ADMIN SETTINGS PAGE - Ustawienia Konta Admina
 */

import { getUserSessionSSR } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/app/_components/AdminLayout";

export default async function AdminSettingsPage() {
  const user = await getUserSessionSSR();
  
  if (!user || (user.role !== "ADMIN" && user.role !== "LIBRARIAN")) {
    redirect("/admin/dashboard");
  }

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Ustawienia</h1>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <i className="fas fa-shield-alt mr-1" aria-hidden="true"></i>
            {user.role === "ADMIN" ? "System Administrator" : "Bibliotekarz"}
          </span>
        </div>
        <p className="text-gray-400">Zarządzaj swoim kontem {user.role === "ADMIN" ? "administratora" : "bibliotekarza"}</p>
      </div>

      {/* Profile Info */}
      <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-user text-purple-400" aria-hidden="true"></i>
          Informacje o koncie
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Imię</label>
            <p className="text-white font-medium text-lg">{user.firstName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Nazwisko</label>
            <p className="text-white font-medium text-lg">{user.lastName}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-400 block mb-1">Email</label>
            <p className="text-white font-medium text-lg">{user.email}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-400 block mb-1">Rola</label>
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                {user.role === "ADMIN" ? "Administrator" : "Bibliotekarz"}
              </span>
              {user.role === "ADMIN" && (
                <span className="text-sm text-gray-500">Pełne uprawnienia systemowe</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-lock text-purple-400" aria-hidden="true"></i>
          Zmiana hasła
        </h2>
        <div className="p-8 bg-gray-800/30 border border-gray-700 rounded-xl text-center">
          <i className="fas fa-key text-3xl text-gray-600 mb-3" aria-hidden="true"></i>
          <p className="text-gray-400 mb-2">Formularz zmiany hasła w przygotowaniu</p>
          <p className="text-sm text-gray-500">Będzie zawierał: aktualne hasło, nowe hasło (min. 8 znaków), potwierdzenie</p>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <i className="fas fa-shield-alt text-blue-400 mt-1" aria-hidden="true"></i>
          <div>
            <h3 className="font-bold text-blue-300 mb-1">Bezpieczeństwo konta</h3>
            <p className="text-sm text-blue-200/80">
              Twoje konto jest chronione przez system cookie-based authentication z hashowaniem bcrypt.
              Wszystkie akcje są logowane w tabeli audytu.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
