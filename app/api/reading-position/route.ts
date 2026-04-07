import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getReadingPosition,
  setReadingPosition,
} from "@/lib/queries/reading-progress";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const position = getReadingPosition(session.user.id);
  return NextResponse.json(position);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { bookNumber, chapter, verse } = await request.json();

  if (typeof bookNumber !== "number" || typeof chapter !== "number") {
    return NextResponse.json(
      { error: "bookNumber y chapter son requeridos" },
      { status: 400 }
    );
  }

  setReadingPosition(session.user.id, bookNumber, chapter, verse ?? 1);
  const position = getReadingPosition(session.user.id);
  return NextResponse.json(position);
}
