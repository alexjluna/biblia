import { getDb } from "../db";
import type { DiscussionSummary, DiscussionMessage } from "../types";

// --- Discussion CRUD ---

export function getDiscussionSummariesForChapter(
  versionId: string,
  bookNumber: number,
  chapter: number
): Map<number, DiscussionSummary> {
  const rows = getDb()
    .prepare(
      `SELECT d.verse_id as verseId, d.id as discussionId, d.message_count as messageCount
       FROM discussions d
       JOIN verses v ON d.verse_id = v.id
       WHERE v.version_id = ? AND v.book_number = ? AND v.chapter = ? AND d.message_count > 0`
    )
    .all(versionId, bookNumber, chapter) as DiscussionSummary[];

  const map = new Map<number, DiscussionSummary>();
  for (const row of rows) {
    map.set(row.verseId, row);
  }
  return map;
}

export function getDiscussionByVerseId(verseId: number): { id: number; messageCount: number } | null {
  const row = getDb()
    .prepare("SELECT id, message_count as messageCount FROM discussions WHERE verse_id = ?")
    .get(verseId) as { id: number; messageCount: number } | undefined;
  return row ?? null;
}

export function createDiscussionWithMessage(
  userId: string,
  verseId: number,
  content: string
): { discussionId: number; messageId: number } {
  const db = getDb();

  const insertDiscussion = db.prepare(
    "INSERT INTO discussions (verse_id, created_by, message_count, last_message_at) VALUES (?, ?, 1, datetime('now'))"
  );
  const insertMessage = db.prepare(
    "INSERT INTO discussion_messages (discussion_id, user_id, content) VALUES (?, ?, ?)"
  );

  const run = db.transaction(() => {
    const dResult = insertDiscussion.run(verseId, userId);
    const discussionId = Number(dResult.lastInsertRowid);
    const mResult = insertMessage.run(discussionId, userId, content);
    return { discussionId, messageId: Number(mResult.lastInsertRowid) };
  });

  return run();
}

// --- Messages ---

export function getMessages(
  discussionId: number,
  requestingUserId: string | null,
  limit: number = 30,
  cursor?: string
): { messages: DiscussionMessage[]; hasMore: boolean; nextCursor: string | null } {
  const db = getDb();
  const params: unknown[] = [discussionId];
  let cursorClause = "";

  if (cursor) {
    const [cursorDate, cursorId] = cursor.split("|");
    cursorClause = "AND (m.created_at > ? OR (m.created_at = ? AND m.id > ?))";
    params.push(cursorDate, cursorDate, parseInt(cursorId, 10));
  }

  params.push(limit + 1);

  const rows = db
    .prepare(
      `SELECT m.id, m.discussion_id as discussionId, m.user_id as authorId,
              u.name as authorName, u.image as authorImage,
              CASE WHEN m.is_deleted = 1 THEN '[Mensaje eliminado]' ELSE m.content END as content,
              m.parent_id as parentId, m.like_count as likeCount,
              m.created_at as createdAt, m.edited_at as editedAt, m.is_deleted as isDeleted,
              pm.content as parentContent, pu.name as parentAuthorName
       FROM discussion_messages m
       JOIN users u ON m.user_id = u.id
       LEFT JOIN discussion_messages pm ON m.parent_id = pm.id
       LEFT JOIN users pu ON pm.user_id = pu.id
       WHERE m.discussion_id = ? ${cursorClause}
       ORDER BY m.created_at ASC, m.id ASC
       LIMIT ?`
    )
    .all(...params) as Array<Record<string, unknown>>;

  const hasMore = rows.length > limit;
  const sliced = rows.slice(0, limit);

  // Get liked message IDs for requesting user
  let likedIds = new Set<number>();
  if (requestingUserId && sliced.length > 0) {
    const msgIds = sliced.map((r) => r.id as number);
    const placeholders = msgIds.map(() => "?").join(",");
    const likedRows = db
      .prepare(
        `SELECT message_id FROM discussion_likes WHERE user_id = ? AND message_id IN (${placeholders})`
      )
      .all(requestingUserId, ...msgIds) as { message_id: number }[];
    likedIds = new Set(likedRows.map((r) => r.message_id));
  }

  const messages: DiscussionMessage[] = sliced.map((r) => ({
    id: r.id as number,
    discussionId: r.discussionId as number,
    authorId: r.authorId as string,
    authorName: r.authorName as string | null,
    authorImage: r.authorImage as string | null,
    content: r.content as string,
    parentId: r.parentId as number | null,
    parentPreview: r.parentContent
      ? (r.parentContent as string).slice(0, 80)
      : null,
    parentAuthorName: r.parentAuthorName as string | null,
    likeCount: r.likeCount as number,
    isLiked: likedIds.has(r.id as number),
    isOwn: (r.authorId as string) === requestingUserId,
    createdAt: r.createdAt as string,
    editedAt: r.editedAt as string | null,
  }));

  const last = messages[messages.length - 1];
  const nextCursor = hasMore && last ? `${last.createdAt}|${last.id}` : null;

  return { messages, hasMore, nextCursor };
}

