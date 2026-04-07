import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBookByNumber } from "@/lib/queries/books";
import { getReadChaptersForBook } from "@/lib/queries/reading-progress";
import { ChapterGrid } from "@/components/ChapterGrid";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ bookNumber: string }>;
}

export default async function BookPage({ params }: Props) {
  const { bookNumber } = await params;
  const num = parseInt(bookNumber, 10);
  const book = getBookByNumber(num);

  if (!book) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  let readChapters: Set<number> | undefined;
  if (userId) {
    readChapters = getReadChaptersForBook(userId, num);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <ChapterGrid
        bookNumber={book.number}
        bookName={book.name}
        totalChapters={book.chapters_count}
        readChapters={readChapters}
      />
    </div>
  );
}
