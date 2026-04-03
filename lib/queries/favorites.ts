import { getDb } from "../db";
import type { Favorite } from "../types";

export function getFavorites(): Favorite[] {
  return getDb()
    .prepare(
      `SELECT f.id, f.verse_id, f.created_at,
              b.name as book_name, v.book_number, v.chapter, v.verse, v.text
       FROM favorites f
       JOIN verses v ON f.verse_id = v.id
       JOIN books b ON v.book_number = b.number
       ORDER BY f.created_at DESC`
    )
    .all() as Favorite[];
}

export function addFavorite(verseId: number): { id: number } | null {
  try {
    const result = getDb()
      .prepare("INSERT INTO favorites (verse_id) VALUES (?)")
      .run(verseId);
    return { id: Number(result.lastInsertRowid) };
  } catch {
    return null; // Already exists (UNIQUE constraint)
  }
}

export function removeFavorite(id: number): boolean {
  const result = getDb()
    .prepare("DELETE FROM favorites WHERE id = ?")
    .run(id);
  return result.changes > 0;
}

export function isFavorite(verseId: number): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM favorites WHERE verse_id = ?")
    .get(verseId);
  return !!row;
}

export function getFavoriteVerseIds(): Set<number> {
  const rows = getDb()
    .prepare("SELECT verse_id FROM favorites")
    .all() as { verse_id: number }[];
  return new Set(rows.map((r) => r.verse_id));
}
