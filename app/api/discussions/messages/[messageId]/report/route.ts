import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reportMessage } from "@/lib/queries/discussions";
import { validateContent } from "@/lib/validation";

interface Props {
  params: Promise<{ messageId: string }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { messageId } = await params;
  const { reason } = await request.json();

  const validation = validateContent(reason, 500);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const result = reportMessage(session.user.id, parseInt(messageId, 10), validation.sanitized);
  if (!result) {
    return NextResponse.json({ error: "Ya has reportado este mensaje" }, { status: 409 });
  }

  return NextResponse.json(result, { status: 201 });
}
