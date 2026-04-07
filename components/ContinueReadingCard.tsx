import Link from "next/link";

interface ContinueReadingCardProps {
  bookNumber: number;
  bookName: string;
  nextChapter: number;
  verse?: number;
  chaptersRead: number;
  totalChapters: number;
}

export function ContinueReadingCard({
  bookNumber,
  bookName,
  nextChapter,
  verse,
  chaptersRead,
  totalChapters,
}: ContinueReadingCardProps) {
  const pct = Math.round((chaptersRead / totalChapters) * 100);
  const verseLabel = verse && verse > 1 ? `:${verse}` : "";

  return (
    <Link
      href={`/libro/${bookNumber}/${nextChapter}`}
      className="flex items-center justify-between bg-white rounded-xl border border-separator p-4 mb-6 hover:border-accent transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
          Seguir leyendo
        </p>
        <p className="text-lg font-semibold text-text-primary font-[family-name:var(--font-source-serif)]">
          {bookName} {nextChapter}{verseLabel}
        </p>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span>{chaptersRead} de {totalChapters} capítulos</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-separator rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
      <svg
        className="w-5 h-5 text-accent ml-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
