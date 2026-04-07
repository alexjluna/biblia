import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(process.cwd(), "biblia.db");

let db: Database.Database | null = null;
let cleanupDone = false;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: false });
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 5000");

    // Run cleanup once per process start (notifications >90 days, old reads)
    if (!cleanupDone) {
      cleanupDone = true;
      try {
        db.prepare("DELETE FROM notifications WHERE is_read = 1 AND created_at < datetime('now', '-60 days')").run();
        db.prepare("DELETE FROM discussion_reads WHERE last_read_at < datetime('now', '-60 days')").run();
      } catch {
        // Tables may not exist yet (before migration)
      }
    }
  }
  return db;
}