export function addMessage(
  userId: string,
  discussionId: number,
  content: string,
  parentId?: number
): { id: number } {
  const db = getDb();
  const insert = db.prepare(
    "INSERT INTO discussion_messages (discussion_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)"
  );
  const update = db.prepare(
    "UPDATE discussions SET message_count = message_count + 1, last_message_at = datetime('now') WHERE id = ?"
  );

  const run = db.transaction(() => {
    const result = insert.run(discussionId, userId, content, parentId ?? null);
    update.run(discussionId);
    return { id: Number(result.lastInsertRowid) };
  });

  return run();
}

export function editMessage(userId: string, messageId: number, content: string): boolean {
  const result = getDb()
    .prepare(
      "UPDATE discussion_messages SET content = ?, edited_at = datetime('now') WHERE id = ? AND user_id = ? AND is_deleted = 0"
    )
    .run(content, messageId, userId);
  return result.changes > 0;
}

export function deleteMessage(userId: string, messageId: number): boolean {
  const db = getDb();
  const run = db.transaction(() => {
    const result = db
      .prepare("UPDATE discussion_messages SET is_deleted = 1 WHERE id = ? AND user_id = ?")
      .run(messageId, userId);
    if (result.changes > 0) {
      const row = db.prepare("SELECT discussion_id FROM discussion_messages WHERE id = ?").get(messageId) as { discussion_id: number } | undefined;
      if (row) db.prepare("UPDATE discussions SET message_count = MAX(message_count - 1, 0) WHERE id = ?").run(row.discussion_id);
    }
    return result.changes > 0;
  });
  return run();
}

export function adminDeleteMessage(messageId: number): boolean {
  const db = getDb();
  const run = db.transaction(() => {
    const row = db.prepare("SELECT discussion_id FROM discussion_messages WHERE id = ?").get(messageId) as { discussion_id: number } | undefined;
    const result = db.prepare("UPDATE discussion_messages SET is_deleted = 1 WHERE id = ?").run(messageId);
    if (result.changes > 0 && row) {
      db.prepare("UPDATE discussions SET message_count = MAX(message_count - 1, 0) WHERE id = ?").run(row.discussion_id);
    }
    return result.changes > 0;
  });
  return run();
}

// --- Likes ---

export function toggleLike(userId: string, messageId: number): { liked: boolean; likeCount: number } {
  const db = getDb();
  const run = db.transaction(() => {
    const existing = db.prepare("SELECT 1 FROM discussion_likes WHERE user_id = ? AND message_id = ?").get(userId, messageId);
    if (existing) {
      db.prepare("DELETE FROM discussion_likes WHERE user_id = ? AND message_id = ?").run(userId, messageId);
      db.prepare("UPDATE discussion_messages SET like_count = MAX(like_count - 1, 0) WHERE id = ?").run(messageId);
    } else {
      db.prepare("INSERT INTO discussion_likes (user_id, message_id) VALUES (?, ?)").run(userId, messageId);
      db.prepare("UPDATE discussion_messages SET like_count = like_count + 1 WHERE id = ?").run(messageId);
    }
    const row = db.prepare("SELECT like_count FROM discussion_messages WHERE id = ?").get(messageId) as { like_count: number };
    return { liked: !existing, likeCount: row.like_count };
  });
  return run();
}

// --- Reads ---

export function markDiscussionRead(userId: string, discussionId: number): void {
  getDb()
    .prepare(
      `INSERT INTO discussion_reads (user_id, discussion_id, last_read_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(user_id, discussion_id) DO UPDATE SET last_read_at = datetime('now')`
    )
    .run(userId, discussionId);
}

// --- Reports ---

export function reportMessage(reporterId: string, messageId: number, reason: string): { id: number } | null {
  // Need discussion_reports table - use a simple approach with notifications for now
  // For MVP, reports go through the existing admin moderation
  try {
    const db = getDb();
    // Check table exists, if not, create inline
    db.exec(`CREATE TABLE IF NOT EXISTS discussion_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER NOT NULL REFERENCES discussion_messages(id) ON DELETE CASCADE,
      reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(message_id, reporter_id)
    )`);
    const result = db
      .prepare("INSERT INTO discussion_reports (message_id, reporter_id, reason) VALUES (?, ?, ?)")
      .run(messageId, reporterId, reason);
    return { id: Number(result.lastInsertRowid) };
  } catch {
    return null;
  }
}

// --- Helpers ---

export function getDiscussionParticipants(discussionId: number, excludeUserId: string): string[] {
  const rows = getDb()
    .prepare(
      "SELECT DISTINCT user_id FROM discussion_messages WHERE discussion_id = ? AND user_id != ? AND is_deleted = 0"
    )
    .all(discussionId, excludeUserId) as { user_id: string }[];
  return rows.map((r) => r.user_id);
}

export function getMessageAuthor(messageId: number): string | null {
  const row = getDb()
    .prepare("SELECT user_id FROM discussion_messages WHERE id = ?")
    .get(messageId) as { user_id: string } | undefined;
  return row?.user_id ?? null;
}
