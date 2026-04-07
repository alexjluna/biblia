import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

const DB_PATH = join(__dirname, "..", "biblia.db");
const useModernized = process.argv.includes("--modernized");
const useRV1960 = process.argv.includes("--rv1960");
const JSON_PATH = join(
  __dirname, "..", "data",
  useRV1960 ? "rv_1960.json" :
  useModernized ? "rv_1909_modernizada.json" : "rv_1960.json"
);

interface RawVerse {
  book_name: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleJSON {
  metadata: { name: string };
  verses: RawVerse[];
}

const BOOK_META: Record<
  number,
  { abbrev: string; testament: "AT" | "NT"; category: string }
> = {
  1: { abbrev: "Gn", testament: "AT", category: "Pentateuco" },
  2: { abbrev: "Ex", testament: "AT", category: "Pentateuco" },
  3: { abbrev: "Lv", testament: "AT", category: "Pentateuco" },
  4: { abbrev: "Nm", testament: "AT", category: "Pentateuco" },
  5: { abbrev: "Dt", testament: "AT", category: "Pentateuco" },
  6: { abbrev: "Jos", testament: "AT", category: "Históricos" },
  7: { abbrev: "Jue", testament: "AT", category: "Históricos" },
  8: { abbrev: "Rt", testament: "AT", category: "Históricos" },
  9: { abbrev: "1Sa", testament: "AT", category: "Históricos" },
  10: { abbrev: "2Sa", testament: "AT", category: "Históricos" },
  11: { abbrev: "1Re", testament: "AT", category: "Históricos" },
  12: { abbrev: "2Re", testament: "AT", category: "Históricos" },
  13: { abbrev: "1Cr", testament: "AT", category: "Históricos" },
  14: { abbrev: "2Cr", testament: "AT", category: "Históricos" },
  15: { abbrev: "Esd", testament: "AT", category: "Históricos" },
  16: { abbrev: "Neh", testament: "AT", category: "Históricos" },
  17: { abbrev: "Est", testament: "AT", category: "Históricos" },
  18: { abbrev: "Job", testament: "AT", category: "Poéticos" },
  19: { abbrev: "Sal", testament: "AT", category: "Poéticos" },
  20: { abbrev: "Pr", testament: "AT", category: "Poéticos" },
  21: { abbrev: "Ec", testament: "AT", category: "Poéticos" },
  22: { abbrev: "Cnt", testament: "AT", category: "Poéticos" },
  23: { abbrev: "Is", testament: "AT", category: "Profetas" },
  24: { abbrev: "Jr", testament: "AT", category: "Profetas" },
  25: { abbrev: "Lm", testament: "AT", category: "Profetas" },
  26: { abbrev: "Ez", testament: "AT", category: "Profetas" },
  27: { abbrev: "Dn", testament: "AT", category: "Profetas" },
  28: { abbrev: "Os", testament: "AT", category: "Profetas" },
  29: { abbrev: "Jl", testament: "AT", category: "Profetas" },
  30: { abbrev: "Am", testament: "AT", category: "Profetas" },
  31: { abbrev: "Abd", testament: "AT", category: "Profetas" },
  32: { abbrev: "Jon", testament: "AT", category: "Profetas" },
  33: { abbrev: "Mi", testament: "AT", category: "Profetas" },
  34: { abbrev: "Nah", testament: "AT", category: "Profetas" },
  35: { abbrev: "Hab", testament: "AT", category: "Profetas" },
  36: { abbrev: "Sof", testament: "AT", category: "Profetas" },
  37: { abbrev: "Hag", testament: "AT", category: "Profetas" },
  38: { abbrev: "Zac", testament: "AT", category: "Profetas" },
  39: { abbrev: "Mal", testament: "AT", category: "Profetas" },
  40: { abbrev: "Mt", testament: "NT", category: "Evangelios" },
  41: { abbrev: "Mr", testament: "NT", category: "Evangelios" },
  42: { abbrev: "Lc", testament: "NT", category: "Evangelios" },
  43: { abbrev: "Jn", testament: "NT", category: "Evangelios" },
  44: { abbrev: "Hch", testament: "NT", category: "Hechos" },
  45: { abbrev: "Ro", testament: "NT", category: "Cartas Paulinas" },
  46: { abbrev: "1Co", testament: "NT", category: "Cartas Paulinas" },
  47: { abbrev: "2Co", testament: "NT", category: "Cartas Paulinas" },
  48: { abbrev: "Ga", testament: "NT", category: "Cartas Paulinas" },
  49: { abbrev: "Ef", testament: "NT", category: "Cartas Paulinas" },
  50: { abbrev: "Fil", testament: "NT", category: "Cartas Paulinas" },
  51: { abbrev: "Col", testament: "NT", category: "Cartas Paulinas" },
  52: { abbrev: "1Ts", testament: "NT", category: "Cartas Paulinas" },
  53: { abbrev: "2Ts", testament: "NT", category: "Cartas Paulinas" },
  54: { abbrev: "1Ti", testament: "NT", category: "Cartas Paulinas" },
  55: { abbrev: "2Ti", testament: "NT", category: "Cartas Paulinas" },
  56: { abbrev: "Tit", testament: "NT", category: "Cartas Paulinas" },
  57: { abbrev: "Flm", testament: "NT", category: "Cartas Paulinas" },
  58: { abbrev: "He", testament: "NT", category: "Cartas Paulinas" },
  59: { abbrev: "Stg", testament: "NT", category: "Cartas Generales" },
  60: { abbrev: "1P", testament: "NT", category: "Cartas Generales" },
  61: { abbrev: "2P", testament: "NT", category: "Cartas Generales" },
  62: { abbrev: "1Jn", testament: "NT", category: "Cartas Generales" },
  63: { abbrev: "2Jn", testament: "NT", category: "Cartas Generales" },
  64: { abbrev: "3Jn", testament: "NT", category: "Cartas Generales" },
  65: { abbrev: "Jud", testament: "NT", category: "Cartas Generales" },
  66: { abbrev: "Ap", testament: "NT", category: "Profecía" },
};

console.log("Reading Bible JSON...");
const raw: BibleJSON = JSON.parse(readFileSync(JSON_PATH, "utf-8"));
console.log(`Found ${raw.verses.length} verses`);

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

console.log("Creating tables...");
db.exec(`
  DROP TABLE IF EXISTS favorites;
  DROP TABLE IF EXISTS verses_fts;
  DROP TABLE IF EXISTS verses;
  DROP TABLE IF EXISTS books;

  CREATE TABLE books (
    number INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    abbrev TEXT NOT NULL,
    testament TEXT NOT NULL CHECK(testament IN ('AT','NT')),
    category TEXT NOT NULL,
    chapters_count INTEGER NOT NULL
  );

  CREATE TABLE verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_number INTEGER NOT NULL REFERENCES books(number),
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL
  );
  CREATE INDEX idx_verses_book_chapter ON verses(book_number, chapter);

  CREATE TABLE favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verse_id INTEGER NOT NULL UNIQUE REFERENCES verses(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Compute chapters per book
const chaptersPerBook = new Map<number, number>();
for (const v of raw.verses) {
  const current = chaptersPerBook.get(v.book) || 0;
  if (v.chapter > current) chaptersPerBook.set(v.book, v.chapter);
}

// Insert books
console.log("Inserting books...");
const insertBook = db.prepare(
  "INSERT INTO books (number, name, abbrev, testament, category, chapters_count) VALUES (?, ?, ?, ?, ?, ?)"
);

const bookNames = new Map<number, string>();
for (const v of raw.verses) {
  if (!bookNames.has(v.book)) bookNames.set(v.book, v.book_name);
}

const insertBooks = db.transaction(() => {
  for (const [num, name] of bookNames) {
    const meta = BOOK_META[num];
    insertBook.run(
      num,
      name,
      meta.abbrev,
      meta.testament,
      meta.category,
      chaptersPerBook.get(num) || 0
    );
  }
});
insertBooks();

// Insert verses
console.log("Inserting verses...");
const insertVerse = db.prepare(
  "INSERT INTO verses (book_number, chapter, verse, text) VALUES (?, ?, ?, ?)"
);

const insertVerses = db.transaction(() => {
  for (const v of raw.verses) {
    insertVerse.run(v.book, v.chapter, v.verse, v.text);
  }
});
insertVerses();

// Create FTS5 index
console.log("Creating full-text search index...");
db.exec(`
  CREATE VIRTUAL TABLE verses_fts USING fts5(text, content=verses, content_rowid=id);
  INSERT INTO verses_fts(rowid, text) SELECT id, text FROM verses;
`);

console.log("Done! Database created at", DB_PATH);

// Verify
const count = db.prepare("SELECT COUNT(*) as c FROM verses").get() as {
  c: number;
};
const bookCount = db.prepare("SELECT COUNT(*) as c FROM books").get() as {
  c: number;
};
console.log(`Verified: ${bookCount.c} books, ${count.c} verses`);

db.close();
