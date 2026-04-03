import Link from "next/link";
import type { Book } from "@/lib/types";

interface BookGridProps {
  books: Book[];
  testament: "AT" | "NT";
}

const CATEGORY_ORDER_AT = ["Pentateuco", "Históricos", "Poéticos", "Profetas"];
const CATEGORY_ORDER_NT = [
  "Evangelios",
  "Hechos",
  "Cartas Paulinas",
  "Cartas Generales",
  "Profecía",
];

export function BookGrid({ books, testament }: BookGridProps) {
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
              {categoryBooks.map((book) => (
                <Link
                  key={book.number}
                  href={`/libro/${book.number}`}
                  className="flex items-center justify-center px-3 py-3 rounded-lg bg-white border border-separator text-sm font-medium text-text-primary hover:border-accent hover:text-accent transition-colors text-center leading-tight"
                >
                  {book.name}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
