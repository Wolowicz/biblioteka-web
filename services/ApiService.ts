/**
 * =============================================================================
 * API SERVICE - Abstrakcyjna klasa bazowa dla serwisów API
 * =============================================================================
 * 
 * Klasa ApiService zapewnia wspólną logikę dla wszystkich serwisów komunikujących
 * się z API. Implementuje wzorzec Template Method dla obsługi żądań HTTP.
 * 
 * Funkcjonalności:
 * - Standaryzacja żądań HTTP (nagłówki, credentials)
 * - Obsługa błędów i timeout'ów
 * - Parsowanie odpowiedzi JSON
 * - Logowanie błędów (w trybie developerskim)
 * 
 * Użycie:
 * Klasy dziedziczące po ApiService powinny implementować konkretne metody
 * dla swoich endpointów.
 */

import { ApiErrorResponse } from "@/domain/types";

/**
 * Konfiguracja pojedynczego żądania API.
 */
interface RequestConfig {
  /** Metoda HTTP (GET, POST, PUT, DELETE) */
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Ciało żądania (zostanie zserializowane do JSON) */
  body?: unknown;
  /** Dodatkowe nagłówki HTTP */
  headers?: Record<string, string>;
  /** Czy używać cache (domyślnie: no-store) */
  cache?: RequestCache;
}

/**
 * Wynik żądania API - sukces lub błąd.
 * Używa wzorca Result do bezpiecznej obsługi odpowiedzi.
 */
type ApiResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; status?: number };

/**
 * Abstrakcyjna klasa bazowa dla serwisów API.
 * Zapewnia wspólną logikę dla komunikacji z backendem.
 */
export abstract class ApiService {
  /** Bazowy URL API (względny - używa tego samego hosta) */
  protected readonly baseUrl: string;

  /**
   * Konstruktor klasy ApiService.
   * 
   * @param basePath - Ścieżka bazowa dla endpointów (np. "/api/books")
   */
  constructor(basePath: string) {
    this.baseUrl = basePath;
  }

  /**
   * Wykonuje żądanie HTTP do API.
   * 
   * @param endpoint - Ścieżka endpointu (dołączana do baseUrl)
   * @param config - Konfiguracja żądania
   * @returns Promise z wynikiem (sukces lub błąd)
   */
  protected async request<T>(
    endpoint: string = "",
    config: RequestConfig = {}
  ): Promise<ApiResult<T>> {
    const { method = "GET", body, headers = {}, cache = "no-store" } = config;

    // Budowanie pełnego URL
    const url = `${this.baseUrl}${endpoint}`;

    try {
      // Przygotowanie opcji fetch
      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: "include", // Zawsze wysyłaj cookies (sesja)
        cache,
      };

      // Dodaj body tylko dla metod które go wymagają
      if (body && method !== "GET") {
        fetchOptions.body = JSON.stringify(body);
      }

      // Wykonanie żądania
      const response = await fetch(url, fetchOptions);

      // Parsowanie odpowiedzi
      const data = await response.json();

      // Sprawdzenie statusu odpowiedzi
      if (!response.ok) {
        const errorResponse = data as ApiErrorResponse;
        return {
          success: false,
          error: errorResponse.error || "Wystąpił błąd",
          status: response.status,
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      // Logowanie błędu w trybie developerskim
      if (process.env.NODE_ENV === "development") {
        console.error(`API Error [${method} ${url}]:`, error);
      }

      return {
        success: false,
        error: "Nie można połączyć się z serwerem",
      };
    }
  }

  /**
   * Wykonuje żądanie GET.
   */
  protected async get<T>(endpoint: string = ""): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * Wykonuje żądanie POST.
   */
  protected async post<T>(
    endpoint: string = "",
    body?: unknown
  ): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  /**
   * Wykonuje żądanie PUT.
   */
  protected async put<T>(
    endpoint: string = "",
    body?: unknown
  ): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  /**
   * Wykonuje żądanie DELETE.
   */
  protected async delete<T>(endpoint: string = ""): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

/**
 * Typ pomocniczy dla wyniku API (eksportowany do użycia w innych miejscach).
 */
export type { ApiResult };
