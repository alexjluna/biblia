import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// --- Types (matching seed-db.ts) ---
interface RawVerse {
  book_name: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleJSON {
  metadata: Record<string, unknown>;
  verses: RawVerse[];
}

// --- Spanish word boundary utility ---
// JS \b treats accented chars as non-word, so we use custom boundaries
const SP = "[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]";
const NOT_BEFORE = `(?<!${SP})`;
const NOT_AFTER = `(?!${SP})`;

function spanishWord(word: string, flags = "g"): RegExp {
  return new RegExp(`${NOT_BEFORE}${word}${NOT_AFTER}`, flags);
}

// --- Replacement rules ---
interface Rule {
  name: string;
  pattern: RegExp;
  replacement: string;
}

const rules: Rule[] = [
  // Phase 1: Orthographic accents
  { name: "á → a", pattern: spanishWord("á"), replacement: "a" },
  { name: "fué → fue", pattern: spanishWord("fué"), replacement: "fue" },
  { name: "dió → dio", pattern: spanishWord("dió"), replacement: "dio" },
  { name: "vió → vio", pattern: spanishWord("vió"), replacement: "vio" },

  // Phase 2: Archaic vocabulary
  { name: "é → y", pattern: spanishWord("é"), replacement: "y" },
  { name: "EMPERO → PERO", pattern: spanishWord("EMPERO"), replacement: "PERO" },
  { name: "Empero → Pero", pattern: spanishWord("Empero"), replacement: "Pero" },
  { name: "empero → pero", pattern: spanishWord("empero"), replacement: "pero" },
  { name: "Aquesta → Esta", pattern: spanishWord("Aquesta"), replacement: "Esta" },
  { name: "aquesta → esta", pattern: spanishWord("aquesta"), replacement: "esta" },
  { name: "Aqueste → Este", pattern: spanishWord("Aqueste"), replacement: "Este" },
  { name: "aqueste → este", pattern: spanishWord("aqueste"), replacement: "este" },
  { name: "plugo → agradó", pattern: spanishWord("plugo"), replacement: "agradó" },
  // Plural before singular to avoid partial match
  { name: "estotros → estos otros", pattern: spanishWord("estotros"), replacement: "estos otros" },
  { name: "estotro → este otro", pattern: spanishWord("estotro"), replacement: "este otro" },
  // obscur* → oscur* (prefix replacement, preserve rest of word)
  {
    name: "obscur* → oscur*",
    pattern: new RegExp(`${NOT_BEFORE}(o)(bscur)`, "gi"),
    replacement: "$1scur",
  },
];

// --- crió skip list: verses where crió means "raised/bred", NOT "created" ---
const CRIO_SKIP = new Set([
  "2:16:20",   // Éxodo 16:20 — crió gusanos
  "9:1:23",    // 1 Samuel 1:23 — crió su hijo
  "26:19:2",   // Ezequiel 19:2 — crió sus cachorros
  "44:7:21",   // Hechos 7:21 — le crió como hijo
  "54:5:10",   // 1 Timoteo 5:10 — crió hijos
  "23:51:18",  // Isaías 51:18 — ambiguo (contexto maternal)
]);

const crioPattern = spanishWord("crió");

// --- Stats tracking ---
interface RuleStats {
  name: string;
  count: number;
  examples: { ref: string; before: string; after: string }[];
}

// --- Main ---
const dryRun = process.argv.includes("--dry-run");

const INPUT = join(__dirname, "..", "data", "rv_1909.json");
const OUTPUT = join(__dirname, "..", "data", "rv_1909_modernizada.json");

console.log("Reading Bible JSON...");
const raw: BibleJSON = JSON.parse(readFileSync(INPUT, "utf-8"));
console.log(`Found ${raw.verses.length} verses\n`);

const stats: RuleStats[] = rules.map((r) => ({ name: r.name, count: 0, examples: [] }));
const crioStats: RuleStats = { name: "crió → creó", count: 0, examples: [] };
let versesModified = 0;
let totalChanges = 0;

for (const verse of raw.verses) {
  const original = verse.text;
  let text = verse.text;
  const ref = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

  // Apply standard rules
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const before = text;
    rule.pattern.lastIndex = 0;
    const matches = [...before.matchAll(new RegExp(rule.pattern))];
    if (matches.length === 0) continue;

    text = before.replace(rule.pattern, rule.replacement);
    stats[i].count += matches.length;

    if (stats[i].examples.length < 3) {
      stats[i].examples.push({
        ref,
        before: before.length > 120 ? before.slice(0, 120) + "..." : before,
        after: text.length > 120 ? text.slice(0, 120) + "..." : text,
      });
    }
  }

  // Apply crió → creó (conditional)
  const verseKey = `${verse.book}:${verse.chapter}:${verse.verse}`;
  if (!CRIO_SKIP.has(verseKey)) {
    crioPattern.lastIndex = 0;
    const matches = [...text.matchAll(new RegExp(crioPattern))];
    if (matches.length > 0) {
      const before = text;
      text = text.replace(crioPattern, "creó");
      crioStats.count += matches.length;
      if (crioStats.examples.length < 3) {
        crioStats.examples.push({
          ref,
          before: before.length > 120 ? before.slice(0, 120) + "..." : before,
          after: text.length > 120 ? text.slice(0, 120) + "..." : text,
        });
      }
    }
  }

  verse.text = text;
  if (text !== original) versesModified++;
}

// Count total changes
for (const s of stats) totalChanges += s.count;
totalChanges += crioStats.count;

// --- Print report ---
console.log("=== REPORTE DE MODERNIZACIÓN ===\n");
console.log(`${"Regla".padEnd(30)} ${"Cambios".padStart(8)}`);
console.log("-".repeat(40));

for (const s of stats) {
  if (s.count > 0) {
    console.log(`${s.name.padEnd(30)} ${String(s.count).padStart(8)}`);
  }
}
if (crioStats.count > 0) {
  console.log(`${crioStats.name.padEnd(30)} ${String(crioStats.count).padStart(8)}`);
}

console.log("-".repeat(40));
console.log(`${"TOTAL".padEnd(30)} ${String(totalChanges).padStart(8)}`);
console.log(`\nVersículos modificados: ${versesModified} de ${raw.verses.length}`);

// Print examples
console.log("\n=== EJEMPLOS ===\n");
const allStats = [...stats, crioStats];
for (const s of allStats) {
  if (s.examples.length > 0) {
    console.log(`--- ${s.name} ---`);
    for (const ex of s.examples) {
      console.log(`  ${ex.ref}`);
      console.log(`    Antes:   ${ex.before}`);
      console.log(`    Después: ${ex.after}`);
    }
    console.log();
  }
}

// --- Write output ---
if (dryRun) {
  console.log("[DRY RUN] No se escribió archivo de salida.");
} else {
  // Update metadata
  raw.metadata.name = "Reina Valera 1909 (Modernizada)";
  raw.metadata.shortname = "RV 1909M";
  raw.metadata.module = "rv_1909_modernizada";

  writeFileSync(OUTPUT, JSON.stringify(raw));
  console.log(`\nArchivo escrito: ${OUTPUT}`);
}
