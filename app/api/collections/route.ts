import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserCollections, createCollection, deleteCollection } from "@/lib/queries/collections";
import { validateContent } from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const collections = getUserCollections(session.user.id);
  return NextResponse.json(collections);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { name } = await request.json();
  const validation = validateContent(name, 100);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const result = createCollection(session.user.id, validation.sanitized);
  if (!result) {
    return NextResponse.json({ error: "Ya existe una colección con ese nombre" }, { status: 409 });
  }

  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { collectionId } = await request.json();
  deleteCollection(session.user.id, collectionId);
  return NextResponse.json({ success: true });
}
