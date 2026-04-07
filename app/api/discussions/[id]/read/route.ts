import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markDiscussionRead } from "@/lib/queries/discussions";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  markDiscussionRead(session.user.id, parseInt(id, 10));
  return NextResponse.json({ success: true });
}
