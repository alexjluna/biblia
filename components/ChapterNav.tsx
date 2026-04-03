import Link from "next/link";

interface ChapterNavProps {
  bookNumber: number;
  bookName: string;
  chapter: number;
  totalChapters: number;
  prevBook?: { number: number; name: string; chapters_count: number } | null;
  nextBook?: { number: number; name: string } | null;
}

export function ChapterNav({
  bookNumber,
  bookName,
  chapter,
  totalChapters,
  prevBook,
  nextBook,
}: ChapterNavProps) {
  const hasPrev = chapter > 1 || prevBook;
  const hasNext = chapter < totalChapters || nextBook;

  const prevHref =
    chapter > 1
      ? `/libro/${bookNumber}/${chapter - 1}`
      : prevBook
        ? `/libro/${prevBook.number}/${prevBook.chapters_count}`
        : null;

  const prevLabel =
    chapter > 1
      ? `${bookName} ${chapter - 1}`
      : prevBook
        ? `${prevBook.name} ${prevBook.chapters_count}`
        : null;

  const nextHref =
    chapter < totalChapters
      ? `/libro/${bookNumber}/${chapter + 1}`
      : nextBook
        ? `/libro/${nextBook.number}/1`
        : null;

  const nextLabel =
    chapter < totalChapters
      ? `${bookName} ${chapter + 1}`
      : nextBook
        ? `${nextBook.name} 1`
        : null;

  return (
    <div className="flex justify-between items-center py-4 mt-6 border-t border-separator">
      {hasPrev && prevHref ? (
        <Link
          href={prevHref}
          className="text-sm text-accent hover:underline font-medium"
        >
          &larr; {prevLabel}
        </Link>
      ) : (
        <span />
      )}
      {hasNext && nextHref ? (
        <Link
          href={nextHref}
          className="text-sm text-accent hover:underline font-medium"
        >
          {nextLabel} &rarr;
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
