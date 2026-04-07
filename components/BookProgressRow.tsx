import Link from "next/link";

interface BookProgressRowProps {
  bookNumber: number;
  bookName: string;
  chaptersRead: number;
  totalChapters: number;
}

export function BookProgressRow({
  bookNumber,
  bookName,
  chaptersRead,
  totalChapters,
}: BookProgressRowProps) {
  const pct = totalChapters > 0 ? (chaptersRead / totalChapters) * 100 : 0;
  const completed = chaptersRead === totalChapters;

  return (
    <Link
      href={`/libro/${bookNumber}`}
      className="flex items-center gap-3 py-2.5 hover:bg-accent/5 rounded-lg px-2 -mx-2 transition-colors"
    >
      <span className="text-sm font-medium text-text-primary flex-1 truncate">
        {bookName}
      </span>
      <span className="text-xs text-text-secondary whitespace-nowrap">
        {chaptersRead}/{totalChapters}
      </span>
      <div className="w-16 h-1.5 bg-separator rounded-full overflow-hidden flex-shrink-0">
        <div
          className="h-full bg-accent rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {completed && (
        <svg
          className="w-4 h-4 text-accent flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </Link>
  );
}
