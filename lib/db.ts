import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(process.cwd(), "biblia.db");

let db: Database.Database | null = null;
let migrationDone = false;

function runMigrations(database: Database.Database): void {
  if (migrationDone) return;
  migrationDone = true;

  const hasVersionsTable = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bible_versions'")
    .get();

  if (hasVersionsTable) return;

  console.log("[db] Running multi-version migration...");
  database.pragma("foreign_keys = OFF");

  const migrate = database.transaction(() => {
    database.exec(`
      CREATE TABLE IF NOT EXISTS bible_versions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        short_name TEXT NOT NULL,
        tradition TEXT NOT NULL,
        books_count INTEGER NOT NULL,
        description TEXT
      );
      INSERT OR IGNORE INTO bible_versions (id, name, short_name, tradition, books_count, description)
        VALUES ('rv1960', 'Reina Valera 1960', 'RV 1960', 'protestante', 66, 'Biblia Reina-Valera Revisión de 1960');
      INSERT OR IGNORE INTO bible_versions (id, name, short_name, tradition, books_count, description)
        VALUES ('bdj', 'Biblia de Jerusalen', 'BdJ', 'católica', 73, 'Biblia de Jerusalén, 4ª edición 2009');
    `);

    const booksHasVersion = (database.prepare("PRAGMA table_info(books)").all() as { name: string }[])
      .some((c) => c.name === "version_id");
    if (!booksHasVersion) {
      database.exec(`
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
          SELECT 'rv1960', number, name, abbrev, testament, category, chapters_count, number FROM books;
        DROP TABLE books;
        ALTER TABLE books_new RENAME TO books;
      `);
    }

    const versesHasVersion = (database.prepare("PRAGMA table_info(verses)").all() as { name: string }[])
      .some((c) => c.name === "version_id");
    if (!versesHasVersion) {
      database.exec(`
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
          SELECT id, 'rv1960', book_number, chapter, verse, text FROM verses;
        DROP TABLE IF EXISTS verses_fts;
        DROP TABLE verses;
        ALTER TABLE verses_new RENAME TO verses;
        CREATE INDEX idx_verses_version_book_chapter ON verses(version_id, book_number, chapter);
      `);
    }

    const rpHasVersion = (database.prepare("PRAGMA table_info(reading_progress)").all() as { name: string }[])
      .some((c) => c.name === "version_id");
    if (!rpHasVersion) {
      database.exec(`
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
          SELECT id, user_id, 'rv1960', book_number, chapter, completed_at FROM reading_progress;
        DROP TABLE reading_progress;
        ALTER TABLE reading_progress_new RENAME TO reading_progress;
        CREATE INDEX idx_reading_progress_user_version ON reading_progress(user_id, version_id, book_number);
      `);
    }

    const posHasVersion = (database.prepare("PRAGMA table_info(reading_position)").all() as { name: string }[])
      .some((c) => c.name === "version_id");
    if (!posHasVersion) {
      database.exec(`
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
          SELECT id, user_id, 'rv1960', book_number, chapter, verse, updated_at FROM reading_position;
        DROP TABLE reading_position;
        ALTER TABLE reading_position_new RENAME TO reading_position;
      `);
    }

    const usersHasPref = (database.prepare("PRAGMA table_info(users)").all() as { name: string }[])
      .some((c) => c.name === "preferred_version");
    if (!usersHasPref) {
      database.exec(`ALTER TABLE users ADD COLUMN preferred_version TEXT NOT NULL DEFAULT 'rv1960'`);
    }

    database.exec(`
      DROP TABLE IF EXISTS verses_fts;
      CREATE VIRTUAL TABLE verses_fts USING fts5(text, content=verses, content_rowid=id);
      INSERT INTO verses_fts(rowid, text) SELECT id, text FROM verses;
    `);
  });

  migrate();
  database.pragma("foreign_keys = ON");
  console.log("[db] Migration complete.");
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
