import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(__dirname, "..", "biblia.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

console.log("Running prayers migration...");

const hasTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='prayer_requests'")
  .get();

if (hasTable) {
  console.log("Migration already applied. Skipping.");
  db.close();
  process.exit(0);
}

db.exec(`
  CREATE TABLE prayer_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    verse_id INTEGER REFERENCES verses(id),
    is_anonymous INTEGER NOT NULL DEFAULT 1,
    prayer_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL DEFAULT (datetime('now', '+30 days'))
  );
  CREATE INDEX idx_prayers_user ON prayer_requests(user_id);
  CREATE INDEX idx_prayers_expires ON prayer_requests(expires_at);

  CREATE TABLE prayer_support (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id INTEGER NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, request_id)
  );
`);

console.log("Prayers migration complete!");
db.close();
