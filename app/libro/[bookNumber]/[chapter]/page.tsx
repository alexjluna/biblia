import { notFound } from "next/navigation";
import Link from "next/link";
import { getBookByNumber } from "@/lib/queries/books";
import { getVerses } from "@/lib/queries/verses";
import { getFavoriteVerseIds } from "@/lib/queries/favorites";
import { VerseList } from "@/components/VerseList";
import { ChapterNav } from "@/components/ChapterNav";

interface Props {
  params: Promise<{ bookNumber: string; chapter: string }>;
}

export default async function ChapterPage({ params }: Props) {
  const { bookNumber, chapter: chapterStr } = await params;
  const bookNum = parseInt(bookNumber, 10);
  const chapter = parseInt(chapterStr, 10);

  const book = getBookByNumber(bookNum);
  if (!book || chapter < 1 || chapter > book.chapters_count) notFound();

  const verses = getVerses(bookNum, chapter);
  if (verses.length === 0) notFound();

  const favoriteIds = getFavoriteVerseIds();
  const favoriteVerseIds = verses
    .filter((v) => favoriteIds.has(v.id))
    .map((v) => v.id);

  // Get prev/next book for navigation
  const prevBook =
    bookNum > 1 ? getBookByNumber(bookNum - 1) : null;
  const nextBook =
    bookNum < 66 ? getBookByNumber(bookNum + 1) : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-6">
        <Link
          href={`/libro/${bookNum}`}
          className="text-sm text-accent hover:underline"
        >
          &larr; {book.name}
        </Link>
        <h1 className="text-2xl font-semibold mt-2 font-[family-name:var(--font-source-serif)]">
          {book.name} {chapter}
        </h1>
      </header>

      <VerseList
        verses={verses}
        bookName={book.name}
        favoriteVerseIds={favoriteVerseIds}
      />

      <ChapterNav
        bookNumber={bookNum}
        bookName={book.name}
        chapter={chapter}
        totalChapters={book.chapters_count}
        prevBook={
          prevBook
            ? {
                number: prevBook.number,
                name: prevBook.name,
                chapters_count: prevBook.chapters_count,
              }
            : null
        }
        nextBook={
          nextBook ? { number: nextBook.number, name: nextBook.name } : null
        }
      />
    </div>
  );
}
