"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  //Trzymam wszystkie pola formularza w jednym obiekcie form.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Błąd rejestracji");
        return;
      }

      setSuccess("Konto utworzone. Możesz się zalogować.");
      setForm({ firstName: "", lastName: "", email: "", password: "" });
    } catch (err) {
      setError("Problem z połączeniem"); // W catch – komunikat o problemie z siecią.
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-emerald-400 to-teal-500 flex items-center justify-center px-4 text-slate-900">
      <div className="max-w-lg w-full rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Rejestracja</h1>
          <p className="text-sm text-slate-600 mt-1">
            Utwórz konto użytkownika BiblioteQ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Imię</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nazwisko</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hasło</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Min. 8 znaków, wielka i mała litera, cyfra i znak specjalny.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? "Rejestrowanie..." : "Zarejestruj się"}
          </button>
        </form>

        <div className="text-center text-sm">
          Masz już konto?{" "}
          <button
            onClick={() => (window.location.href = "/login")}
            className="underline font-semibold text-emerald-700"
          >
            Zaloguj się
          </button>
        </div>
      </div>
    </div>
  );
}
