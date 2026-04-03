import { NextRequest, NextResponse } from "next/server";
import { removeFavorite } from "@/lib/queries/favorites";

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  const removed = removeFavorite(numId);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
