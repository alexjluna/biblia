import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(__dirname, "..", "biblia.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

console.log("Running notes migration...");

const hasTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='verse_notes'")
  .get();

if (hasTable) {
  console.log("Migration already applied. Skipping.");
  db.close();
  process.exit(0);
}

db.exec(`
  CREATE TABLE verse_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verse_id INTEGER NOT NULL REFERENCES verses(id),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, verse_id)
  );
  CREATE INDEX idx_notes_user ON verse_notes(user_id);
  CREATE INDEX idx_notes_verse ON verse_notes(verse_id);
`);

console.log("Notes migration complete!");
db.close();
