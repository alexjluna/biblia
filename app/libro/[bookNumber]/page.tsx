import { notFound } from "next/navigation";
import { getBookByNumber } from "@/lib/queries/books";
import { ChapterGrid } from "@/components/ChapterGrid";

interface Props {
  params: Promise<{ bookNumber: string }>;
}

export default async function BookPage({ params }: Props) {
  const { bookNumber } = await params;
  const num = parseInt(bookNumber, 10);
  const book = getBookByNumber(num);

  if (!book) notFound();

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <ChapterGrid
        bookNumber={book.number}
        bookName={book.name}
        totalChapters={book.chapters_count}
      />
    </div>
  );
}
