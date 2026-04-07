import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTopReaders, getUserRank, getTotalParticipants } from "@/lib/queries/ranking";

export async function GET() {
  const session = await auth();
  const topReaders = getTopReaders(10);
  const totalParticipants = getTotalParticipants();

  let currentUser = null;
  if (session?.user?.id) {
    const isInTop = topReaders.some((r) => r.userId === session.user!.id);
    if (isInTop) {
      currentUser = topReaders.find((r) => r.userId === session.user!.id)!;
    } else {
      currentUser = getUserRank(session.user.id);
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
