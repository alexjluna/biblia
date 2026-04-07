import { getDb } from "../db";
import type { Notification } from "../types";

export function createNotification(
  userId: string,
  type: "reply" | "like" | "new_message",
  discussionId: number,
  messageId: number | null,
  fromUserId: string
): void {
  // Don't notify yourself
  if (userId === fromUserId) return;

  // Don't duplicate: same type+discussion+from_user unread
  const existing = getDb()
    .prepare(
      "SELECT 1 FROM notifications WHERE user_id = ? AND type = ? AND discussion_id = ? AND from_user_id = ? AND is_read = 0"
    )
    .get(userId, type, discussionId, fromUserId);
  if (existing) return;

  getDb()
    .prepare(
      `INSERT INTO notifications (user_id, type, discussion_id, message_id, from_user_id)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(userId, type, discussionId, messageId, fromUserId);
}

export function notifyDiscussionParticipants(
  discussionId: number,
  excludeUserId: string,
  type: "reply" | "like" | "new_message",
  messageId: number | null,
  fromUserId: string
): void {
  const rows = getDb()
    .prepare(
      "SELECT DISTINCT user_id FROM discussion_messages WHERE discussion_id = ? AND user_id != ? AND is_deleted = 0"
    )
    .all(discussionId, excludeUserId) as { user_id: string }[];

  for (const row of rows) {
    createNotification(row.user_id, type, discussionId, messageId, fromUserId);
  }
}

export function getNotifications(userId: string, limit: number = 50): Notification[] {
  return getDb()
    .prepare(
      `SELECT n.id, n.type, n.discussion_id as discussionId,
              n.message_id as messageId,
              fu.name as fromUserName, fu.image as fromUserImage,
              v.book_number as bookNumber, b.name as bookName, v.chapter, v.verse,
              n.is_read as isRead, n.created_at as createdAt
       FROM notifications n
       JOIN users fu ON n.from_user_id = fu.id
       JOIN discussions d ON n.discussion_id = d.id
       JOIN verses v ON d.verse_id = v.id
       JOIN books b ON v.book_number = b.number
       WHERE n.user_id = ?
       ORDER BY n.is_read ASC, n.created_at DESC
       LIMIT ?`
    )
    .all(userId, limit) as Notification[];
}

export function getUnreadCount(userId: string): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0")
    .get(userId) as { count: number };
  return row.count;
}

export function markAllRead(userId: string): void {
  getDb()
    .prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0")
    .run(userId);
}

/**
 * Clean up old data to prevent infinite growth.
 * - Notifications older than 90 days (read ones)
 * - discussion_reads older than 90 days
 * Call periodically (e.g. on app startup or via cron).
 */
export function cleanupOldData(): void {
  const db = getDb();
  db.prepare("DELETE FROM notifications WHERE is_read = 1 AND created_at < datetime('now', '-60 days')").run();
  db.prepare("DELETE FROM discussion_reads WHERE last_read_at < datetime('now', '-60 days')").run();
}
