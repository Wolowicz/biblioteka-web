/**
 * =============================================================================
 * BOOKS SERVICE - Serwis do obsługi katalogu książek
 * =============================================================================
 * 
 * Klasa BooksService obsługuje wszystkie operacje związane z książkami:
 * - Pobieranie listy książek
 * - Pobieranie szczegółów książki
 * - Filtrowanie i sortowanie
 * - Konwersja na modele OOP
 * 
 * Zależności:
 * - ApiService - klasa bazowa z logiką HTTP
 * - @/domain/types - typy książek
 * - @/domain/models - klasy OOP
 * 
 * Wzorzec: Singleton - jedna instancja dla całej aplikacji
 * 
 * @packageDocumentation
 */

import { ApiService, ApiResult } from "./ApiService";
import { BookViewModel, BookDetails } from "@/domain/types";
import { Book } from "@/domain/models";

/**
 * Serwis do obsługi operacji na książkach.
 * Komunikuje się z endpointami /api/books/*.
 */
class BooksService extends ApiService {
  constructor() {
    super("/api/books");
  }

  // ===========================================================================
  // OPERACJE CRUD
  // ===========================================================================

  /**
   * Pobiera listę wszystkich książek.
   * 
   * @returns Lista książek jako BookViewModel[]
   */
  public async getAll(): Promise<ApiResult<BookViewModel[]>> {
    return this.get<BookViewModel[]>("");
  }

  /**
   * Pobiera listę książek jako modele OOP.
   * 
   * @returns Lista książek jako instancje klasy Book
   */
  public async getAllAsModels(): Promise<ApiResult<Book[]>> {
    const result = await this.getAll();
    
    if (!result.success) {
      return result as ApiResult<Book[]>;
    }

    return {
      success: true,
      data: Book.fromAPIList(result.data),
    };
  }

  /**
   * Pobiera szczegóły pojedynczej książki.
   * 
   * @param id - ID książki
   * @returns Szczegóły książki lub błąd 404
   */
  public async getById(id: number): Promise<ApiResult<BookDetails>> {
    return this.get<BookDetails>(`/${id}`);
  }

  /**
   * Pobiera szczegóły książki jako model OOP.
   * 
   * @param id - ID książki
   * @returns Instancja klasy Book lub błąd
   */
  public async getByIdAsModel(id: number): Promise<ApiResult<Book>> {
    const result = await this.getById(id);
    
    if (!result.success) {
      return result as ApiResult<Book>;
    }

    return {
      success: true,
      data: Book.fromAPI(result.data),
    };
  }

  // ===========================================================================
  // FILTROWANIE I SORTOWANIE (CLIENT-SIDE)
  // ===========================================================================

  /**
   * Filtruje książki po frazie wyszukiwania.
   * 
   * @param books - Lista książek
   * @param query - Fraza wyszukiwania
   * @returns Przefiltrowana lista
   */
  public filterByQuery(books: BookViewModel[], query: string): BookViewModel[] {
    if (!query.trim()) return books;
    
    const lowerQuery = query.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.authors.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Filtruje książki po statusie dostępności.
   * 
   * @param books - Lista książek
   * @param status - "Wszystkie" | "Dostępne" | "Niedostępne"
   * @returns Przefiltrowana lista
   */
  public filterByStatus(
    books: BookViewModel[], 
    status: string
  ): BookViewModel[] {
    if (status === "Wszystkie") return books;
    
    return books.filter((book) =>
      status === "Dostępne" ? book.available : !book.available
    );
  }

  /**
   * Sortuje książki według wybranej metody.
   * 
   * @param books - Lista książek
   * @param sortBy - Metoda sortowania
   * @returns Posortowana lista (nowa tablica)
   */
  public sortBooks(
    books: BookViewModel[], 
    sortBy: string
  ): BookViewModel[] {
    if (sortBy === "Tytuł A-Z") {
      return [...books].sort((a, b) => 
        a.title.localeCompare(b.title, "pl")
      );
    }
    
    if (sortBy === "Tytuł Z-A") {
      return [...books].sort((a, b) => 
        b.title.localeCompare(a.title, "pl")
      );
    }
    
    // "Popularność" - zachowaj oryginalną kolejność
    return books;
  }

  /**
   * Aplikuje wszystkie filtry i sortowanie naraz.
   * 
   * @param books - Lista książek
   * @param options - Opcje filtrowania i sortowania
   * @returns Przefiltrowana i posortowana lista
   */
  public applyFilters(
    books: BookViewModel[],
    options: {
      query?: string;
      status?: string;
      sortBy?: string;
    }
  ): BookViewModel[] {
    let result = books;

    if (options.query) {
      result = this.filterByQuery(result, options.query);
    }

    if (options.status) {
      result = this.filterByStatus(result, options.status);
    }

    if (options.sortBy) {
      result = this.sortBooks(result, options.sortBy);
    }

    return result;
  }

  /**
   * Paginuje listę książek.
   * 
   * @param books - Lista książek
   * @param page - Numer strony (1-indexed)
   * @param pageSize - Liczba elementów na stronę
   * @returns Książki dla danej strony
   */
  public paginate(
    books: BookViewModel[], 
    page: number, 
    pageSize: number = 10
  ): BookViewModel[] {
    const start = (page - 1) * pageSize;
    return books.slice(start, start + pageSize);
  }
}

// =============================================================================
// EKSPORT SINGLETONA
// =============================================================================

/**
 * Singleton instancja serwisu książek.
 * 
 * @example
 * import { booksService } from "@/services";
 * const books = await booksService.getAll();
 */
export const booksService = new BooksService();
