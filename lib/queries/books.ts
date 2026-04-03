import { getDb } from "../db";
import type { Book } from "../types";

export function getBooks(): Book[] {
  return getDb()
    .prepare("SELECT * FROM books ORDER BY number")
    .all() as Book[];
}

export function getBookByNumber(bookNumber: number): Book | undefined {
  return getDb()
    .prepare("SELECT * FROM books WHERE number = ?")
    .get(bookNumber) as Book | undefined;
}

export function getBooksByTestament(testament: "AT" | "NT"): Book[] {
  return getDb()
    .prepare("SELECT * FROM books WHERE testament = ? ORDER BY number")
    .all(testament) as Book[];
}
