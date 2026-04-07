import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/queries/users";
import { hash } from "bcryptjs";
import { setUserPassword } from "@/lib/queries/password-reset";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { password } = await request.json();

  if (!password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  const passwordHash = await hash(password, 12);
  setUserPassword(id, passwordHash);

  return NextResponse.json({ success: true });
}
