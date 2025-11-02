// app/_data/books.ts
export type BookVM = {
  id: number;
  title: string;
  authors: string;
  isbn?: string | null;
  publisher?: string | null;
  year?: number | null;
  available: boolean;
};

export const BOOKS: BookVM[] = [
  {
    id: 1,
    title: "Wiedźmin: Ostatnie życzenie",
    authors: "Andrzej Sapkowski",
    isbn: "9788375780642",
    publisher: "SuperNOWA",
    year: 2014,
    available: true,
  },
  {
    id: 2,
    title: "Pan Tadeusz",
    authors: "Adam Mickiewicz",
    isbn: "9788304061494",
    publisher: "Ossolineum",
    year: 2012,
    available: false,
  },
  {
    id: 3,
    title: "Clean Code",
    authors: "Robert C. Martin",
    isbn: "9780132350884",
    publisher: "Prentice Hall",
    year: 2008,
    available: true,
  },
];

export function getAllBooks(): BookVM[] {
  return BOOKS;
}
export function getBookById(id: number): BookVM | undefined {
  return BOOKS.find(b => b.id === id);
}
