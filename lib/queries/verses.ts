import { getDb } from "../db";
import type { Verse, SearchResult } from "../types";

export function getVerses(bookNumber: number, chapter: number): Verse[] {
  return getDb()
    .prepare(
      "SELECT * FROM verses WHERE book_number = ? AND chapter = ? ORDER BY verse"
    )
    .all(bookNumber, chapter) as Verse[];
}

export function searchVerses(query: string, limit = 50): SearchResult[] {
  const db = getDb();
  // Use FTS5 for full-text search
  const ftsQuery = query
    .trim()
    .split(/\s+/)
    .map((w) => `"${w}"`)
    .join(" ");

  return db
    .prepare(
      `SELECT v.id, v.book_number, b.name as book_name, v.chapter, v.verse, v.text
       FROM verses v
       JOIN verses_fts fts ON v.id = fts.rowid
       JOIN books b ON v.book_number = b.number
       WHERE verses_fts MATCH ?
       LIMIT ?`
    )
    .all(ftsQuery, limit) as SearchResult[];
}
