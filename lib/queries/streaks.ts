import { getDb } from "../db";

/**
 * Record that a user read today (called when marking a chapter as read).
 */
export function recordReadingDay(userId: string): void {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  getDb()
    .prepare(
      `INSERT INTO reading_streaks (user_id, date, chapters_count) VALUES (?, ?, 1)
       ON CONFLICT(user_id, date) DO UPDATE SET chapters_count = chapters_count + 1`
    )
    .run(userId, today);
}

/**
 * Get current streak (consecutive days including today, with 1-day grace).
 */
export function getCurrentStreak(userId: string): number {
  const rows = getDb()
    .prepare(
      "SELECT date FROM reading_streaks WHERE user_id = ? ORDER BY date DESC LIMIT 400"
    )
    .all(userId) as { date: string }[];

  if (rows.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastReadDate = new Date(rows[0].date + "T00:00:00");
  const diffDays = Math.floor((today.getTime() - lastReadDate.getTime()) / (1000 * 60 * 60 * 24));

  // If last read was more than 1 day ago (grace period), streak is 0
  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 1; i < rows.length; i++) {
    const current = new Date(rows[i - 1].date + "T00:00:00");
    const prev = new Date(rows[i].date + "T00:00:00");
    const gap = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (gap <= 2) {
      // 1 day = consecutive, 2 days = grace period
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get longest streak ever.
 */
export function getLongestStreak(userId: string): number {
  const rows = getDb()
    .prepare(
      "SELECT date FROM reading_streaks WHERE user_id = ? ORDER BY date ASC"
    )
    .all(userId) as { date: string }[];

  if (rows.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < rows.length; i++) {
    const prev = new Date(rows[i - 1].date + "T00:00:00");
    const curr = new Date(rows[i].date + "T00:00:00");
    const gap = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (gap <= 2) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

/**
 * Get reading days for the last N days (for heatmap/calendar).
 */
export function getReadingDays(userId: string, days: number = 30): Map<string, number> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  const rows = getDb()
    .prepare(
      "SELECT date, chapters_count FROM reading_streaks WHERE user_id = ? AND date >= ? ORDER BY date ASC"
    )
    .all(userId, sinceStr) as { date: string; chapters_count: number }[];

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.date, row.chapters_count);
  }
  return map;
}

/**
 * Get this week's reading days (Mon-Sun).
 */
export function getWeekDays(userId: string): boolean[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().split("T")[0]);
  }

  const readDays = getReadingDays(userId, 7);
  return weekDates.map((d) => readDays.has(d));
}
