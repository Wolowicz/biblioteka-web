/**
 * =============================================================================
 * AUTH SERVICE - Serwis do obsługi autoryzacji
 * =============================================================================
 * 
 * Klasa AuthService obsługuje wszystkie operacje związane z autoryzacją:
 * - Logowanie i wylogowywanie
 * - Rejestracja nowych użytkowników
 * - Pobieranie sesji użytkownika
 * - Walidacja haseł
 * 
 * Zależności:
 * - ApiService - klasa bazowa z logiką HTTP
 * - @/domain/types - typy autoryzacji
 * 
 * Wzorzec: Singleton - jedna instancja dla całej aplikacji
 */

import { ApiService, ApiResult } from "./ApiService";
import { 
  UserSession, 
  LoginCredentials, 
  RegisterData,
  LoginResponse,
  RegisterResponse 
} from "@/domain/types";

/**
 * Serwis do obsługi operacji autoryzacji.
 * Komunikuje się z endpointami /api/auth/*.
 */
class AuthService extends ApiService {
  constructor() {
    super("/api/auth");
  }

  // ===========================================================================
  // OPERACJE AUTORYZACJI
  // ===========================================================================

  /**
   * Loguje użytkownika do systemu.
   * 
   * @param credentials - Dane logowania (email, hasło)
   * @returns Dane sesji użytkownika lub błąd
   * 
   * Efekty uboczne:
   * - Ustawia cookie sesji (httpOnly)
   */
  public async login(
    credentials: LoginCredentials
  ): Promise<ApiResult<LoginResponse>> {
    return this.post<LoginResponse>("/login", credentials);
  }

  /**
   * Wylogowuje użytkownika z systemu.
   * 
   * Efekty uboczne:
   * - Usuwa cookie sesji
   */
  public async logout(): Promise<ApiResult<{ ok: boolean }>> {
    return this.post<{ ok: boolean }>("/logout");
  }

  /**
   * Rejestruje nowego użytkownika.
   * 
   * @param data - Dane rejestracji
   * @returns Potwierdzenie rejestracji lub błąd
   * 
   * Walidacja:
   * - Email musi być unikalny
   * - Hasło musi spełniać wymagania bezpieczeństwa
   */
  public async register(
    data: RegisterData
  ): Promise<ApiResult<RegisterResponse>> {
    return this.post<RegisterResponse>("/register", data);
  }

  /**
   * Pobiera aktualną sesję użytkownika.
   * 
   * @returns Dane sesji lub null jeśli niezalogowany
   */
  public async getSession(): Promise<ApiResult<{ user: UserSession | null }>> {
    return this.get<{ user: UserSession | null }>("/session");
  }

  // ===========================================================================
  // WALIDACJA
  // ===========================================================================

  /**
   * Waliduje hasło według wymagań bezpieczeństwa.
   * 
   * Wymagania:
   * - Minimum 8 znaków
   * - Co najmniej jedna duża litera
   * - Co najmniej jedna mała litera
   * - Co najmniej jedna cyfra
   * - Co najmniej jeden znak specjalny (!@#$%^&*)
   * 
   * @param password - Hasło do walidacji
   * @returns Komunikat błędu lub null jeśli hasło poprawne
   */
  public validatePassword(password: string): string | null {
    if (password.length < 8) {
      return "Hasło musi mieć co najmniej 8 znaków";
    }
    if (!/[A-Z]/.test(password)) {
      return "Hasło musi zawierać dużą literę";
    }
    if (!/[a-z]/.test(password)) {
      return "Hasło musi zawierać małą literę";
    }
    if (!/[0-9]/.test(password)) {
      return "Hasło musi zawierać cyfrę";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Hasło musi zawierać znak specjalny";
    }
    return null;
  }

  /**
   * Waliduje format adresu email.
   * 
   * @param email - Email do walidacji
   * @returns true jeśli email poprawny
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Singleton instance serwisu autoryzacji.
 * Użycie: import { authService } from "@/services";
 */
export const authService = new AuthService();
