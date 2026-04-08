/**
 * Migration script: Add multi-version support to the database.
 *
 * This script migrates the existing single-version database to support
 * multiple Bible versions. It preserves all existing user data.
 *
 * Usage: npx tsx scripts/migrate-versions.ts
 */

import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(__dirname, "..", "biblia.db");
const db = new Database(DB_PATH, { readonly: false });
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = OFF"); // Temporarily disable for migration

console.log("Starting migration to multi-version schema...");

const migrate = db.transaction(() => {
  // 1. Create bible_versions table
  console.log("  Creating bible_versions table...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS bible_versions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      tradition TEXT NOT NULL,
      books_count INTEGER NOT NULL,
      description TEXT
    );
  `);

  db.prepare(`
    INSERT OR IGNORE INTO bible_versions (id, name, short_name, tradition, books_count, description)
    VALUES ('rv1960', 'Reina Valera 1960', 'RV 1960', 'protestante', 66, 'Biblia Reina-Valera Revisión de 1960')
  `).run();

  db.prepare(`
    INSERT OR IGNORE INTO bible_versions (id, name, short_name, tradition, books_count, description)
    VALUES ('bdj', 'Biblia de Jerusalen', 'BdJ', 'católica', 73, 'Biblia de Jerusalén, 4ª edición 2009')
  `).run();

  // 2. Migrate books table: add version_id and sort_order
  console.log("  Migrating books table...");
  const hasVersionCol = db.prepare("PRAGMA table_info(books)").all()
    .some((c: any) => c.name === "version_id");

  if (!hasVersionCol) {
    db.exec(`
      CREATE TABLE books_new (
        version_id TEXT NOT NULL REFERENCES bible_versions(id),
        number INTEGER NOT NULL,
        name TEXT NOT NULL,
        abbrev TEXT NOT NULL,
        testament TEXT NOT NULL CHECK(testament IN ('AT','NT')),
        category TEXT NOT NULL,
        chapters_count INTEGER NOT NULL,
        sort_order INTEGER NOT NULL,
        PRIMARY KEY (version_id, number)
      );

      INSERT INTO books_new (version_id, number, name, abbrev, testament, category, chapters_count, sort_order)
        SELECT 'rv1960', number, name, abbrev, testament, category, chapters_count, number
        FROM books;

      DROP TABLE books;
      ALTER TABLE books_new RENAME TO books;
    `);
  }

  // 3. Migrate verses table: add version_id
  console.log("  Migrating verses table...");
  const versesHasVersion = db.prepare("PRAGMA table_info(verses)").all()
    .some((c: any) => c.name === "version_id");

  if (!versesHasVersion) {
    db.exec(`
      CREATE TABLE verses_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version_id TEXT NOT NULL REFERENCES bible_versions(id),
        book_number INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (version_id, book_number) REFERENCES books(version_id, number)
      );

      INSERT INTO verses_new (id, version_id, book_number, chapter, verse, text)
        SELECT id, 'rv1960', book_number, chapter, verse, text
        FROM verses;

      DROP TABLE IF EXISTS verses_fts;
      DROP TABLE verses;
      ALTER TABLE verses_new RENAME TO verses;
      CREATE INDEX idx_verses_version_book_chapter ON verses(version_id, book_number, chapter);
    `);
  }

  // 4. Migrate reading_progress: add version_id
  console.log("  Migrating reading_progress table...");
  const rpHasVersion = db.prepare("PRAGMA table_info(reading_progress)").all()
    .some((c: any) => c.name === "version_id");

  if (!rpHasVersion) {
    db.exec(`
      CREATE TABLE reading_progress_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        version_id TEXT NOT NULL REFERENCES bible_versions(id),
        book_number INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        completed_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, version_id, book_number, chapter),
        FOREIGN KEY (version_id, book_number) REFERENCES books(version_id, number)
      );

      INSERT INTO reading_progress_new (id, user_id, version_id, book_number, chapter, completed_at)
        SELECT id, user_id, 'rv1960', book_number, chapter, completed_at
        FROM reading_progress;

      DROP TABLE reading_progress;
      ALTER TABLE reading_progress_new RENAME TO reading_progress;
      CREATE INDEX idx_reading_progress_user_version ON reading_progress(user_id, version_id, book_number);
    `);
  }

  // 5. Migrate reading_position: add version_id, change UNIQUE
  console.log("  Migrating reading_position table...");
  const posHasVersion = db.prepare("PRAGMA table_info(reading_position)").all()
    .some((c: any) => c.name === "version_id");

  if (!posHasVersion) {
    db.exec(`
      CREATE TABLE reading_position_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        version_id TEXT NOT NULL REFERENCES bible_versions(id),
        book_number INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, version_id),
        FOREIGN KEY (version_id, book_number) REFERENCES books(version_id, number)
      );

      INSERT INTO reading_position_new (id, user_id, version_id, book_number, chapter, verse, updated_at)
        SELECT id, user_id, 'rv1960', book_number, chapter, verse, updated_at
        FROM reading_position;

      DROP TABLE reading_position;
      ALTER TABLE reading_position_new RENAME TO reading_position;
    `);
  }

  // 6. Add preferred_version to users
  console.log("  Adding preferred_version to users...");
  const usersHasPref = db.prepare("PRAGMA table_info(users)").all()
    .some((c: any) => c.name === "preferred_version");

  if (!usersHasPref) {
    db.exec(`ALTER TABLE users ADD COLUMN preferred_version TEXT NOT NULL DEFAULT 'rv1960'`);
  }

  // 7. Rebuild FTS5 index
  console.log("  Rebuilding FTS5 index...");
  db.exec(`
    DROP TABLE IF EXISTS verses_fts;
    CREATE VIRTUAL TABLE verses_fts USING fts5(text, content=verses, content_rowid=id);
    INSERT INTO verses_fts(rowid, text) SELECT id, text FROM verses;
  `);
});

migrate();

db.pragma("foreign_keys = ON");

// Verify
const versionCount = db.prepare("SELECT COUNT(*) as c FROM bible_versions").get() as { c: number };
const bookCount = db.prepare("SELECT COUNT(*) as c FROM books").get() as { c: number };
const verseCount = db.prepare("SELECT COUNT(*) as c FROM verses").get() as { c: number };
const ftsCount = db.prepare("SELECT COUNT(*) as c FROM verses_fts").get() as { c: number };

console.log(`\nMigration complete!`);
console.log(`  Versions: ${versionCount.c}`);
console.log(`  Books: ${bookCount.c}`);
console.log(`  Verses: ${verseCount.c}`);
console.log(`  FTS entries: ${ftsCount.c}`);

db.close();
