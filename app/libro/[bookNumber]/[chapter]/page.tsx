import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getBookByNumber, getAdjacentBook } from "@/lib/queries/books";
import { getVerses } from "@/lib/queries/verses";
import { getFavoriteVerseIds } from "@/lib/queries/favorites";
import {
  isChapterRead,
  getReadingPosition,
} from "@/lib/queries/reading-progress";
import { getDiscussionSummariesForChapter } from "@/lib/queries/discussions";
import { getNotedVerseIds } from "@/lib/queries/notes";
import { VerseList } from "@/components/VerseList";
import { ChapterNav } from "@/components/ChapterNav";
import { MarkReadButton } from "@/components/MarkReadButton";
import { getActiveVersion } from "@/lib/version";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ bookNumber: string; chapter: string }>;
  searchParams: Promise<{ verse?: string }>;
}

export default async function ChapterPage({ params, searchParams }: Props) {
  const { bookNumber, chapter: chapterStr } = await params;
  const { verse: verseParam } = await searchParams;
  const bookNum = parseInt(bookNumber, 10);
  const chapter = parseInt(chapterStr, 10);
  const scrollToVerse = verseParam ? parseInt(verseParam, 10) : undefined;

  const versionId = await getActiveVersion();

  const book = getBookByNumber(versionId, bookNum);
  if (!book || chapter < 1 || chapter > book.chapters_count) notFound();

  const verses = getVerses(versionId, bookNum, chapter);
  if (verses.length === 0) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  // Favorites: only load if logged in
  let favoriteVerseIds: number[] = [];
  if (userId) {
    const favoriteIds = getFavoriteVerseIds(userId, versionId);
    favoriteVerseIds = verses
      .filter((v) => favoriteIds.has(v.id))
      .map((v) => v.id);
  }

  // Reading progress: only if logged in
  let chapterIsRead = false;
  let savedVerse: number | undefined;
  if (userId) {
    chapterIsRead = isChapterRead(userId, versionId, bookNum, chapter);
    // Check if user has a saved verse position in this chapter
    const position = getReadingPosition(userId, versionId);
    if (position && position.bookNumber === bookNum && position.chapter === chapter) {
      savedVerse = position.verse;
    }
    // NOTE: NO auto-update here — position only changes when user taps "Dejé aquí" or "Leído"
  }

  // Discussion summaries for this chapter
  const discussionMap = getDiscussionSummariesForChapter(versionId, bookNum, chapter);
  const discussionSummaries = Object.fromEntries(discussionMap);

  // Notes for this chapter (only if logged in)
  let notedVerseIds: number[] = [];
  if (userId) {
    const noted = getNotedVerseIds(userId, versionId, bookNum, chapter);
    notedVerseIds = Array.from(noted);
  }

  // Get prev/next book for navigation using sort_order
  const prevBook = getAdjacentBook(versionId, bookNum, "prev");
  const nextBook = getAdjacentBook(versionId, bookNum, "next");

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
        scrollToVerse={scrollToVerse}
        isLoggedIn={!!userId}
        discussionSummaries={discussionSummaries}
        notedVerseIds={notedVerseIds}
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
