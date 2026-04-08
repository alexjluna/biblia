import { getDb } from "../db";
import type { RankingEntry } from "../types";

interface RawRow {
  user_id: string;
  name: string | null;
  image: string | null;
  chapters_read: number;
  rank: number;
}

export function getTotalChapters(versionId: string): number {
  const row = getDb()
    .prepare("SELECT SUM(chapters_count) as total FROM books WHERE version_id = ?")
    .get(versionId) as { total: number };
  return row.total;
}

function mapRow(row: RawRow, totalChapters: number): RankingEntry {
  return {
    rank: row.rank,
    userId: row.user_id,
    name: row.name || "Lector",
    image: row.image,
    chaptersRead: row.chapters_read,
    percentage: Math.round((row.chapters_read / totalChapters) * 1000) / 10,
  };
}

export function getTopReaders(versionId: string, limit: number = 10): RankingEntry[] {
  const totalChapters = getTotalChapters(versionId);
  const rows = getDb()
    .prepare(
      `SELECT
         u.id AS user_id, u.name, u.image,
         COUNT(rp.id) AS chapters_read,
         DENSE_RANK() OVER (ORDER BY COUNT(rp.id) DESC) AS rank
       FROM users u
       JOIN reading_progress rp ON u.id = rp.user_id
       WHERE u.show_in_ranking = 1 AND rp.version_id = ?
       GROUP BY u.id
       HAVING COUNT(rp.id) > 0
       ORDER BY chapters_read DESC, u.name ASC
       LIMIT ?`
    )
    .all(versionId, limit) as RawRow[];

  return rows.map((r) => mapRow(r, totalChapters));
}

export function getUserRank(userId: string, versionId: string): RankingEntry | null {
  const db = getDb();
  const totalChapters = getTotalChapters(versionId);

  const user = db
    .prepare("SELECT show_in_ranking FROM users WHERE id = ?")
    .get(userId) as { show_in_ranking: number } | undefined;

  if (!user || !user.show_in_ranking) return null;

  const row = db
    .prepare(
      `WITH ranked AS (
         SELECT
           u.id AS user_id, u.name, u.image,
           COUNT(rp.id) AS chapters_read,
           DENSE_RANK() OVER (ORDER BY COUNT(rp.id) DESC) AS rank
         FROM users u
         JOIN reading_progress rp ON u.id = rp.user_id
         WHERE u.show_in_ranking = 1 AND rp.version_id = ?
         GROUP BY u.id
       )
       SELECT * FROM ranked WHERE user_id = ?`
    )
    .get(versionId, userId) as RawRow | undefined;

  if (!row) return null;
  return mapRow(row, totalChapters);
}

export function getTotalParticipants(versionId: string): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(DISTINCT rp.user_id) AS cnt
       FROM reading_progress rp
       JOIN users u ON rp.user_id = u.id
       WHERE u.show_in_ranking = 1 AND rp.version_id = ?`
    )
    .get(versionId) as { cnt: number };
  return row.cnt;
}

export function setShowInRanking(userId: string, show: boolean): boolean {
  const result = getDb()
    .prepare("UPDATE users SET show_in_ranking = ? WHERE id = ?")
    .run(show ? 1 : 0, userId);
  return result.changes > 0;
}
