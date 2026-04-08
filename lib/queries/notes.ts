import { getDb } from "../db";

export interface VerseNote {
  id: number;
  verseId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteWithVerse extends VerseNote {
  bookNumber: number;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string;
}

export function getNoteForVerse(userId: string, verseId: number): VerseNote | null {
  const row = getDb()
    .prepare(
      "SELECT id, verse_id as verseId, content, created_at as createdAt, updated_at as updatedAt FROM verse_notes WHERE user_id = ? AND verse_id = ?"
    )
    .get(userId, verseId) as VerseNote | undefined;
  return row ?? null;
}

export function getNotedVerseIds(userId: string, versionId: string, bookNumber: number, chapter: number): Set<number> {
  const rows = getDb()
    .prepare(
      `SELECT vn.verse_id FROM verse_notes vn
       JOIN verses v ON vn.verse_id = v.id
       WHERE vn.user_id = ? AND v.version_id = ? AND v.book_number = ? AND v.chapter = ?`
    )
    .all(userId, versionId, bookNumber, chapter) as { verse_id: number }[];
  return new Set(rows.map((r) => r.verse_id));
}

export function saveNote(userId: string, verseId: number, content: string): { id: number } {
  const result = getDb()
    .prepare(
      `INSERT INTO verse_notes (user_id, verse_id, content)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, verse_id) DO UPDATE SET
         content = excluded.content,
         updated_at = datetime('now')`
    )
    .run(userId, verseId, content);
  return { id: Number(result.lastInsertRowid) };
}

export function deleteNote(userId: string, verseId: number): boolean {
  const result = getDb()
    .prepare("DELETE FROM verse_notes WHERE user_id = ? AND verse_id = ?")
    .run(userId, verseId);
  return result.changes > 0;
}

export function getUserNotes(userId: string, versionId: string, limit: number = 50): NoteWithVerse[] {
  return getDb()
    .prepare(
      `SELECT vn.id, vn.verse_id as verseId, vn.content,
              vn.created_at as createdAt, vn.updated_at as updatedAt,
              v.book_number as bookNumber, b.name as bookName,
              v.chapter, v.verse, v.text as verseText
       FROM verse_notes vn
       JOIN verses v ON vn.verse_id = v.id
       JOIN books b ON v.book_number = b.number AND v.version_id = b.version_id
       WHERE vn.user_id = ? AND v.version_id = ?
       ORDER BY vn.updated_at DESC
       LIMIT ?`
    )
    .all(userId, versionId, limit) as NoteWithVerse[];
}
