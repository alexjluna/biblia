import { NextRequest, NextResponse } from "next/server";
import {
  getFavorites,
  addFavorite,
} from "@/lib/queries/favorites";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const verseId = request.nextUrl.searchParams.get("verseId");

  if (verseId) {
    const row = getDb()
      .prepare("SELECT id FROM favorites WHERE verse_id = ?")
      .get(parseInt(verseId, 10)) as { id: number } | undefined;
    return NextResponse.json({ favoriteId: row?.id || null });
  }

  const favorites = getFavorites();
  return NextResponse.json(favorites);
}

export async function POST(request: NextRequest) {
  const { verseId } = await request.json();

  if (!verseId || typeof verseId !== "number") {
    return NextResponse.json({ error: "verseId required" }, { status: 400 });
  }

  const result = addFavorite(verseId);
  if (!result) {
    return NextResponse.json({ error: "Already favorited" }, { status: 409 });
  }

  return NextResponse.json(result, { status: 201 });
}
