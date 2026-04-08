/**
 * Seed the Biblia de Jerusalén into the existing multi-version database.
 *
 * Prerequisites: Run migrate-versions.ts first to set up the schema.
 *
 * Usage: npx tsx scripts/seed-bdj.ts
 */

import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

const DB_PATH = join(__dirname, "..", "biblia.db");
const JSON_PATH = join(__dirname, "..", "data", "bdj.json");

const VERSION_ID = "bdj";

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

// Book metadata for BdJ (73 books)
// Protestant books use same numbers 1-66, deuterocanonical 67-73
// sort_order controls display order in the Catholic canon
const BOOK_META: Record<
  number,
  { abbrev: string; testament: "AT" | "NT"; category: string; sort_order: number }
> = {
  // Pentateuco (sort 1-5)
  1: { abbrev: "Gn", testament: "AT", category: "Pentateuco", sort_order: 1 },
  2: { abbrev: "Ex", testament: "AT", category: "Pentateuco", sort_order: 2 },
  3: { abbrev: "Lv", testament: "AT", category: "Pentateuco", sort_order: 3 },
  4: { abbrev: "Nm", testament: "AT", category: "Pentateuco", sort_order: 4 },
  5: { abbrev: "Dt", testament: "AT", category: "Pentateuco", sort_order: 5 },
  // Históricos (sort 6-22)
  6: { abbrev: "Jos", testament: "AT", category: "Históricos", sort_order: 6 },
  7: { abbrev: "Jc", testament: "AT", category: "Históricos", sort_order: 7 },
  8: { abbrev: "Rt", testament: "AT", category: "Históricos", sort_order: 8 },
  9: { abbrev: "1Sa", testament: "AT", category: "Históricos", sort_order: 9 },
  10: { abbrev: "2Sa", testament: "AT", category: "Históricos", sort_order: 10 },
  11: { abbrev: "1Re", testament: "AT", category: "Históricos", sort_order: 11 },
  12: { abbrev: "2Re", testament: "AT", category: "Históricos", sort_order: 12 },
  13: { abbrev: "1Cr", testament: "AT", category: "Históricos", sort_order: 13 },
  14: { abbrev: "2Cr", testament: "AT", category: "Históricos", sort_order: 14 },
  15: { abbrev: "Esd", testament: "AT", category: "Históricos", sort_order: 15 },
  16: { abbrev: "Neh", testament: "AT", category: "Históricos", sort_order: 16 },
  67: { abbrev: "Tb", testament: "AT", category: "Históricos", sort_order: 17 },  // Tobías
  68: { abbrev: "Jdt", testament: "AT", category: "Históricos", sort_order: 18 }, // Judit
  17: { abbrev: "Est", testament: "AT", category: "Históricos", sort_order: 19 },
  69: { abbrev: "1Mac", testament: "AT", category: "Históricos", sort_order: 20 }, // 1 Macabeos
  70: { abbrev: "2Mac", testament: "AT", category: "Históricos", sort_order: 21 }, // 2 Macabeos
  // Poéticos / Sapienciales (sort 22-28)
  19: { abbrev: "Sal", testament: "AT", category: "Poéticos", sort_order: 22 },
  22: { abbrev: "Cnt", testament: "AT", category: "Poéticos", sort_order: 23 },
  25: { abbrev: "Lm", testament: "AT", category: "Poéticos", sort_order: 24 },
  18: { abbrev: "Job", testament: "AT", category: "Poéticos", sort_order: 25 },
  20: { abbrev: "Pr", testament: "AT", category: "Poéticos", sort_order: 26 },
  21: { abbrev: "Ec", testament: "AT", category: "Poéticos", sort_order: 27 },
  71: { abbrev: "Sb", testament: "AT", category: "Poéticos", sort_order: 28 },  // Sabiduría
  72: { abbrev: "Si", testament: "AT", category: "Poéticos", sort_order: 29 },  // Eclesiástico
  // Profetas (sort 30-46)
  23: { abbrev: "Is", testament: "AT", category: "Profetas", sort_order: 30 },
  24: { abbrev: "Jr", testament: "AT", category: "Profetas", sort_order: 31 },
  73: { abbrev: "Ba", testament: "AT", category: "Profetas", sort_order: 32 },  // Baruc
  26: { abbrev: "Ez", testament: "AT", category: "Profetas", sort_order: 33 },
  27: { abbrev: "Dn", testament: "AT", category: "Profetas", sort_order: 34 },
  28: { abbrev: "Os", testament: "AT", category: "Profetas", sort_order: 35 },
  29: { abbrev: "Jl", testament: "AT", category: "Profetas", sort_order: 36 },
  30: { abbrev: "Am", testament: "AT", category: "Profetas", sort_order: 37 },
  31: { abbrev: "Abd", testament: "AT", category: "Profetas", sort_order: 38 },
  32: { abbrev: "Jon", testament: "AT", category: "Profetas", sort_order: 39 },
  33: { abbrev: "Mi", testament: "AT", category: "Profetas", sort_order: 40 },
  34: { abbrev: "Nah", testament: "AT", category: "Profetas", sort_order: 41 },
  35: { abbrev: "Hab", testament: "AT", category: "Profetas", sort_order: 42 },
  36: { abbrev: "Sof", testament: "AT", category: "Profetas", sort_order: 43 },
  37: { abbrev: "Hag", testament: "AT", category: "Profetas", sort_order: 44 },
  38: { abbrev: "Zac", testament: "AT", category: "Profetas", sort_order: 45 },
  39: { abbrev: "Mal", testament: "AT", category: "Profetas", sort_order: 46 },
  // Nuevo Testamento (sort 47-73)
  40: { abbrev: "Mt", testament: "NT", category: "Evangelios", sort_order: 47 },
  41: { abbrev: "Mc", testament: "NT", category: "Evangelios", sort_order: 48 },
  42: { abbrev: "Lc", testament: "NT", category: "Evangelios", sort_order: 49 },
  43: { abbrev: "Jn", testament: "NT", category: "Evangelios", sort_order: 50 },
  44: { abbrev: "Hch", testament: "NT", category: "Hechos", sort_order: 51 },
  45: { abbrev: "Ro", testament: "NT", category: "Cartas Paulinas", sort_order: 52 },
  46: { abbrev: "1Co", testament: "NT", category: "Cartas Paulinas", sort_order: 53 },
  47: { abbrev: "2Co", testament: "NT", category: "Cartas Paulinas", sort_order: 54 },
  48: { abbrev: "Ga", testament: "NT", category: "Cartas Paulinas", sort_order: 55 },
  49: { abbrev: "Ef", testament: "NT", category: "Cartas Paulinas", sort_order: 56 },
  50: { abbrev: "Fil", testament: "NT", category: "Cartas Paulinas", sort_order: 57 },
  51: { abbrev: "Col", testament: "NT", category: "Cartas Paulinas", sort_order: 58 },
  52: { abbrev: "1Ts", testament: "NT", category: "Cartas Paulinas", sort_order: 59 },
  53: { abbrev: "2Ts", testament: "NT", category: "Cartas Paulinas", sort_order: 60 },
  54: { abbrev: "1Ti", testament: "NT", category: "Cartas Paulinas", sort_order: 61 },
  55: { abbrev: "2Ti", testament: "NT", category: "Cartas Paulinas", sort_order: 62 },
  56: { abbrev: "Tit", testament: "NT", category: "Cartas Paulinas", sort_order: 63 },
  57: { abbrev: "Flm", testament: "NT", category: "Cartas Paulinas", sort_order: 64 },
  58: { abbrev: "He", testament: "NT", category: "Cartas Paulinas", sort_order: 65 },
  59: { abbrev: "Stg", testament: "NT", category: "Cartas Generales", sort_order: 66 },
  60: { abbrev: "1P", testament: "NT", category: "Cartas Generales", sort_order: 67 },
  61: { abbrev: "2P", testament: "NT", category: "Cartas Generales", sort_order: 68 },
  62: { abbrev: "1Jn", testament: "NT", category: "Cartas Generales", sort_order: 69 },
  63: { abbrev: "2Jn", testament: "NT", category: "Cartas Generales", sort_order: 70 },
  64: { abbrev: "3Jn", testament: "NT", category: "Cartas Generales", sort_order: 71 },
  65: { abbrev: "Jud", testament: "NT", category: "Cartas Generales", sort_order: 72 },
  66: { abbrev: "Ap", testament: "NT", category: "Profecía", sort_order: 73 },
};

