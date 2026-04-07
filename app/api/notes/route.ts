import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getNoteForVerse, saveNote, deleteNote } from "@/lib/queries/notes";
import { validateContent } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const verseId = request.nextUrl.searchParams.get("verseId");
  if (!verseId) {
    return NextResponse.json({ error: "verseId requerido" }, { status: 400 });
  }

  const note = getNoteForVerse(session.user.id, parseInt(verseId, 10));
  return NextResponse.json(note);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { verseId, content } = await request.json();

  if (!verseId || typeof verseId !== "number") {
    return NextResponse.json({ error: "verseId requerido" }, { status: 400 });
  }

  const validation = validateContent(content);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const result = saveNote(session.user.id, verseId, validation.sanitized);
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const verseId = request.nextUrl.searchParams.get("verseId");
  if (!verseId) {
    return NextResponse.json({ error: "verseId requerido" }, { status: 400 });
  }

  deleteNote(session.user.id, parseInt(verseId, 10));
  return NextResponse.json({ success: true });
}
