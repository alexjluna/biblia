import Link from "next/link";
import type { Book } from "@/lib/types";

interface BookGridShelfProps {
  books: Book[];
  testament: "AT" | "NT";
  progressMap?: Map<number, number>;
}

const CATEGORY_ORDER_AT = ["Pentateuco", "Históricos", "Poéticos", "Profetas"];
const CATEGORY_ORDER_NT = [
  "Evangelios",
  "Hechos",
  "Cartas Paulinas",
  "Cartas Generales",
  "Profecía",
];

const CATEGORY_COLORS: Record<string, { from: string; to: string }> = {
  Pentateuco: { from: "#8B6F4E", to: "#6B5234" },
  Históricos: { from: "#7C6952", to: "#5A4A38" },
  Poéticos: { from: "#9B7B5E", to: "#7C5C3E" },
  Profetas: { from: "#6B5E52", to: "#4A3F35" },
  Evangelios: { from: "#8C7458", to: "#6D573E" },
  Hechos: { from: "#7A6B5A", to: "#5C4E3F" },
  "Cartas Paulinas": { from: "#857260", to: "#655444" },
  "Cartas Generales": { from: "#796856", to: "#5E4F3E" },
  Profecía: { from: "#7C5C3E", to: "#5A3E24" },
};

export function BookGridShelf({ books, testament, progressMap }: BookGridShelfProps) {
  const categoryOrder =
    testament === "AT" ? CATEGORY_ORDER_AT : CATEGORY_ORDER_NT;

  const grouped = new Map<string, Book[]>();
  for (const book of books) {
    const list = grouped.get(book.category) || [];
    list.push(book);
    grouped.set(book.category, list);
  }

  return (
    <div className="space-y-6">
      {categoryOrder.map((category) => {
        const categoryBooks = grouped.get(category);
        if (!categoryBooks) return null;
        const colors = CATEGORY_COLORS[category] || { from: "#7C5C3E", to: "#5A3E24" };

        return (
          <div key={category}>
            {/* Shelf label */}
            <span className="inline-block bg-[#E8DFD4] text-[#6B5234] text-[10px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-sm mb-3 ml-1">
              {category}
            </span>

            {/* Shelf with spines */}
            <div className="relative">
              <div className="flex gap-1.5 overflow-x-auto pb-4 px-1 scrollbar-hide">
                {categoryBooks.map((book) => {
                  const readCount = progressMap?.get(book.number) ?? 0;
                  const pct = book.chapters_count > 0 ? (readCount / book.chapters_count) * 100 : 0;
                  const completed = readCount === book.chapters_count && readCount > 0;

                  return (
                    <Link
                      key={book.number}
                      href={`/libro/${book.number}`}
                      className="group relative flex-shrink-0 w-11 h-28 rounded-sm flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.97] overflow-hidden"
                      style={{
                        background: `linear-gradient(to bottom, ${colors.from}, ${colors.to})`,
                      }}
                      title={`${book.name} — ${readCount}/${book.chapters_count} capítulos`}
                    >
                      {/* Gold foil lines */}
                      <div className="absolute top-1.5 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#D4A574]/60 to-transparent" />
                      <div className="absolute bottom-1.5 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#D4A574]/60 to-transparent" />

                      {/* Progress fill from bottom */}
                      {readCount > 0 && (
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-white/15 transition-all duration-500"
                          style={{ height: `${pct}%` }}
                        />
                      )}

                      {/* Completed glow */}
                      {completed && (
                        <div className="absolute inset-0 shadow-[inset_0_0_12px_rgba(212,165,116,0.4)]" />
                      )}

                      {/* Abbreviation - vertical text */}
                      <span
                        className="text-white text-xs font-bold tracking-wider select-none"
                        style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
                      >
                        {book.abbrev}
                      </span>

                      {/* Completed star */}
                      {completed && (
                        <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[10px]">
                          ✦
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Shelf edge */}
              <div className="h-1.5 bg-gradient-to-b from-[#C4B5A3] to-[#A89880] rounded-b-sm shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
