import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { VALID_VERSIONS, type BibleVersionId } from "@/lib/version";

export async function POST(request: NextRequest) {
  const { version } = (await request.json()) as { version: string };

  if (!VALID_VERSIONS.includes(version as BibleVersionId)) {
    return NextResponse.json({ error: "Invalid version" }, { status: 400 });
  }

  // Update user preference if logged in
  const session = await auth();
  if (session?.user?.id) {
    try {
      getDb()
        .prepare("UPDATE users SET preferred_version = ? WHERE id = ?")
        .run(version, session.user.id);
    } catch {
      // Column may not exist yet during migration
    }
  }

  const response = NextResponse.json({ version });
  response.cookies.set("bible_version", version, {
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
  });
  return response;
}
