import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(__dirname, "..", "biblia.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

console.log("Running ranking migration...");

const hasColumn = db
  .prepare("SELECT * FROM pragma_table_info('users') WHERE name = 'show_in_ranking'")
  .get();

if (hasColumn) {
  console.log("Migration already applied (show_in_ranking column exists). Skipping.");
  db.close();
  process.exit(0);
}

db.prepare("ALTER TABLE users ADD COLUMN show_in_ranking INTEGER NOT NULL DEFAULT 1").run();

console.log("Ranking migration complete! Added show_in_ranking column to users.");
db.close();
