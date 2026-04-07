export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { getBooks } from "@/lib/queries/books";
import {
  getReadChapterCounts,
  getReadingPosition,
  getReadChaptersForBook,
} from "@/lib/queries/reading-progress";
import { BookGridPergamino as BookGrid } from "@/components/BookGridPergamino";
import { ContinueReadingCard } from "@/components/ContinueReadingCard";
import { DailyVerseCard } from "@/components/DailyVerseCard";
import { UserMenu } from "@/components/UserMenu";
import { getDailyVerse } from "@/lib/daily-verse";

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

  if (userId) {
    progressMap = getReadChapterCounts(userId);

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

      <DailyVerseCard verse={getDailyVerse()} />

      <a
        href="/oracion"
        className="flex items-center gap-3 bg-white rounded-xl border border-separator p-4 mb-4 hover:border-accent transition-colors group"
      >
        <span className="text-2xl">🙏</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">Muro de Oración</p>
          <p className="text-xs text-text-secondary">Comparte tus peticiones y ora por otros</p>
        </div>
        <svg className="w-5 h-5 text-accent flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>

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
