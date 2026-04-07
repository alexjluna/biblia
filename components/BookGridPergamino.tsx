import Link from "next/link";
import type { Book } from "@/lib/types";

interface BookGridPergaminoProps {
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

function ProgressRing({ pct, size = 36 }: { pct: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className="absolute inset-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-separator)"
        strokeWidth="2.5"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-500"
      />
    </svg>
  );
}

export function BookGridPergamino({ books, testament, progressMap }: BookGridPergaminoProps) {
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
        return (
          <div key={category}>
            {/* Decorative divider with category name */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-accent/70">
                {category}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {categoryBooks.map((book) => {
                const readCount = progressMap?.get(book.number) ?? 0;
                const pct = readCount > 0 ? (readCount / book.chapters_count) * 100 : 0;
                const completed = readCount === book.chapters_count && readCount > 0;

                return (
                  <Link
                    key={book.number}
                    href={`/libro/${book.number}`}
                    className={`relative flex flex-col items-center justify-center px-2 py-4 rounded-xl border transition-all duration-200 hover:shadow-[0_2px_8px_rgba(124,92,62,0.15)] hover:border-accent/40 active:scale-[0.97] ${
                      completed
                        ? "bg-gradient-to-b from-accent/8 to-accent/15 border-accent/30"
                        : "bg-gradient-to-b from-white to-[#F5F0E8] border-[#E0D5C8] shadow-[0_1px_3px_rgba(124,92,62,0.08)]"
                    }`}
                  >
                    {/* Completed badge */}
                    {completed && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}

                    {/* Abbreviation with progress ring */}
                    <div className="relative w-9 h-9 flex items-center justify-center">
                      {readCount > 0 && !completed && (
                        <ProgressRing pct={pct} size={36} />
                      )}
                      <span className="text-xl font-bold text-accent font-[family-name:var(--font-source-serif)] relative z-10">
                        {book.abbrev}
                      </span>
                    </div>

                    {/* Book name */}
                    <span className="text-[11px] leading-tight text-text-secondary font-medium text-center mt-1.5 line-clamp-2">
                      {book.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
