import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTopReaders, getUserRank, getTotalParticipants } from "@/lib/queries/ranking";
import { DEFAULT_VERSION, VALID_VERSIONS, type BibleVersionId } from "@/lib/version";

function getVersion(request: NextRequest): BibleVersionId {
  const v = request.nextUrl.searchParams.get("version") || request.cookies.get("bible_version")?.value;
  return v && VALID_VERSIONS.includes(v as BibleVersionId) ? (v as BibleVersionId) : DEFAULT_VERSION;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const versionId = getVersion(request);
  const topReaders = getTopReaders(versionId, 10);
  const totalParticipants = getTotalParticipants(versionId);

  let currentUser = null;
  if (session?.user?.id) {
    const isInTop = topReaders.some((r) => r.userId === session.user!.id);
    if (isInTop) {
      currentUser = topReaders.find((r) => r.userId === session.user!.id)!;
    } else {
      currentUser = getUserRank(session.user.id, versionId);
    }
  }

  const response = NextResponse.json({
    topReaders,
    currentUser,
    totalParticipants,
  });

  response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
  return response;
}
