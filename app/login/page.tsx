// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole, setUserSession } from "@/lib/auth-client";
import { roleThemes, authCard, loginFormStyles } from "@/lib/ui/styles";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      const role = data.role as UserRole;
      setLoggedRole(role);

      setUserSession({
        id: String(data.id),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role,
      });

      router.push("/");
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

  // tło: przed logiem – gradient, po logowaniu na chwilę kolor wg roli
  const backgroundClass = loggedRole
    ? roleThemes[loggedRole]
    : authCard.unloggedBackground;

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${backgroundClass}`}
    >
      <div className={authCard.wrapper}>
        <div className={authCard.card}>
          {/* nagłówek */}
          <div className={authCard.headerWrapper}>
            <h1 className={authCard.title}>BiblioteQ</h1>
            <p className={authCard.subtitle}>
              System zarządzania biblioteką
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* email */}
            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Email
              </label>
              <input
                type="email"
                required
                className={loginFormStyles.input}
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* hasło + oczko */}
            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Hasło
              </label>
              <div className={loginFormStyles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={`${loginFormStyles.input} ${loginFormStyles.passwordInputPadding}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={loginFormStyles.passwordToggle}
                >
                  <i
                    className={
                      showPassword ? "fas fa-eye-slash" : "fas fa-eye"
                    }
                  />
                </button>
              </div>
              <p className={loginFormStyles.helperText}>
                Min. 8 znaków, wielka i mała litera, cyfra, znak specjalny.
              </p>
            </div>

            {error && <p className={loginFormStyles.error}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={loginFormStyles.button}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className={loginFormStyles.loadingSpinner} />
                  Logowanie...
                </span>
              ) : (
                "Zaloguj się"
              )}
            </button>
          </form>

          <div className={loginFormStyles.footerText}>
            <p>
              Nie masz konta?{" "}
              <button
                type="button"
                onClick={goToRegister}
                className={loginFormStyles.registerLink}
              >
                Zarejestruj się
              </button>
            </p>
          </div>

          {loggedRole && (
            <div className={loginFormStyles.loggedRole}>
              Zalogowano jako: <b>{loggedRole}</b>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
