export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { getBooks } from "@/lib/queries/books";
import {
  getReadChapterCounts,
  getReadingPosition,
  getReadChaptersForBook,
} from "@/lib/queries/reading-progress";
import { BookGrid } from "@/components/BookGrid";
import { ContinueReadingCard } from "@/components/ContinueReadingCard";
import { DailyVerseCard } from "@/components/DailyVerseCard";
import { StreakCard } from "@/components/StreakCard";
import { UserMenu } from "@/components/UserMenu";
import { getDailyVerse } from "@/lib/daily-verse";
import { getCurrentStreak, getWeekDays } from "@/lib/queries/streaks";

export default async function HomePage() {
  const books = getBooks();
  const atBooks = books.filter((b) => b.testament === "AT");
  const ntBooks = books.filter((b) => b.testament === "NT");

  const session = await auth();
  const userId = session?.user?.id;

  let progressMap: Map<number, number> | undefined;
  let continueReading: {
    bookNumber: number;
    bookName: string;
    nextChapter: number;
    verse?: number;
    chaptersRead: number;
    totalChapters: number;
  } | null = null;
  let streak = 0;
  let weekDays: boolean[] = [false, false, false, false, false, false, false];

  if (userId) {
    progressMap = getReadChapterCounts(userId);
    streak = getCurrentStreak(userId);
    weekDays = getWeekDays(userId);

    // Find continue reading data
    const position = getReadingPosition(userId);
    if (position) {
      const book = books.find((b) => b.number === position.bookNumber);
      if (book) {
        const readChapters = getReadChaptersForBook(userId, book.number);
        // Find next unread chapter
        let nextChapter = position.chapter;
        for (let ch = 1; ch <= book.chapters_count; ch++) {
          if (!readChapters.has(ch)) {
            nextChapter = ch;
            break;
          }
        }
        // If all chapters are read, suggest next chapter after position
        if (readChapters.size === book.chapters_count) {
          nextChapter = Math.min(position.chapter + 1, book.chapters_count);
        }

        continueReading = {
          bookNumber: book.number,
          bookName: book.name,
          nextChapter,
          verse: nextChapter === position.chapter ? position.verse : undefined,
          chaptersRead: readChapters.size,
          totalChapters: book.chapters_count,
        };
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-8 text-center relative">
        <div className="absolute right-0 top-0">
          <UserMenu />
        </div>
        <a href="/" className="text-3xl font-bold font-[family-name:var(--font-source-serif)] text-text-primary hover:text-accent transition-colors">
          Biblia
        </a>
        <p className="text-sm text-text-secondary mt-1">Reina Valera 1960</p>
      </header>

      {userId && <StreakCard currentStreak={streak} weekDays={weekDays} />}

      <DailyVerseCard verse={getDailyVerse()} />

      {continueReading && (
        <ContinueReadingCard
          bookNumber={continueReading.bookNumber}
          bookName={continueReading.bookName}
          nextChapter={continueReading.nextChapter}
          verse={continueReading.verse}
          chaptersRead={continueReading.chaptersRead}
          totalChapters={continueReading.totalChapters}
        />
      )}

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Antiguo Testamento
            </h2>
            <span className="text-xs text-text-secondary bg-separator/50 rounded-full px-2 py-0.5">
              {atBooks.length} libros
            </span>
          </div>
          <BookGrid books={atBooks} testament="AT" progressMap={progressMap} />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Nuevo Testamento
            </h2>
            <span className="text-xs text-text-secondary bg-separator/50 rounded-full px-2 py-0.5">
              {ntBooks.length} libros
            </span>
          </div>
          <BookGrid books={ntBooks} testament="NT" progressMap={progressMap} />
        </section>
      </div>
    </div>
  );
}
