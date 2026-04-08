/**
 * Safe migration: Add multi-version support using ALTER TABLE.
 * NEVER drops tables with user data. Each step is idempotent.
 *
 * Usage: npx tsx scripts/migrate-versions.ts
 */

import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(__dirname, "..", "biblia.db");
const db = new Database(DB_PATH, { readonly: false });
db.pragma("journal_mode = WAL");

function hasColumn(table: string, column: string): boolean {
  return (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[])
    .some((c) => c.name === column);
}

function tableExists(table: string): boolean {
  return !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
}

console.log("Starting safe multi-version migration...");

// 1. Create bible_versions table
console.log("  Creating bible_versions table...");
if (!tableExists("bible_versions")) {
  db.exec(`
    CREATE TABLE bible_versions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      tradition TEXT NOT NULL,
      books_count INTEGER NOT NULL,
      description TEXT
    );
  `);
}
db.exec(`
  INSERT OR IGNORE INTO bible_versions (id, name, short_name, tradition, books_count, description)
    VALUES ('rv1960', 'Reina Valera 1960', 'RV 1960', 'protestante', 66, 'Biblia Reina-Valera Revisión de 1960');
  INSERT OR IGNORE INTO bible_versions (id, name, short_name, tradition, books_count, description)
    VALUES ('bdj', 'Biblia de Jerusalen', 'BdJ', 'católica', 73, 'Biblia de Jerusalén, 4ª edición 2009');
`);

// 2. Add columns to books (NO DROP)
console.log("  Migrating books...");
if (!hasColumn("books", "version_id")) {
  db.exec(`ALTER TABLE books ADD COLUMN version_id TEXT NOT NULL DEFAULT 'rv1960'`);
}
if (!hasColumn("books", "sort_order")) {
  db.exec(`ALTER TABLE books ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`);
  db.exec(`UPDATE books SET sort_order = number WHERE sort_order = 0`);
}

// 3. Add version_id to verses (NO DROP)
console.log("  Migrating verses...");
if (!hasColumn("verses", "version_id")) {
  db.exec(`ALTER TABLE verses ADD COLUMN version_id TEXT NOT NULL DEFAULT 'rv1960'`);
}

// 4. Add version_id to reading_progress (NO DROP)
console.log("  Migrating reading_progress...");
if (!hasColumn("reading_progress", "version_id")) {
  db.exec(`ALTER TABLE reading_progress ADD COLUMN version_id TEXT NOT NULL DEFAULT 'rv1960'`);
}

// 5. Add version_id to reading_position (NO DROP)
console.log("  Migrating reading_position...");
if (!hasColumn("reading_position", "version_id")) {
  db.exec(`ALTER TABLE reading_position ADD COLUMN version_id TEXT NOT NULL DEFAULT 'rv1960'`);
}

// 6. Add preferred_version to users (NO DROP)
console.log("  Migrating users...");
if (!hasColumn("users", "preferred_version")) {
  db.exec(`ALTER TABLE users ADD COLUMN preferred_version TEXT NOT NULL DEFAULT 'rv1960'`);
}

// 7. Create indexes
console.log("  Creating indexes...");
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_verses_version_book_chapter ON verses(version_id, book_number, chapter);
  CREATE INDEX IF NOT EXISTS idx_reading_progress_user_version ON reading_progress(user_id, version_id, book_number);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_books_version_number ON books(version_id, number);
`);

// 8. Rebuild FTS (only table recreated — no user data)
console.log("  Rebuilding FTS index...");
db.exec(`
  DROP TABLE IF EXISTS verses_fts;
  CREATE VIRTUAL TABLE verses_fts USING fts5(text, content=verses, content_rowid=id);
  INSERT INTO verses_fts(rowid, text) SELECT id, text FROM verses;
`);

// Verify
const versionCount = db.prepare("SELECT COUNT(*) as c FROM bible_versions").get() as { c: number };
const bookCount = db.prepare("SELECT COUNT(*) as c FROM books").get() as { c: number };
const verseCount = db.prepare("SELECT COUNT(*) as c FROM verses").get() as { c: number };
const ftsCount = db.prepare("SELECT COUNT(*) as c FROM verses_fts").get() as { c: number };

// Verify user data preserved
const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
const favCount = db.prepare("SELECT COUNT(*) as c FROM favorites").get() as { c: number };
const progressCount = db.prepare("SELECT COUNT(*) as c FROM reading_progress").get() as { c: number };
const prayerCount = db.prepare("SELECT COUNT(*) as c FROM prayer_requests").get() as { c: number };
const discussionCount = db.prepare("SELECT COUNT(*) as c FROM discussions").get() as { c: number };

console.log(`\nMigration complete!`);
console.log(`  Versions: ${versionCount.c}`);
console.log(`  Books: ${bookCount.c}`);
console.log(`  Verses: ${verseCount.c}`);
console.log(`  FTS entries: ${ftsCount.c}`);
console.log(`\n  User data preserved:`);
console.log(`    Users: ${userCount.c}`);
console.log(`    Favorites: ${favCount.c}`);
console.log(`    Reading progress: ${progressCount.c}`);
console.log(`    Prayer requests: ${prayerCount.c}`);
console.log(`    Discussions: ${discussionCount.c}`);

db.close();
