import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  unmarkChapterRead,
  unmarkBookRead,
  markBookRead,
} from "@/lib/queries/reading-progress";
import { getBookByNumber } from "@/lib/queries/books";
import { DEFAULT_VERSION, VALID_VERSIONS, type BibleVersionId } from "@/lib/version";

function getVersion(request: NextRequest): BibleVersionId {
  const v = request.nextUrl.searchParams.get("version") || request.cookies.get("bible_version")?.value;
  return v && VALID_VERSIONS.includes(v as BibleVersionId) ? (v as BibleVersionId) : DEFAULT_VERSION;
}

interface Props {
  params: Promise<{ bookNumber: string }>;
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const versionId = getVersion(request);
  const { bookNumber: bookStr } = await params;
  const bookNumber = parseInt(bookStr, 10);
  const chapter = request.nextUrl.searchParams.get("chapter");

  if (chapter) {
    const ch = parseInt(chapter, 10);
    const removed = unmarkChapterRead(session.user.id, versionId, bookNumber, ch);
    return NextResponse.json({ success: removed });
  }

  // Bulk: unmark entire book
  const count = unmarkBookRead(session.user.id, versionId, bookNumber);
  return NextResponse.json({ success: true, chaptersRemoved: count });
}

export async function POST(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const versionId = getVersion(request);
  const { bookNumber: bookStr } = await params;
  const bookNumber = parseInt(bookStr, 10);
  const { action } = await request.json();

  if (action !== "mark_all_read") {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  const book = getBookByNumber(versionId, bookNumber);
  if (!book) {
    return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 });
  }

  const marked = markBookRead(session.user.id, versionId, bookNumber, book.chapters_count);
  return NextResponse.json({ chaptersMarked: marked });
}
