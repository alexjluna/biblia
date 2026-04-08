import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getReadingPosition,
  setReadingPosition,
} from "@/lib/queries/reading-progress";
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
  const position = getReadingPosition(session.user.id, versionId);
  return NextResponse.json(position);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { bookNumber, chapter, verse, version } = await request.json();
  const versionId: BibleVersionId =
    version && VALID_VERSIONS.includes(version) ? version : getVersion(request);

  if (typeof bookNumber !== "number" || typeof chapter !== "number") {
    return NextResponse.json(
      { error: "bookNumber y chapter son requeridos" },
      { status: 400 }
    );
  }

  setReadingPosition(session.user.id, versionId, bookNumber, chapter, verse ?? 1);
  const position = getReadingPosition(session.user.id, versionId);
  return NextResponse.json(position);
}
