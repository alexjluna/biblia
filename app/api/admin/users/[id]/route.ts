import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserById,
  updateUser,
  deleteUser,
  verifyUserEmail,
  isAdmin,
} from "@/lib/queries/users";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const user = getUserById(id);
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  // Handle verify action
  if (body.action === "verify") {
    verifyUserEmail(id);
    return NextResponse.json({ success: true });
  }

  const updated = updateUser(id, {
    name: body.name,
    email: body.email,
    role: body.role,
  });

  if (!updated) {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 400 });
  }

  const user = getUserById(id);
  return NextResponse.json(user);
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent deleting yourself
  if (id === session.user.id) {
    return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
  }

  const deleted = deleteUser(id);
  if (!deleted) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