console.log("Reading BdJ JSON...");
const raw: BibleJSON = JSON.parse(readFileSync(JSON_PATH, "utf-8"));
console.log(`Found ${raw.verses.length} verses`);

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Remove any existing BdJ data
console.log("Removing existing BdJ data...");
db.exec(`
  DELETE FROM verses WHERE version_id = '${VERSION_ID}';
  DELETE FROM books WHERE version_id = '${VERSION_ID}';
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
  "INSERT INTO books (version_id, number, name, abbrev, testament, category, chapters_count, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

const bookNames = new Map<number, string>();
for (const v of raw.verses) {
  if (!bookNames.has(v.book)) bookNames.set(v.book, v.book_name);
}

const insertBooks = db.transaction(() => {
  for (const [num, name] of bookNames) {
    const meta = BOOK_META[num];
    if (!meta) {
      console.warn(`  WARNING: No metadata for book ${num} (${name})`);
      continue;
    }
    insertBook.run(
      VERSION_ID,
      num,
      name,
      meta.abbrev,
      meta.testament,
      meta.category,
      chaptersPerBook.get(num) || 0,
      meta.sort_order
    );
  }
});
insertBooks();

// Insert verses
console.log("Inserting verses...");
const insertVerse = db.prepare(
  "INSERT INTO verses (version_id, book_number, chapter, verse, text) VALUES (?, ?, ?, ?, ?)"
);

const insertVerses = db.transaction(() => {
  for (const v of raw.verses) {
    insertVerse.run(VERSION_ID, v.book, v.chapter, v.verse, v.text);
  }
});
insertVerses();

// Rebuild FTS5 index (for all versions)
console.log("Rebuilding full-text search index...");
db.exec(`
  DROP TABLE IF EXISTS verses_fts;
  CREATE VIRTUAL TABLE verses_fts USING fts5(text, content=verses, content_rowid=id);
  INSERT INTO verses_fts(rowid, text) SELECT id, text FROM verses;
`);

console.log("Done! BdJ data added to", DB_PATH);

// Verify
const bookCount = db.prepare("SELECT COUNT(*) as c FROM books WHERE version_id = ?").get(VERSION_ID) as { c: number };
const verseCount = db.prepare("SELECT COUNT(*) as c FROM verses WHERE version_id = ?").get(VERSION_ID) as { c: number };
const totalVerses = db.prepare("SELECT COUNT(*) as c FROM verses").get() as { c: number };
const totalFts = db.prepare("SELECT COUNT(*) as c FROM verses_fts").get() as { c: number };

console.log(`BdJ: ${bookCount.c} books, ${verseCount.c} verses`);
console.log(`Total (all versions): ${totalVerses.c} verses, ${totalFts.c} FTS entries`);

db.close();
