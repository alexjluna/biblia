import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getOverallProgress,
  getReadChaptersForBook,
  markChapterRead,
} from "@/lib/queries/reading-progress";
import { getBookByNumber } from "@/lib/queries/books";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const bookNumber = request.nextUrl.searchParams.get("bookNumber");

  if (bookNumber) {
    const num = parseInt(bookNumber, 10);
    const book = getBookByNumber(num);
    if (!book) {
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 });
    }
    const readChapters = getReadChaptersForBook(session.user.id, num);
    return NextResponse.json({
      bookNumber: num,
      bookName: book.name,
      chaptersCount: book.chapters_count,
      chaptersRead: readChapters.size,
      readChapters: Array.from(readChapters).sort((a, b) => a - b),
    });
  }

  const progress = getOverallProgress(session.user.id);
  return NextResponse.json(progress);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { bookNumber, chapter } = await request.json();

  if (typeof bookNumber !== "number" || typeof chapter !== "number") {
    return NextResponse.json(
      { error: "bookNumber y chapter son requeridos" },
      { status: 400 }
    );
  }

  const book = getBookByNumber(bookNumber);
  if (!book || chapter < 1 || chapter > book.chapters_count) {
    return NextResponse.json(
      { error: "Libro o capítulo inválido" },
      { status: 400 }
    );
  }

  const result = markChapterRead(session.user.id, bookNumber, chapter);
  if (!result) {
    return NextResponse.json({ error: "Ya marcado como leído" }, { status: 409 });
  }

  // Check if book is now complete
  const readChapters = getReadChaptersForBook(session.user.id, bookNumber);
  const bookCompleted = readChapters.size === book.chapters_count;

  return NextResponse.json(
    { id: result.id, bookCompleted, bookName: book.name },
    { status: 201 }
  );
}
