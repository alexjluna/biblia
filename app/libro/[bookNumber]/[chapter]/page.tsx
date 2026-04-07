import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getBookByNumber } from "@/lib/queries/books";
import { getVerses } from "@/lib/queries/verses";
import { getFavoriteVerseIds } from "@/lib/queries/favorites";
import {
  isChapterRead,
  getReadingPosition,
} from "@/lib/queries/reading-progress";
import { VerseList } from "@/components/VerseList";
import { ChapterNav } from "@/components/ChapterNav";
import { MarkReadButton } from "@/components/MarkReadButton";

export const dynamic = "force-dynamic";

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

  const session = await auth();
  const userId = session?.user?.id;

  // Favorites: only load if logged in
  let favoriteVerseIds: number[] = [];
  if (userId) {
    const favoriteIds = getFavoriteVerseIds(userId);
    favoriteVerseIds = verses
      .filter((v) => favoriteIds.has(v.id))
      .map((v) => v.id);
  }

  // Reading progress: only if logged in
  let chapterIsRead = false;
  let savedVerse: number | undefined;
  if (userId) {
    chapterIsRead = isChapterRead(userId, bookNum, chapter);
    // Check if user has a saved verse position in this chapter
    const position = getReadingPosition(userId);
    if (position && position.bookNumber === bookNum && position.chapter === chapter) {
      savedVerse = position.verse;
    }
    // NOTE: NO auto-update here — position only changes when user taps "Dejé aquí" or "Leído"
  }

  // Get prev/next book for navigation
  const prevBook = bookNum > 1 ? getBookByNumber(bookNum - 1) : null;
  const nextBook = bookNum < 66 ? getBookByNumber(bookNum + 1) : null;

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
        savedVerse={savedVerse}
      />

      {userId && (
        <MarkReadButton
          bookNumber={bookNum}
          chapter={chapter}
          initialIsRead={chapterIsRead}
        />
      )}

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
