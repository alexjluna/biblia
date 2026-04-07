import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(__dirname, "..", "biblia.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

console.log("Running collections migration...");

const hasTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='collections'")
  .get();

if (hasTable) {
  console.log("Migration already applied. Skipping.");
  db.close();
  process.exit(0);
}

db.exec(`
  CREATE TABLE collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, name)
  );
  CREATE INDEX idx_collections_user ON collections(user_id);

  CREATE TABLE collection_verses (
    collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    favorite_id INTEGER NOT NULL REFERENCES favorites(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (collection_id, favorite_id)
  );
`);

console.log("Collections migration complete!");
db.close();
