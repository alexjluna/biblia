import { getDb } from "../db";
import type { Book } from "../types";

export function getBooks(versionId: string): Book[] {
  return getDb()
    .prepare("SELECT * FROM books WHERE version_id = ? ORDER BY sort_order")
    .all(versionId) as Book[];
}

export function getBookByNumber(versionId: string, bookNumber: number): Book | undefined {
  return getDb()
    .prepare("SELECT * FROM books WHERE version_id = ? AND number = ?")
    .get(versionId, bookNumber) as Book | undefined;
}

export function getBooksByTestament(versionId: string, testament: "AT" | "NT"): Book[] {
  return getDb()
    .prepare("SELECT * FROM books WHERE version_id = ? AND testament = ? ORDER BY sort_order")
    .all(versionId, testament) as Book[];
}

export function getAdjacentBook(
  versionId: string,
  currentBookNumber: number,
  direction: "prev" | "next"
): Book | null {
  const currentBook = getBookByNumber(versionId, currentBookNumber);
  if (!currentBook) return null;

  const op = direction === "next" ? ">" : "<";
  const order = direction === "next" ? "ASC" : "DESC";

  const row = getDb()
    .prepare(
      `SELECT * FROM books WHERE version_id = ? AND sort_order ${op} ? ORDER BY sort_order ${order} LIMIT 1`
    )
    .get(versionId, currentBook.sort_order) as Book | undefined;

  return row ?? null;
}
