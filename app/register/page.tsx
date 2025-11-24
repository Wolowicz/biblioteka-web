// app/register/page.tsx
"use client";

import { useState } from "react";
import { registerFormStyles } from "@/lib/ui/styles"; 
import { validatePassword } from "@/lib/auth-client"; // Działanie tylko w ramach client component, więc OK

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  
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

      setSuccess("Konto utworzone. Możesz przejść do logowania.");
      setForm({ firstName: "", lastName: "", email: "", password: "" });
    } catch (err) {
      setError("Problem z połączeniem"); 
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={registerFormStyles.wrapper}>
      <div className={registerFormStyles.card}>
        <div className="text-center">
          <h1 className={registerFormStyles.headerTitle}>Rejestracja</h1>
          <p className={registerFormStyles.headerSubtitle}>
            Utwórz konto użytkownika BiblioteQ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Imię</label>
              <input
                className={registerFormStyles.input}
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nazwisko</label>
              <input
                className={registerFormStyles.input}
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
              className={registerFormStyles.input}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hasło</label>
            <div className={registerFormStyles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"} 
                className={`${registerFormStyles.input} ${registerFormStyles.passwordInputPadding}`} 
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
              />
              {/* Przycisk "oczko" */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={registerFormStyles.passwordToggle}
              >
                {/* ⬅️ ZMIANA: Używamy ikon Font Awesome */}
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
            <p className={registerFormStyles.helperText}>
              Min. 8 znaków, wielka i mała litera, cyfra i znak specjalny.
            </p>
          </div>

          {error && (
            <p className={registerFormStyles.error}>
              {error}
            </p>
          )}

          {success && (
            <p className={registerFormStyles.success}>
              {success}
              <button
                onClick={() => (window.location.href = "/login")}
                className="underline font-semibold ml-2"
              >
                Zaloguj się
              </button>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={registerFormStyles.button}
          >
            {loading ? "Rejestrowanie..." : "Zarejestruj się"}
          </button>
        </form>

        <div className="text-center text-sm">
          Masz już konto?{" "}
          <button
            onClick={() => (window.location.href = "/login")}
            className={registerFormStyles.loginLink}
          >
            Zaloguj się
          </button>
        </div>
      </div>
    </div>
  );
}