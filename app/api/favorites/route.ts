import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFavorites, addFavorite } from "@/lib/queries/favorites";
import { getDb } from "@/lib/db";
import { DEFAULT_VERSION, VALID_VERSIONS, type BibleVersionId } from "@/lib/version";

function getVersion(request: NextRequest): BibleVersionId {
  const v = request.nextUrl.searchParams.get("version") || request.cookies.get("bible_version")?.value;
  return v && VALID_VERSIONS.includes(v as BibleVersionId) ? (v as BibleVersionId) : DEFAULT_VERSION;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const versionId = getVersion(request);
  const verseId = request.nextUrl.searchParams.get("verseId");

  if (verseId) {
    const row = getDb()
      .prepare("SELECT id FROM favorites WHERE user_id = ? AND verse_id = ?")
      .get(session.user.id, parseInt(verseId, 10)) as { id: number } | undefined;
    return NextResponse.json({ favoriteId: row?.id || null });
  }

  const favorites = getFavorites(session.user.id, versionId);
  return NextResponse.json(favorites);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { verseId } = await request.json();

  if (!verseId || typeof verseId !== "number") {
    return NextResponse.json({ error: "verseId required" }, { status: 400 });
  }

  const result = addFavorite(session.user.id, verseId);
  if (!result) {
    return NextResponse.json({ error: "Already favorited" }, { status: 409 });
  }

  return NextResponse.json(result, { status: 201 });
}
