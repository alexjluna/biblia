import { getDb } from "../db";

export interface PrayerRequest {
  id: number;
  authorName: string | null;
  isAnonymous: boolean;
  content: string;
  verseText: string | null;
  verseRef: string | null;
  prayerCount: number;
  isPraying: boolean;
  isOwn: boolean;
  createdAt: string;
}

export function getPrayerRequests(requestingUserId: string | null, limit: number = 30): PrayerRequest[] {
  const db = getDb();

  // Clean expired requests
  db.prepare("DELETE FROM prayer_requests WHERE expires_at < datetime('now')").run();

  const rows = db
    .prepare(
      `SELECT pr.id, pr.user_id, u.name as author_name, pr.is_anonymous, pr.content,
              pr.prayer_count, pr.created_at,
              v.text as verse_text, b.name as book_name, v.chapter, v.verse
       FROM prayer_requests pr
       JOIN users u ON pr.user_id = u.id
       LEFT JOIN verses v ON pr.verse_id = v.id
       LEFT JOIN books b ON v.book_number = b.number
       WHERE pr.expires_at > datetime('now')
       ORDER BY pr.created_at DESC
       LIMIT ?`
    )
    .all(limit) as Array<Record<string, unknown>>;

  let prayingIds = new Set<number>();
  if (requestingUserId) {
    const praying = db
      .prepare("SELECT request_id FROM prayer_support WHERE user_id = ?")
      .all(requestingUserId) as { request_id: number }[];
    prayingIds = new Set(praying.map((r) => r.request_id));
  }

  return rows.map((r) => ({
    id: r.id as number,
    authorName: (r.is_anonymous as number) ? null : (r.author_name as string),
    isAnonymous: !!(r.is_anonymous as number),
    content: r.content as string,
    verseText: r.verse_text ? `"${(r.verse_text as string).slice(0, 100)}..." — ${r.book_name} ${r.chapter}:${r.verse}` : null,
    verseRef: r.book_name ? `${r.book_name} ${r.chapter}:${r.verse}` : null,
    prayerCount: r.prayer_count as number,
    isPraying: prayingIds.has(r.id as number),
    isOwn: (r.user_id as string) === requestingUserId,
    createdAt: r.created_at as string,
  }));
}

export function createPrayerRequest(
  userId: string,
  content: string,
  verseId: number | null,
  isAnonymous: boolean
): { id: number } | null {
  const db = getDb();

  // Check limit: max 3 active requests per user
  const count = (db
    .prepare("SELECT COUNT(*) as c FROM prayer_requests WHERE user_id = ? AND expires_at > datetime('now')")
    .get(userId) as { c: number }).c;

  if (count >= 3) return null;

  const result = db
    .prepare(
      "INSERT INTO prayer_requests (user_id, content, verse_id, is_anonymous) VALUES (?, ?, ?, ?)"
    )
    .run(userId, content, verseId, isAnonymous ? 1 : 0);

  return { id: Number(result.lastInsertRowid) };
}

export function togglePraying(userId: string, requestId: number): { praying: boolean; prayerCount: number } {
  const db = getDb();
  const run = db.transaction(() => {
    const existing = db.prepare("SELECT 1 FROM prayer_support WHERE user_id = ? AND request_id = ?").get(userId, requestId);
    if (existing) {
      db.prepare("DELETE FROM prayer_support WHERE user_id = ? AND request_id = ?").run(userId, requestId);
      db.prepare("UPDATE prayer_requests SET prayer_count = MAX(prayer_count - 1, 0) WHERE id = ?").run(requestId);
    } else {
      db.prepare("INSERT INTO prayer_support (user_id, request_id) VALUES (?, ?)").run(userId, requestId);
      db.prepare("UPDATE prayer_requests SET prayer_count = prayer_count + 1 WHERE id = ?").run(requestId);
    }
    const row = db.prepare("SELECT prayer_count FROM prayer_requests WHERE id = ?").get(requestId) as { prayer_count: number };
    return { praying: !existing, prayerCount: row.prayer_count };
  });
  return run();
}

export function deletePrayerRequest(userId: string, requestId: number): boolean {
  const result = getDb()
    .prepare("DELETE FROM prayer_requests WHERE id = ? AND user_id = ?")
    .run(requestId, userId);
  return result.changes > 0;
}
