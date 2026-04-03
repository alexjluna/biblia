import { getBooks } from "@/lib/queries/books";
import { BookGrid } from "@/components/BookGrid";

export default function HomePage() {
  const books = getBooks();
  const atBooks = books.filter((b) => b.testament === "AT");
  const ntBooks = books.filter((b) => b.testament === "NT");

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-source-serif)] text-text-primary">
          Biblia
        </h1>
        <p className="text-sm text-text-secondary mt-1">Reina Valera 1909</p>
      </header>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Antiguo Testamento
            </h2>
            <span className="text-xs text-text-secondary bg-separator/50 rounded-full px-2 py-0.5">
              {atBooks.length} libros
            </span>
          </div>
          <BookGrid books={atBooks} testament="AT" />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Nuevo Testamento
            </h2>
            <span className="text-xs text-text-secondary bg-separator/50 rounded-full px-2 py-0.5">
              {ntBooks.length} libros
            </span>
          </div>
          <BookGrid books={ntBooks} testament="NT" />
        </section>
      </div>
    </div>
  );
}
