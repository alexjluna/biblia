import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(process.cwd(), "biblia.db");

let db: Database.Database | null = null;
let migrationDone = false;

function hasColumn(database: Database.Database, table: string, column: string): boolean {
  return (database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[])
    .some((c) => c.name === column);
}

function tableExists(database: Database.Database, table: string): boolean {
  return !!database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
}

/**
 * Safe migration using ALTER TABLE ADD COLUMN.
 * NEVER drops tables with user data. Each step is idempotent.
 */
function runMigrations(database: Database.Database): void {
  if (migrationDone) return;
  migrationDone = true;

  // Check if migration is needed
  if (tableExists(database, "bible_versions") && hasColumn(database, "books", "version_id")) {
    return; // Already migrated
  }

  console.log("[db] Running safe multi-version migration (ALTER TABLE)...");

  // 1. Create bible_versions table (new table, no risk)
  if (!tableExists(database, "bible_versions")) {
    database.exec(`
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
  database.exec(`
    INSERT OR IGNORE INTO bible_versions (id, name, short_name, tradition, books_count, description)
      VALUES ('rv1960', 'Reina Valera 1960', 'RV 1960', 'protestante', 66, 'Biblia Reina-Valera Revisión de 1960');
    INSERT OR IGNORE INTO bible_versions (id, name, short_name, tradition, books_count, description)
      VALUES ('bdj', 'Biblia de Jerusalen', 'BdJ', 'católica', 73, 'Biblia de Jerusalén, 4ª edición 2009');
  `);

  // 2. Add version_id and sort_order to books (NO DROP)
  if (!hasColumn(database, "books", "version_id")) {
    database.exec(`ALTER TABLE books ADD COLUMN version_id TEXT NOT NULL DEFAULT 'rv1960'`);
  }
  if (!hasColumn(database, "books", "sort_order")) {
    database.exec(`ALTER TABLE books ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`);
    database.exec(`UPDATE books SET sort_order = number WHERE sort_order = 0`);
  }

  // 3. Add version_id to verses (NO DROP)
  if (!hasColumn(database, "verses", "version_id")) {
    database.exec(`ALTER TABLE verses ADD COLUMN version_id TEXT NOT NULL DEFAULT 'rv1960'`);
  }

  // 4. Add version_id to reading_progress (NO DROP)
  if (!hasColumn(database, "reading_progress", "version_id")) {
    database.exec(`ALTER TABLE reading_progress ADD COLUMN version_id TEXT NOT NULL DEFAULT 'rv1960'`);
  }

  // 5. Add version_id to reading_position (NO DROP)
  if (!hasColumn(database, "reading_position", "version_id")) {
    database.exec(`ALTER TABLE reading_position ADD COLUMN version_id TEXT NOT NULL DEFAULT 'rv1960'`);
  }

  // 6. Add preferred_version to users (NO DROP)
  if (!hasColumn(database, "users", "preferred_version")) {
    database.exec(`ALTER TABLE users ADD COLUMN preferred_version TEXT NOT NULL DEFAULT 'rv1960'`);
  }

  // 7. Create indexes (IF NOT EXISTS = safe)
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_verses_version_book_chapter ON verses(version_id, book_number, chapter);
    CREATE INDEX IF NOT EXISTS idx_reading_progress_user_version ON reading_progress(user_id, version_id, book_number);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_books_version_number ON books(version_id, number);
  `);

  // 8. Rebuild FTS (only table that gets recreated — no user data)
  database.exec(`
    DROP TABLE IF EXISTS verses_fts;
    CREATE VIRTUAL TABLE verses_fts USING fts5(text, content=verses, content_rowid=id);
    INSERT INTO verses_fts(rowid, text) SELECT id, text FROM verses;
  `);

  console.log("[db] Migration complete. All user data preserved.");
}

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: false });
    db.pragma("journal_mode = WAL");
    db.pragma("busy_timeout = 5000");

    runMigrations(db);

    db.pragma("foreign_keys = ON");

    try {
      db.prepare("DELETE FROM notifications WHERE is_read = 1 AND created_at < datetime('now', '-60 days')").run();
      db.prepare("DELETE FROM discussion_reads WHERE last_read_at < datetime('now', '-60 days')").run();
    } catch {
      // Tables may not exist yet
    }
  }
  return db;
}
