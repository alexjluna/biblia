import Link from "next/link";
import type { Book } from "@/lib/types";

interface BookGridProps {
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

function WaypointDot({ readCount, totalChapters }: { readCount: number; totalChapters: number }) {
  const pct = totalChapters > 0 ? (readCount / totalChapters) * 100 : 0;
  const completed = readCount === totalChapters && readCount > 0;
  const inProgress = readCount > 0 && !completed;

  if (completed) {
    return (
      <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    );
  }

  if (inProgress) {
    const deg = Math.round(pct * 3.6);
    return (
      <div
        className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full p-[3px]"
        style={{
          background: `conic-gradient(var(--color-accent) ${deg}deg, var(--color-separator) ${deg}deg)`,
        }}
      >
        <div className="w-full h-full rounded-full bg-parchment" />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 border-separator bg-white" />
  );
}

export function BookGrid({ books, testament, progressMap }: BookGridProps) {
  const categoryOrder =
    testament === "AT" ? CATEGORY_ORDER_AT : CATEGORY_ORDER_NT;

  const grouped = new Map<string, Book[]>();
  for (const book of books) {
    const list = grouped.get(book.category) || [];
    list.push(book);
    grouped.set(book.category, list);
  }

  return (
    <div className="relative ml-3">
      {/* Vertical path line */}
      <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-separator" />

      <div className="space-y-1">
        {categoryOrder.map((category) => {
          const categoryBooks = grouped.get(category);
          if (!categoryBooks) return null;
          return (
            <div key={category}>
              {/* Category milestone */}
              <div className="relative flex items-center gap-3 py-3">
                <div className="relative z-10 flex-shrink-0 w-6 flex justify-center">
                  <div className="w-3 h-3 rotate-45 bg-accent/60" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent/70 bg-parchment pr-2">
                  {category}
                </span>
                <div className="flex-1 h-px bg-accent/15" />
              </div>

              {/* Books in this category */}
              {categoryBooks.map((book) => {
                const readCount = progressMap?.get(book.number) ?? 0;
                const pct = readCount > 0 ? Math.round((readCount / book.chapters_count) * 100) : 0;
                const completed = readCount === book.chapters_count && readCount > 0;

                return (
                  <Link
                    key={book.number}
                    href={`/libro/${book.number}`}
                    className="relative flex items-center gap-3 py-1.5 group"
                  >
                    <WaypointDot readCount={readCount} totalChapters={book.chapters_count} />

                    <div
                      className={`flex-1 flex items-center gap-3 bg-white rounded-xl border p-3 transition-all duration-200 ${
                        completed
                          ? "border-accent/30 shadow-sm"
                          : "border-separator group-hover:border-accent/40 group-hover:shadow-md"
                      }`}
                    >
                      {/* Abbreviation badge */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg font-bold font-[family-name:var(--font-source-serif)] ${
                          completed
                            ? "bg-accent text-white"
                            : readCount > 0
                              ? "bg-accent/10 text-accent"
                              : "bg-separator/30 text-text-secondary"
                        }`}
                      >
                        {book.abbrev}
                      </div>

                      {/* Book info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {book.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {readCount > 0
                            ? `${readCount} de ${book.chapters_count} capítulos`
                            : `${book.chapters_count} capítulos`}
                        </p>
                      </div>

                      {/* Progress percentage */}
                      {pct > 0 && (
                        <span className="text-xs font-semibold text-accent flex-shrink-0">
                          {pct}%
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
