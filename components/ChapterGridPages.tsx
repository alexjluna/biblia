import Link from "next/link";

interface ChapterGridPagesProps {
  bookNumber: number;
  bookName: string;
  totalChapters: number;
  readChapters?: Set<number>;
}

export function ChapterGridPages({
  bookNumber,
  bookName,
  totalChapters,
  readChapters,
}: ChapterGridPagesProps) {
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
  const readCount = readChapters?.size ?? 0;

  return (
    <div>
      {/* Header with open book motif */}
      <div className="mb-6">
        <Link href="/" className="text-sm text-accent hover:underline">
          &larr; Todos los libros
        </Link>
        <h1 className="text-3xl font-semibold mt-2 font-[family-name:var(--font-source-serif)]">
          {bookName}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {totalChapters} capítulos
        </p>

        {/* Bookmark-style progress */}
        {readCount > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
              <span>{readCount} de {totalChapters} leídos</span>
              <span>{Math.round((readCount / totalChapters) * 100)}%</span>
            </div>
            <div className="flex gap-px">
              {chapters.map((ch) => (
                <div
                  key={ch}
                  className={`flex-1 h-1.5 first:rounded-l-full last:rounded-r-full ${
                    readChapters?.has(ch)
                      ? "bg-accent"
                      : "bg-separator/40"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Page cards grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
        {chapters.map((ch) => {
          const isRead = readChapters?.has(ch) ?? false;

          return (
            <Link
              key={ch}
              href={`/libro/${bookNumber}/${ch}`}
              className={`relative flex items-center justify-center w-full aspect-[3/4] rounded-lg text-base font-medium transition-all duration-200 ${
                isRead
                  ? "bg-gradient-to-b from-accent/15 to-accent/8 border border-accent/25 text-accent font-bold shadow-sm"
                  : "bg-gradient-to-b from-white to-[#FDFBF8] border border-separator/80 text-text-secondary shadow-[2px_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md hover:-translate-y-0.5 hover:border-accent/30 hover:text-accent"
              }`}
            >
              {ch}
              {/* Page fold corner for read chapters */}
              {isRead && (
                <span className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-parchment border-l-[12px] border-l-accent/20" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
