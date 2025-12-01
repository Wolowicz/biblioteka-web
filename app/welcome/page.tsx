"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authLogin } from "@/lib/auth/index";

export default function WelcomePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);

  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ----------------------------------------
  // LOGOWANIE — używa authLogin() z cookies
  // ----------------------------------------
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authLogin(loginEmail, loginPassword);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Błąd logowania");
        return;
      }

      setSuccess("Pomyślnie zalogowano!");
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------
  // REJESTRACJA
  // ----------------------------------------
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Błąd rejestracji");
        return;
      }

      setSuccess("Konto utworzone! Możesz się zalogować.");
      setActiveTab("login");
      setLoginEmail(regEmail);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------
  // RENDEROWANIE
  // ----------------------------------------
  return (
    <div className="grid min-h-screen md:grid-cols-[65%_35%] bg-white">

      {/* LEWA – TŁO */}
      <div className="left-bg relative hidden md:flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
        <h1 className="relative z-10 text-8xl xl:text-9xl font-extrabold text-white drop-shadow-lg tracking-tight">
          BiblioteQ
        </h1>
      </div>

      {/* PRAWA – FORMULARZE */}
      <div className="flex flex-col items-center justify-center px-10 py-14 bg-white">
        <div className="w-full max-w-md space-y-10">

          {/* TYTUŁ */}
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Witaj w BiblioteQ
            </h2>
            <p className="mt-3 text-gray-500 text-5sm">
              Zaloguj się lub utwórz konto
            </p>
          </div>

          {/* PRZEŁĄCZANIE LOGIN/REGISTER */}
          <div className="border-b border-gray-200 flex justify-center">
            <nav className="flex -mb-px space-x-10">

              <button
                onClick={() => setActiveTab("login")}
                className={`pb-3 font-medium text-sm transition ${
                  activeTab === "login"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Logowanie
              </button>

              <button
                onClick={() => setActiveTab("register")}
                className={`pb-3 font-medium text-sm transition ${
                  activeTab === "register"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Rejestracja
              </button>
            </nav>
          </div>

          {/* KOMUNIKATY */}
          {error && <p className="text-red-600 font-semibold text-center">{error}</p>}
          {success && <p className="text-green-600 font-semibold text-center">{success}</p>}

          {/* ---------------- FORMULARZ LOGOWANIA ---------------- */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-6">
              <input
                type="email"
                placeholder="Adres email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <div className="relative">
                <input
                  type={showPasswordLogin ? "text" : "password"}
                  placeholder="Hasło"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordLogin((p) => !p)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                >
                  <i className={showPasswordLogin ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition text-white font-semibold rounded-xl shadow-md"
              >
                {loading ? "Logowanie…" : "Zaloguj się"}
              </button>
            </form>
          )}

          {/* ---------------- FORMULARZ REJESTRACJI ---------------- */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-6">

              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Imię"
                  required
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Nazwisko"
                  required
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <input
                type="email"
                placeholder="Adres email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <div className="relative">
                <input
                  type={showPasswordRegister ? "text" : "password"}
                  placeholder="Hasło"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordRegister((p) => !p)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                >
                  <i className={showPasswordRegister ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition text-white font-semibold rounded-xl shadow-md"
              >
                {loading ? "Rejestrowanie…" : "Utwórz konto"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
