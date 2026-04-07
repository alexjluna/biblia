import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFavorites, addFavorite } from "@/lib/queries/favorites";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const verseId = request.nextUrl.searchParams.get("verseId");

  if (verseId) {
    const row = getDb()
      .prepare("SELECT id FROM favorites WHERE user_id = ? AND verse_id = ?")
      .get(session.user.id, parseInt(verseId, 10)) as { id: number } | undefined;
    return NextResponse.json({ favoriteId: row?.id || null });
  }

  const favorites = getFavorites(session.user.id);
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
