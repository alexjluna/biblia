import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeFavorite } from "@/lib/queries/favorites";

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const numId = parseInt(id, 10);

  const removed = removeFavorite(session.user.id, numId);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
