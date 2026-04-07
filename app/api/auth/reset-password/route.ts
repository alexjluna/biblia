import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import {
  getPasswordResetToken,
  deletePasswordResetToken,
  setUserPassword,
} from "@/lib/queries/password-reset";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();

  if (!token || !password || typeof password !== "string") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  const resetToken = getPasswordResetToken(token);
  if (!resetToken) {
    return NextResponse.json({ error: "Enlace inválido o ya utilizado" }, { status: 400 });
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    deletePasswordResetToken(token);
    return NextResponse.json({ error: "El enlace ha expirado" }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);
  setUserPassword(resetToken.userId, passwordHash);
  deletePasswordResetToken(token);

  return NextResponse.json({ success: true });
}
