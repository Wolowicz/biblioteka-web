"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { getRoleTheme, UserRole } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // czy hasło ma być widoczne (oczko)
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedRole, setLoggedRole] = useState<UserRole | null>(null);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Błąd logowania");
      return;
    }

    setLoggedRole(data.role as UserRole);

    // TU: przekierowanie po udanym logowaniu
    router.push("/");   // później np. "/admin", "/panel", itd.

  } catch (err) {
    console.error(err);
    setError("Problem z połączeniem z serwerem");
  } finally {
    setLoading(false);
  }
}


  function goToRegister() {
    window.location.href = "/register";
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        loggedRole
          ? getRoleTheme(loggedRole)
          : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white"
      }`}
    >
      <div className="max-w-md w-full">
        <div className="rounded-2xl p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
          {/* nagłówek bez ikonki */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              BiblioteQ
            </h1>
            <p className="text-sm opacity-80 mt-1">
              Twoja biblioteka w jednym miejscu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* hasło + oczko */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Hasło
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* przycisk „oczko” po prawej */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center text-sm opacity-80 hover:opacity-100"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="mt-1 text-xs opacity-80">
                Min. 8 znaków, wielka i mała litera, cyfra, znak specjalny.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-200 bg-red-900/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-purple-700 py-2.5 rounded-lg font-semibold hover:bg-white/90 transition flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Logowanie...
                </span>
              ) : (
                "Zaloguj się"
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <p>
              Nie masz konta?{" "}
              <button
                type="button"
                onClick={goToRegister}
                className="underline font-semibold"
              >
                Zarejestruj się
              </button>
            </p>
          </div>

          {loggedRole && (
            <div className="mt-4 text-xs opacity-80 text-center">
              Zalogowano jako: <b>{loggedRole}</b>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
