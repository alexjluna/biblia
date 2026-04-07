import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { editMessage, deleteMessage, adminDeleteMessage } from "@/lib/queries/discussions";
import { isAdmin } from "@/lib/queries/users";
import { validateContent } from "@/lib/validation";

interface Props {
  params: Promise<{ messageId: string }>;
}

export async function PUT(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { messageId } = await params;
  const { content } = await request.json();

  const validation = validateContent(content);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const updated = editMessage(session.user.id, parseInt(messageId, 10), validation.sanitized);
  if (!updated) {
    return NextResponse.json({ error: "No encontrado o no autorizado" }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { messageId } = await params;
  const msgId = parseInt(messageId, 10);

  // Try own delete first, then admin
  let deleted = deleteMessage(session.user.id, msgId);
  if (!deleted && isAdmin(session.user.id)) {
    deleted = adminDeleteMessage(msgId);
  }

  if (!deleted) {
    return NextResponse.json({ error: "No encontrado o no autorizado" }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
