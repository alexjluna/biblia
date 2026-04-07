import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUnreadCount } from "@/lib/queries/notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ unread: 0 });
  }

  const unread = getUnreadCount(session.user.id);
  return NextResponse.json({ unread });
}
