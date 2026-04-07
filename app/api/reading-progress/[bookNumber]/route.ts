import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  unmarkChapterRead,
  unmarkBookRead,
  markBookRead,
} from "@/lib/queries/reading-progress";
import { getBookByNumber } from "@/lib/queries/books";

interface Props {
  params: Promise<{ bookNumber: string }>;
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { bookNumber: bookStr } = await params;
  const bookNumber = parseInt(bookStr, 10);
  const chapter = request.nextUrl.searchParams.get("chapter");

  if (chapter) {
    const ch = parseInt(chapter, 10);
    const removed = unmarkChapterRead(session.user.id, bookNumber, ch);
    return NextResponse.json({ success: removed });
  }

  // Bulk: unmark entire book
  const count = unmarkBookRead(session.user.id, bookNumber);
  return NextResponse.json({ success: true, chaptersRemoved: count });
}

export async function POST(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { bookNumber: bookStr } = await params;
  const bookNumber = parseInt(bookStr, 10);
  const { action } = await request.json();

  if (action !== "mark_all_read") {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  const book = getBookByNumber(bookNumber);
  if (!book) {
    return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 });
  }

  const marked = markBookRead(session.user.id, bookNumber, book.chapters_count);
  return NextResponse.json({ chaptersMarked: marked });
}
