import Link from "next/link";

interface ChapterGridProps {
  bookNumber: number;
  bookName: string;
  totalChapters: number;
  readChapters?: Set<number>;
}

export function ChapterGrid({
  bookNumber,
  bookName,
  totalChapters,
  readChapters,
}: ChapterGridProps) {
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
  const readCount = readChapters?.size ?? 0;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-accent hover:underline"
        >
          &larr; Todos los libros
        </Link>
        <h1 className="text-2xl font-semibold mt-2 font-[family-name:var(--font-source-serif)]">
          {bookName}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {totalChapters} capítulos
        </p>
        {readCount > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
              <span>
                {readCount} de {totalChapters} leídos
              </span>
              <span>{Math.round((readCount / totalChapters) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-separator rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{
                  width: `${(readCount / totalChapters) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
        {chapters.map((ch) => {
          const isRead = readChapters?.has(ch) ?? false;
          return (
            <Link
              key={ch}
              href={`/libro/${bookNumber}/${ch}`}
              className={`relative flex items-center justify-center w-full aspect-square rounded-lg border text-base font-medium transition-colors ${
                isRead
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-white border-separator text-text-primary hover:border-accent hover:text-accent hover:bg-accent/5"
              }`}
            >
              {ch}
              {isRead && (
                <span className="absolute top-0.5 right-0.5">
                  <svg
                    className="w-2.5 h-2.5 text-accent"
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
