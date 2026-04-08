import { getDb } from "../db";
import type { Verse, SearchResult } from "../types";

export function getVerses(versionId: string, bookNumber: number, chapter: number): Verse[] {
  return getDb()
    .prepare(
      "SELECT * FROM verses WHERE version_id = ? AND book_number = ? AND chapter = ? ORDER BY verse"
    )
    .all(versionId, bookNumber, chapter) as Verse[];
}

export function searchVerses(versionId: string, query: string, limit = 50): SearchResult[] {
  const db = getDb();
  // Use FTS5 for full-text search, filtered by version
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
       JOIN books b ON v.book_number = b.number AND v.version_id = b.version_id
       WHERE verses_fts MATCH ?
         AND v.version_id = ?
       LIMIT ?`
    )
    .all(ftsQuery, versionId, limit) as SearchResult[];
}
