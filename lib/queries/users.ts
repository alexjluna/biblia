import { getDb } from "../db";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  email_verified: string | null;
  image: string | null;
  role: string;
  created_at: string;
  has_password: boolean;
  favorites_count: number;
  chapters_read: number;
}

export function getAllUsers(): AdminUser[] {
  return getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.email_verified, u.image, u.role, u.created_at,
              CASE WHEN u.password_hash IS NOT NULL THEN 1 ELSE 0 END as has_password,
              (SELECT COUNT(*) FROM favorites f WHERE f.user_id = u.id) as favorites_count,
              (SELECT COUNT(*) FROM reading_progress rp WHERE rp.user_id = u.id) as chapters_read
       FROM users u
       ORDER BY u.created_at DESC`
    )
    .all() as AdminUser[];
}

export function getUserById(id: string): AdminUser | null {
  const row = getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.email_verified, u.image, u.role, u.created_at,
              CASE WHEN u.password_hash IS NOT NULL THEN 1 ELSE 0 END as has_password,
              (SELECT COUNT(*) FROM favorites f WHERE f.user_id = u.id) as favorites_count,
              (SELECT COUNT(*) FROM reading_progress rp WHERE rp.user_id = u.id) as chapters_read
       FROM users u
       WHERE u.id = ?`
    )
    .get(id) as AdminUser | undefined;
  return row ?? null;
}

export function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: string }
): boolean {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.email !== undefined) {
    fields.push("email = ?");
    values.push(data.email);
  }
  if (data.role !== undefined) {
    fields.push("role = ?");
    values.push(data.role);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const result = getDb()
    .prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);
  return result.changes > 0;
}

export function deleteUser(id: string): boolean {
  const result = getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
  return result.changes > 0;
}

export function verifyUserEmail(id: string): boolean {
  const result = getDb()
    .prepare("UPDATE users SET email_verified = datetime('now') WHERE id = ?")
    .run(id);
  return result.changes > 0;
}

export function isAdmin(userId: string): boolean {
  const row = getDb()
    .prepare("SELECT role FROM users WHERE id = ?")
    .get(userId) as { role: string } | undefined;
  return row?.role === "admin";
}

export function getUserStats(userId: string): {
  chaptersRead: number;
  favorites: number;
  discussions: number;
  likesGiven: number;
} {
  const db = getDb();

  const chapters = (db.prepare("SELECT COUNT(*) as c FROM reading_progress WHERE user_id = ?").get(userId) as { c: number }).c;
  const favs = (db.prepare("SELECT COUNT(*) as c FROM favorites WHERE user_id = ?").get(userId) as { c: number }).c;
  const msgs = (db.prepare("SELECT COUNT(*) as c FROM discussion_messages WHERE user_id = ? AND is_deleted = 0").get(userId) as { c: number }).c;
  const likes = (db.prepare("SELECT COUNT(*) as c FROM discussion_likes WHERE user_id = ?").get(userId) as { c: number }).c;

  return { chaptersRead: chapters, favorites: favs, discussions: msgs, likesGiven: likes };
}

export interface ActivityItem {
  type: "read" | "favorite" | "discussion" | "bookmark";
  bookNumber: number;
  bookName: string;
  chapter: number;
  verse?: number;
  detail?: string;
  createdAt: string;
}

export function getUserActivity(userId: string, limit: number = 20): ActivityItem[] {
  const db = getDb();

  const rows = db.prepare(`
    SELECT 'read' as type, b.number as bookNumber, b.name as bookName, rp.chapter, NULL as verse, NULL as detail, rp.completed_at as createdAt
    FROM reading_progress rp
    JOIN books b ON rp.book_number = b.number
    WHERE rp.user_id = ? AND rp.completed_at > datetime('now', '-60 days')

    UNION ALL

    SELECT 'favorite' as type, b.number as bookNumber, b.name as bookName, v.chapter, v.verse, NULL as detail, f.created_at as createdAt
    FROM favorites f
    JOIN verses v ON f.verse_id = v.id
    JOIN books b ON v.book_number = b.number
    WHERE f.user_id = ? AND f.created_at > datetime('now', '-60 days')

    UNION ALL

    SELECT 'discussion' as type, b.number as bookNumber, b.name as bookName, v.chapter, v.verse, dm.content as detail, dm.created_at as createdAt
    FROM discussion_messages dm
    JOIN discussions d ON dm.discussion_id = d.id
    JOIN verses v ON d.verse_id = v.id
    JOIN books b ON v.book_number = b.number
    WHERE dm.user_id = ? AND dm.is_deleted = 0 AND dm.created_at > datetime('now', '-60 days')

    ORDER BY createdAt DESC
    LIMIT ?
  `).all(userId, userId, userId, limit) as ActivityItem[];

  return rows;
}
