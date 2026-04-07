import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getNotifications, markAllRead } from "@/lib/queries/notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const notifications = getNotifications(session.user.id);
  return NextResponse.json(notifications);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { action } = await request.json();
  if (action === "read_all") {
    markAllRead(session.user.id);
  }

  return NextResponse.json({ success: true });
}
