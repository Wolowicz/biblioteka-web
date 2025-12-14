"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authLogin } from "@/lib/auth/index";

export default function WelcomePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isAnimating, setIsAnimating] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Focus states for floating labels
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Załaduj zapamiętany email przy starcie
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Password strength
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(regPassword);
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
  const strengthLabels = ["Bardzo słabe", "Słabe", "Średnie", "Dobre", "Silne"];

  // Tab switch animation
  const handleTabSwitch = (tab: "login" | "register") => {
    if (tab === activeTab) return;
    setIsAnimating(true);
    setError(null);
    setSuccess(null);
    setTimeout(() => {
      setActiveTab(tab);
      setIsAnimating(false);
    }, 150);
  };

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

      // Zapamiętaj email jeśli checkbox zaznaczony
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", loginEmail);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setSuccess("Pomyślnie zalogowano!");
      setTimeout(() => router.push("/"), 800);
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
      setTimeout(() => {
        handleTabSwitch("login");
        setLoginEmail(regEmail);
      }, 1000);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------
  // LOGOWANIE PRZEZ GOOGLE
  // ----------------------------------------
  function handleGoogleLogin() {
    // Przekierowanie do Google OAuth
    // W przyszłości: window.location.href = "/api/auth/google";
    setError("Logowanie przez Google będzie dostępne wkrótce!");
  }

  // ----------------------------------------
  // RENDEROWANIE
  // ----------------------------------------
  return (
    <div className="min-h-screen grid lg:grid-cols-[60%_40%] bg-white">

      {/* LEWA – TŁO Z OBRAZEM */}
      <div className="left-bg relative hidden lg:flex items-center justify-center overflow-hidden">
        {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-xs"></div>
        {/* Main content */}
        <div className="relative z-10 text-center px-12">
          
          
          <h1 className="text-7xl xl:text-9xl font-black text-white drop-shadow-lg tracking-tight mb-4">
            BiblioteQ
          </h1>
          
          <p className="text-2xl text-white/80 font-medium max-w-sm mx-auto">
            Twoja cyfrowa biblioteka
          </p>
        </div>
      </div>

      {/* PRAWA – FORMULARZE */}
      <div className="flex flex-col items-center justify-center px-8 sm:px-12 py-10 bg-gray-50/50">
        <div className="w-full max-w-md">

          {/* Logo dla mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-xl shadow-lg mb-3">
              <i className="fas fa-book-reader text-xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BiblioteQ</h1>
          </div>

          {/* Card container */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            
            {/* TYTUŁ */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === "login" ? "Miło Cię widzieć!" : "Dołącz do nas!"}
              </h2>
              <p className="mt-1 text-gray-500 text-sm">
                {activeTab === "login" 
                  ? "Zaloguj się do swojego konta" 
                  : "Utwórz konto w kilka sekund"}
              </p>
            </div>

            {/* PRZEŁĄCZANIE TABS */}
            <div className="relative bg-gray-100 rounded-xl p-1 mb-6">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out"
                style={{ left: activeTab === "login" ? "4px" : "calc(50%)" }}
              ></div>
              <div className="relative flex">
                <button
                  onClick={() => handleTabSwitch("login")}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                    activeTab === "login" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Logowanie
                </button>
                <button
                  onClick={() => handleTabSwitch("register")}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                    activeTab === "register" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <i className="fas fa-user-plus mr-2"></i>
                  Rejestracja
                </button>
              </div>
            </div>

            {/* KOMUNIKATY */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-shake">
                <i className="fas fa-exclamation-circle text-red-500"></i>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <i className="fas fa-check-circle text-green-500"></i>
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* FORMULARZE Z ANIMACJĄ */}
            <div className={`transition-all duration-150 ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
              
              {/* ---------------- FORMULARZ LOGOWANIA ---------------- */}
              {activeTab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div className="relative">
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === "loginEmail" || loginEmail ? "text-indigo-500" : "text-gray-400"
                    }`}>
                      <i className="fas fa-envelope text-sm"></i>
                    </div>
                    <input
                      type="email"
                      placeholder="Adres email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onFocus={() => setFocusedField("loginEmail")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 
                        focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 
                        transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Hasło */}
                  <div className="relative">
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === "loginPassword" || loginPassword ? "text-indigo-500" : "text-gray-400"
                    }`}>
                      <i className="fas fa-lock text-sm"></i>
                    </div>
                    <input
                      type={showPasswordLogin ? "text" : "password"}
                      placeholder="Hasło"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onFocus={() => setFocusedField("loginPassword")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 
                        focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 
                        transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordLogin((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center 
                        rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                    >
                      <i className={showPasswordLogin ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                    </button>
                  </div>

                  {/* Zapamiętaj + Zapomniałem */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group select-none">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                      />
                      <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Zapamiętaj mnie</span>
                    </label>
                    <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-all">
                      Zapomniałeś hasła?
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl 
                      shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 
                      transform hover:-translate-y-0.5 active:translate-y-0
                      transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Logowanie...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Zaloguj się
                        <i className="fas fa-arrow-right"></i>
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* ---------------- FORMULARZ REJESTRACJI ---------------- */}
              {activeTab === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Imię i Nazwisko */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                        focusedField === "regFirstName" || regFirstName ? "text-indigo-500" : "text-gray-400"
                      }`}>
                        <i className="fas fa-user text-sm"></i>
                      </div>
                      <input
                        type="text"
                        placeholder="Imię"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        onFocus={() => setFocusedField("regFirstName")}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50/50 
                          focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 
                          transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Nazwisko"
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        onFocus={() => setFocusedField("regLastName")}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50/50 
                          focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 
                          transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === "regEmail" || regEmail ? "text-indigo-500" : "text-gray-400"
                    }`}>
                      <i className="fas fa-envelope text-sm"></i>
                    </div>
                    <input
                      type="email"
                      placeholder="Adres email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      onFocus={() => setFocusedField("regEmail")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 
                        focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 
                        transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Hasło z miernikiem siły */}
                  <div className="space-y-2">
                    <div className="relative">
                      <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                        focusedField === "regPassword" || regPassword ? "text-indigo-500" : "text-gray-400"
                      }`}>
                        <i className="fas fa-lock text-sm"></i>
                      </div>
                      <input
                        type={showPasswordRegister ? "text" : "password"}
                        placeholder="Hasło"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        onFocus={() => setFocusedField("regPassword")}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 
                          focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 
                          transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordRegister((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center 
                          rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                      >
                        <i className={showPasswordRegister ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                      </button>
                    </div>
                    
                    {/* Password strength indicator */}
                    {regPassword && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"
                              }`}
                            ></div>
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${
                          passwordStrength <= 2 ? "text-red-500" : passwordStrength <= 3 ? "text-yellow-600" : "text-green-600"
                        }`}>
                          Siła hasła: {strengthLabels[passwordStrength - 1] || "Wprowadź hasło"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Regulamin */}
                  <label className="flex items-start gap-2 cursor-pointer group select-none">
                    <input type="checkbox" required className="w-4 h-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      Akceptuję <a href="#" className="text-indigo-600 hover:underline font-medium">regulamin</a> i{" "}
                      <a href="#" className="text-indigo-600 hover:underline font-medium">politykę prywatności</a>
                    </span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl 
                      shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 
                      transform hover:-translate-y-0.5 active:translate-y-0
                      transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Rejestrowanie...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Utwórz konto
                        <i className="fas fa-rocket"></i>
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-gray-400">lub</span>
              </div>
            </div>

            {/* Google login */}
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl 
                hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-gray-700 group-hover:text-gray-900">Kontynuuj z Google</span>
            </button>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            © 2024 BiblioteQ. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </div>
  );
}
