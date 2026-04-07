import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(__dirname, "..", "biblia.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log("Running discussions migration...");

const hasTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='discussions'")
  .get();

if (hasTable) {
  console.log("Migration already applied (discussions table exists). Skipping.");
  db.close();
  process.exit(0);
}

db.exec(`
  CREATE TABLE discussions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verse_id INTEGER NOT NULL UNIQUE REFERENCES verses(id),
    created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_count INTEGER NOT NULL DEFAULT 0,
    last_message_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_discussions_verse ON discussions(verse_id);

  CREATE TABLE discussion_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES discussion_messages(id) ON DELETE SET NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    edited_at TEXT
  );
  CREATE INDEX idx_messages_discussion ON discussion_messages(discussion_id, created_at);
  CREATE INDEX idx_messages_parent ON discussion_messages(parent_id);

  CREATE TABLE discussion_likes (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id INTEGER NOT NULL REFERENCES discussion_messages(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, message_id)
  );

  CREATE TABLE discussion_reads (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    last_read_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, discussion_id)
  );

  CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('reply', 'like', 'new_message')),
    discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES discussion_messages(id) ON DELETE CASCADE,
    from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
`);

console.log("Discussions migration complete!");
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'discussion%' OR name = 'notifications' ORDER BY name")
  .all() as { name: string }[];
console.log("Created tables:", tables.map((t) => t.name).join(", "));
db.close();
