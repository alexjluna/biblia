import Link from "next/link";

interface ChapterGridProps {
  bookNumber: number;
  bookName: string;
  totalChapters: number;
}

export function ChapterGrid({
  bookNumber,
  bookName,
  totalChapters,
}: ChapterGridProps) {
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

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
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
        {chapters.map((ch) => (
          <Link
            key={ch}
            href={`/libro/${bookNumber}/${ch}`}
            className="flex items-center justify-center w-full aspect-square rounded-lg bg-white border border-separator text-base font-medium text-text-primary hover:border-accent hover:text-accent hover:bg-accent/5 transition-colors"
          >
            {ch}
          </Link>
        ))}
      </div>
    </div>
  );
}
