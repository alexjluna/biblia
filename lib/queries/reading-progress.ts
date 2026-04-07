import { getDb } from "../db";
import type { BookProgress, OverallProgress, ReadingPosition } from "../types";

export function markChapterRead(
  userId: string,
  bookNumber: number,
  chapter: number
): { id: number } | null {
  try {
    const result = getDb()
      .prepare(
        "INSERT INTO reading_progress (user_id, book_number, chapter) VALUES (?, ?, ?)"
      )
      .run(userId, bookNumber, chapter);
    return { id: Number(result.lastInsertRowid) };
  } catch {
    return null; // Already marked (UNIQUE constraint)
  }
}

export function unmarkChapterRead(
  userId: string,
  bookNumber: number,
  chapter: number
): boolean {
  const result = getDb()
    .prepare(
      "DELETE FROM reading_progress WHERE user_id = ? AND book_number = ? AND chapter = ?"
    )
    .run(userId, bookNumber, chapter);
  return result.changes > 0;
}

export function markBookRead(
  userId: string,
  bookNumber: number,
  totalChapters: number
): number {
  const db = getDb();
  const insert = db.prepare(
    "INSERT OR IGNORE INTO reading_progress (user_id, book_number, chapter) VALUES (?, ?, ?)"
  );
  const markAll = db.transaction(() => {
    let marked = 0;
    for (let ch = 1; ch <= totalChapters; ch++) {
      const r = insert.run(userId, bookNumber, ch);
      marked += r.changes;
    }
    return marked;
  });
  return markAll();
}

export function unmarkBookRead(userId: string, bookNumber: number): number {
  const result = getDb()
    .prepare("DELETE FROM reading_progress WHERE user_id = ? AND book_number = ?")
    .run(userId, bookNumber);
  return result.changes;
}

export function getReadChaptersForBook(
  userId: string,
  bookNumber: number
): Set<number> {
  const rows = getDb()
    .prepare(
      "SELECT chapter FROM reading_progress WHERE user_id = ? AND book_number = ?"
    )
    .all(userId, bookNumber) as { chapter: number }[];
  return new Set(rows.map((r) => r.chapter));
}

export function isChapterRead(
  userId: string,
  bookNumber: number,
  chapter: number
): boolean {
  const row = getDb()
    .prepare(
      "SELECT 1 FROM reading_progress WHERE user_id = ? AND book_number = ? AND chapter = ?"
    )
    .get(userId, bookNumber, chapter);
  return !!row;
}

export function getReadChapterCounts(
  userId: string
): Map<number, number> {
  const rows = getDb()
    .prepare(
      "SELECT book_number, COUNT(*) as cnt FROM reading_progress WHERE user_id = ? GROUP BY book_number"
    )
    .all(userId) as { book_number: number; cnt: number }[];
  return new Map(rows.map((r) => [r.book_number, r.cnt]));
}

export function getOverallProgress(userId: string): OverallProgress {
  const db = getDb();

  const totalRow = db
    .prepare("SELECT SUM(chapters_count) as total FROM books")
    .get() as { total: number };

  const readRow = db
    .prepare("SELECT COUNT(*) as read_count FROM reading_progress WHERE user_id = ?")
    .get(userId) as { read_count: number };

  const bookProgressRows = db
    .prepare(
      `SELECT b.number as bookNumber, b.name as bookName, b.chapters_count as chaptersCount,
              COUNT(rp.id) as chaptersRead
       FROM books b
       LEFT JOIN reading_progress rp ON b.number = rp.book_number AND rp.user_id = ?
       GROUP BY b.number
       ORDER BY b.number`
    )
    .all(userId) as (Omit<BookProgress, "completed">)[];

  return {
    totalChapters: totalRow.total,
    chaptersRead: readRow.read_count,
    percentage:
      totalRow.total > 0
        ? Math.round((readRow.read_count / totalRow.total) * 1000) / 10
        : 0,
    bookProgress: bookProgressRows.map((bp) => ({
      ...bp,
      completed: bp.chaptersRead === bp.chaptersCount,
    })),
  };
}

// Reading position (continue reading)

export function getReadingPosition(userId: string): ReadingPosition | null {
  const row = getDb()
    .prepare(
      `SELECT rp.book_number, b.name as book_name, rp.chapter, rp.verse, rp.updated_at
       FROM reading_position rp
       JOIN books b ON rp.book_number = b.number
       WHERE rp.user_id = ?`
    )
    .get(userId) as
    | { book_number: number; book_name: string; chapter: number; verse: number; updated_at: string }
    | undefined;

  if (!row) return null;

  return {
    bookNumber: row.book_number,
    bookName: row.book_name,
    chapter: row.chapter,
    verse: row.verse,
    updatedAt: row.updated_at,
  };
}

export function setReadingPosition(
  userId: string,
  bookNumber: number,
  chapter: number,
  verse: number = 1
): void {
  getDb()
    .prepare(
      `INSERT INTO reading_position (user_id, book_number, chapter, verse, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         book_number = excluded.book_number,
         chapter = excluded.chapter,
         verse = excluded.verse,
         updated_at = datetime('now')`
    )
    .run(userId, bookNumber, chapter, verse);
}

export function getLastReadBook(userId: string): {
  bookNumber: number;
  bookName: string;
  chapter: number;
  completedAt: string;
} | null {
  const row = getDb()
    .prepare(
      `SELECT rp.book_number, b.name as book_name, rp.chapter, rp.completed_at
       FROM reading_progress rp
       JOIN books b ON rp.book_number = b.number
       WHERE rp.user_id = ?
       ORDER BY rp.completed_at DESC
       LIMIT 1`
    )
    .get(userId) as
    | { book_number: number; book_name: string; chapter: number; completed_at: string }
    | undefined;

  if (!row) return null;

  return {
    bookNumber: row.book_number,
    bookName: row.book_name,
    chapter: row.chapter,
    completedAt: row.completed_at,
  };
}
