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
    <div className="space-y-6">
      {categoryOrder.map((category) => {
        const categoryBooks = grouped.get(category);
        if (!categoryBooks) return null;
        return (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3 px-1">
              {category}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {categoryBooks.map((book) => {
                const readCount = progressMap?.get(book.number) ?? 0;
                const pct =
                  readCount > 0
                    ? (readCount / book.chapters_count) * 100
                    : 0;
                const completed = readCount === book.chapters_count;

                return (
                  <Link
                    key={book.number}
                    href={`/libro/${book.number}`}
                    className={`relative flex flex-col items-center justify-center px-3 py-3 rounded-lg border text-sm font-medium text-center leading-tight transition-colors overflow-hidden ${
                      completed
                        ? "bg-accent/5 border-accent/30 text-accent"
                        : readCount > 0
                          ? "bg-white border-accent/20 text-text-primary hover:border-accent hover:text-accent"
                          : "bg-white border-separator text-text-primary hover:border-accent hover:text-accent"
                    }`}
                  >
                    {completed && (
                      <span className="absolute top-1 right-1">
                        <svg
                          className="w-3 h-3 text-accent"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                    <span>{book.name}</span>
                    {readCount > 0 && !completed && (
                      <div className="w-full mt-1.5">
                        <div className="w-full h-1 bg-separator/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent/60 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
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
