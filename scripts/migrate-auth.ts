import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(__dirname, "..", "biblia.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log("Running auth + reading progress migration...");

// Check if users table already exists
const hasUsers = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
  .get();

if (hasUsers) {
  console.log("Migration already applied (users table exists). Skipping.");
  db.close();
  process.exit(0);
}

db.exec(`
  -- Auth tables
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    email_verified TEXT,
    image TEXT,
    password_hash TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    UNIQUE(provider, provider_account_id)
  );
  CREATE INDEX idx_accounts_user ON accounts(user_id);

  -- Recreate favorites with user_id
  CREATE TABLE favorites_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verse_id INTEGER NOT NULL REFERENCES verses(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, verse_id)
  );
  CREATE INDEX idx_favorites_user ON favorites_new(user_id);
`);

// Migrate existing favorites if any: assign to a default user
const favCount = (
  db.prepare("SELECT COUNT(*) as c FROM favorites").get() as { c: number }
).c;

if (favCount > 0) {
  console.log(`Migrating ${favCount} existing favorites...`);
  // Create a default migration user
  const defaultUserId = "migration-default-user";
  db.prepare(
    "INSERT INTO users (id, name, email) VALUES (?, ?, ?)"
  ).run(defaultUserId, "Usuario", "default@biblia.local");

  db.exec(`
    INSERT INTO favorites_new (user_id, verse_id, created_at)
    SELECT '${defaultUserId}', verse_id, created_at FROM favorites;
  `);
  console.log("Favorites migrated to default user.");
}

db.exec(`
  DROP TABLE favorites;
  ALTER TABLE favorites_new RENAME TO favorites;
`);

// Reading progress tables
db.exec(`
  CREATE TABLE reading_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_number INTEGER NOT NULL REFERENCES books(number),
    chapter INTEGER NOT NULL,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, book_number, chapter)
  );
  CREATE INDEX idx_reading_progress_user_book ON reading_progress(user_id, book_number);

  CREATE TABLE reading_position (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    book_number INTEGER NOT NULL REFERENCES books(number),
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

console.log("Migration complete!");

// Verify
const tables = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  )
  .all() as { name: string }[];
console.log("Tables:", tables.map((t) => t.name).join(", "));

db.close();
