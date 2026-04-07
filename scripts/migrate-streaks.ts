import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(__dirname, "..", "biblia.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

console.log("Running streaks migration...");

const hasTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='reading_streaks'")
  .get();

if (hasTable) {
  console.log("Migration already applied. Skipping.");
  db.close();
  process.exit(0);
}

db.exec(`
  CREATE TABLE reading_streaks (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    chapters_count INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, date)
  );
  CREATE INDEX idx_streaks_user_date ON reading_streaks(user_id, date DESC);
`);

console.log("Streaks migration complete!");
db.close();
