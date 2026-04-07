import { getDb } from "../db";
import type { Favorite } from "../types";

export function getFavorites(userId: string): Favorite[] {
  return getDb()
    .prepare(
      `SELECT f.id, f.verse_id, f.created_at,
              b.name as book_name, v.book_number, v.chapter, v.verse, v.text
       FROM favorites f
       JOIN verses v ON f.verse_id = v.id
       JOIN books b ON v.book_number = b.number
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`
    )
    .all(userId) as Favorite[];
}

export function addFavorite(userId: string, verseId: number): { id: number } | null {
  try {
    const result = getDb()
      .prepare("INSERT INTO favorites (user_id, verse_id) VALUES (?, ?)")
      .run(userId, verseId);
    return { id: Number(result.lastInsertRowid) };
  } catch {
    return null; // Already exists (UNIQUE constraint on user_id, verse_id)
  }
}

export function removeFavorite(userId: string, id: number): boolean {
  const result = getDb()
    .prepare("DELETE FROM favorites WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return result.changes > 0;
}

export function isFavorite(userId: string, verseId: number): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM favorites WHERE user_id = ? AND verse_id = ?")
    .get(userId, verseId);
  return !!row;
}

export function getFavoriteVerseIds(userId: string): Set<number> {
  const rows = getDb()
    .prepare("SELECT verse_id FROM favorites WHERE user_id = ?")
    .all(userId) as { verse_id: number }[];
  return new Set(rows.map((r) => r.verse_id));
}
