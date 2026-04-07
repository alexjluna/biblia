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

  // Find next unread chapter for the pulsing indicator
  let nextUnread: number | null = null;
  if (readCount > 0 && readCount < totalChapters) {
    for (let i = 1; i <= totalChapters; i++) {
      if (!readChapters?.has(i)) {
        nextUnread = i;
        break;
      }
    }
  }

  // Split chapters into rows of 5 for offset pattern
  const rows: number[][] = [];
  for (let i = 0; i < chapters.length; i += 5) {
    rows.push(chapters.slice(i, i + 5));
  }

  return (
    <div>
      {/* Header with watermark */}
      <div className="mb-6 relative">
        <Link href="/" className="text-sm text-accent hover:underline">
          &larr; Todos los libros
        </Link>
        <div className="relative mt-2">
          {/* Watermark abbreviation */}
          <span className="absolute -top-2 right-0 text-[72px] font-bold text-accent/[0.04] font-[family-name:var(--font-source-serif)] select-none pointer-events-none leading-none">
            {bookName.slice(0, 3)}
          </span>
          <h1 className="text-3xl font-semibold font-[family-name:var(--font-source-serif)] relative">
            {bookName}
          </h1>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          {totalChapters} capítulos
        </p>

        {/* Segmented progress bar */}
        {readCount > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
              <span>{readCount} de {totalChapters} leídos</span>
              <span>{Math.round((readCount / totalChapters) * 100)}%</span>
            </div>
            <div className="flex gap-[2px]">
              {chapters.map((ch) => (
                <div
                  key={ch}
                  className={`flex-1 h-2 first:rounded-l-full last:rounded-r-full transition-colors ${
                    readChapters?.has(ch) ? "bg-accent" : "bg-separator/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stepping stones with offset rows */}
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-2 justify-start"
            style={rowIndex % 2 === 1 ? { paddingLeft: "calc(50% / 5 + 4px)" } : undefined}
          >
            {row.map((ch) => {
              const isRead = readChapters?.has(ch) ?? false;
              const isNext = ch === nextUnread;

              return (
                <Link
                  key={ch}
                  href={`/libro/${bookNumber}/${ch}`}
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isRead
                      ? "bg-accent text-white shadow-[0_2px_6px_rgba(124,92,62,0.3)] scale-105"
                      : isNext
                        ? "bg-white border-2 border-accent text-accent ring-4 ring-accent/10 animate-pulse"
                        : "bg-white border border-separator text-text-secondary shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-accent/30 hover:text-accent"
                  }`}
                >
                  {ch}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
