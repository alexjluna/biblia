import { getDb } from "../db";

export interface Collection {
  id: number;
  name: string;
  verseCount: number;
  createdAt: string;
}

export function getUserCollections(userId: string): Collection[] {
  return getDb()
    .prepare(
      `SELECT c.id, c.name, COUNT(cv.favorite_id) as verseCount, c.created_at as createdAt
       FROM collections c
       LEFT JOIN collection_verses cv ON c.id = cv.collection_id
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY c.name ASC`
    )
    .all(userId) as Collection[];
}

export function createCollection(userId: string, name: string): { id: number } | null {
  try {
    const result = getDb()
      .prepare("INSERT INTO collections (user_id, name) VALUES (?, ?)")
      .run(userId, name);
    return { id: Number(result.lastInsertRowid) };
  } catch {
    return null; // UNIQUE constraint
  }
}

export function deleteCollection(userId: string, collectionId: number): boolean {
  const result = getDb()
    .prepare("DELETE FROM collections WHERE id = ? AND user_id = ?")
    .run(collectionId, userId);
  return result.changes > 0;
}

export function addToCollection(collectionId: number, favoriteId: number): boolean {
  try {
    getDb()
      .prepare("INSERT INTO collection_verses (collection_id, favorite_id) VALUES (?, ?)")
      .run(collectionId, favoriteId);
    return true;
  } catch {
    return false; // Already in collection
  }
}

export function removeFromCollection(collectionId: number, favoriteId: number): boolean {
  const result = getDb()
    .prepare("DELETE FROM collection_verses WHERE collection_id = ? AND favorite_id = ?")
    .run(collectionId, favoriteId);
  return result.changes > 0;
}

export function getFavoriteCollections(userId: string, favoriteId: number): number[] {
  const rows = getDb()
    .prepare(
      `SELECT cv.collection_id FROM collection_verses cv
       JOIN collections c ON cv.collection_id = c.id
       WHERE c.user_id = ? AND cv.favorite_id = ?`
    )
    .all(userId, favoriteId) as { collection_id: number }[];
  return rows.map((r) => r.collection_id);
}

export function getFavoriteIdsByCollection(collectionId: number): Set<number> {
  const rows = getDb()
    .prepare("SELECT favorite_id FROM collection_verses WHERE collection_id = ?")
    .all(collectionId) as { favorite_id: number }[];
  return new Set(rows.map((r) => r.favorite_id));
}
