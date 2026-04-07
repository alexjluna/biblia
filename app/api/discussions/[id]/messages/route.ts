import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMessages, addMessage } from "@/lib/queries/discussions";
import { notifyDiscussionParticipants, createNotification } from "@/lib/queries/notifications";
import { getMessageAuthor } from "@/lib/queries/discussions";
import { validateContent } from "@/lib/validation";
import { canPostMessage } from "@/lib/rate-limit";
import { canPostContent } from "@/lib/auth-check";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const discussionId = parseInt(id, 10);
  const session = await auth();

  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "30", 10);

  const result = getMessages(discussionId, session?.user?.id ?? null, Math.min(limit, 50), cursor);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!canPostContent(session.user.id)) {
    return NextResponse.json({ error: "Debes verificar tu email" }, { status: 403 });
  }

  if (!canPostMessage(session.user.id)) {
    return NextResponse.json({ error: "Demasiados mensajes. Espera un momento." }, { status: 429 });
  }

  const { id } = await params;
  const discussionId = parseInt(id, 10);
  const { content, parentId } = await request.json();

  const validation = validateContent(content);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const result = addMessage(session.user.id, discussionId, validation.sanitized, parentId);

  // Notifications
  if (parentId) {
    const parentAuthor = getMessageAuthor(parentId);
    if (parentAuthor) {
      createNotification(parentAuthor, "reply", discussionId, result.id, session.user.id);
    }
  }
  notifyDiscussionParticipants(discussionId, session.user.id, "new_message", result.id, session.user.id);

  return NextResponse.json(result, { status: 201 });
}
