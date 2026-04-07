import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleLike, getMessageAuthor } from "@/lib/queries/discussions";
import { createNotification } from "@/lib/queries/notifications";
import { getDb } from "@/lib/db";
import { canLike } from "@/lib/rate-limit";

interface Props {
  params: Promise<{ messageId: string }>;
}

export async function POST(_request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!canLike(session.user.id)) {
    return NextResponse.json({ error: "Demasiados likes. Espera un momento." }, { status: 429 });
  }

  const { messageId } = await params;
  const msgId = parseInt(messageId, 10);

  const result = toggleLike(session.user.id, msgId);

  // Notify message author on like (not unlike)
  if (result.liked) {
    const authorId = getMessageAuthor(msgId);
    if (authorId) {
      const msg = getDb()
        .prepare("SELECT discussion_id FROM discussion_messages WHERE id = ?")
        .get(msgId) as { discussion_id: number } | undefined;
      if (msg) {
        createNotification(authorId, "like", msg.discussion_id, msgId, session.user.id);
      }
    }
  }

  return NextResponse.json(result);
}
