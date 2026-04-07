import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrayerRequests, createPrayerRequest, togglePraying, deletePrayerRequest } from "@/lib/queries/prayers";
import { validateContent } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();
  const requests = getPrayerRequests(session?.user?.id ?? null);
  return NextResponse.json(requests);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { content, verseId, isAnonymous, action, requestId } = await request.json();

  // Toggle praying
  if (action === "pray" && requestId) {
    const result = togglePraying(session.user.id, requestId);
    return NextResponse.json(result);
  }

  // Create new prayer request
  if (!checkRateLimit(`prayer:create:${session.user.id}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiadas peticiones. Espera un momento." }, { status: 429 });
  }

  const validation = validateContent(content, 280);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const result = createPrayerRequest(
    session.user.id,
    validation.sanitized,
    verseId ?? null,
    isAnonymous !== false
  );

  if (!result) {
    return NextResponse.json({ error: "Máximo 3 peticiones activas" }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { requestId } = await request.json();
  deletePrayerRequest(session.user.id, requestId);
  return NextResponse.json({ success: true });
}
