import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  getDiscussionSummariesForChapter,
  getDiscussionByVerseId,
  createDiscussionWithMessage,
} from "@/lib/queries/discussions";
import { validateContent } from "@/lib/validation";
import { canCreateDiscussion } from "@/lib/rate-limit";
import { canPostContent } from "@/lib/auth-check";
import { DEFAULT_VERSION, VALID_VERSIONS, type BibleVersionId } from "@/lib/version";

function getVersion(request: NextRequest): BibleVersionId {
  const v = request.nextUrl.searchParams.get("version") || request.cookies.get("bible_version")?.value;
  return v && VALID_VERSIONS.includes(v as BibleVersionId) ? (v as BibleVersionId) : DEFAULT_VERSION;
}

export async function GET(request: NextRequest) {
  const bookNumber = request.nextUrl.searchParams.get("bookNumber");
  const chapter = request.nextUrl.searchParams.get("chapter");
  const verseId = request.nextUrl.searchParams.get("verseId");

  if (bookNumber && chapter) {
    const versionId = getVersion(request);
    const summaries = getDiscussionSummariesForChapter(
      versionId,
      parseInt(bookNumber, 10),
      parseInt(chapter, 10)
    );
    return NextResponse.json(Object.fromEntries(summaries));
  }

  if (verseId) {
    const discussion = getDiscussionByVerseId(parseInt(verseId, 10));
    return NextResponse.json(discussion);
  }

  return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!canPostContent(session.user.id)) {
    return NextResponse.json({ error: "Debes verificar tu email" }, { status: 403 });
  }

  if (!canCreateDiscussion(session.user.id)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera un momento." }, { status: 429 });
  }

  const { verseId, content } = await request.json();

  if (!verseId || typeof verseId !== "number") {
    return NextResponse.json({ error: "verseId requerido" }, { status: 400 });
  }

  const validation = validateContent(content);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Check verse exists
  const verse = getDb().prepare("SELECT id FROM verses WHERE id = ?").get(verseId);
  if (!verse) {
    return NextResponse.json({ error: "Versículo no encontrado" }, { status: 404 });
  }

  // Check if discussion already exists
  const existing = getDiscussionByVerseId(verseId);
  if (existing) {
    return NextResponse.json({ error: "Ya existe una discusión para este versículo", existingId: existing.id }, { status: 409 });
  }

  try {
    const result = createDiscussionWithMessage(session.user.id, verseId, validation.sanitized);
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear la discusión" }, { status: 500 });
  }
}
