import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addToCollection, removeFromCollection } from "@/lib/queries/collections";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { favoriteId } = await request.json();

  addToCollection(parseInt(id, 10), favoriteId);
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { favoriteId } = await request.json();

  removeFromCollection(parseInt(id, 10), favoriteId);
  return NextResponse.json({ success: true });
}
