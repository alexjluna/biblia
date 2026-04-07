import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/queries/password-reset";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const user = getDb()
    .prepare("SELECT id, name FROM users WHERE email = ? AND password_hash IS NOT NULL")
    .get(email) as { id: string; name: string | null } | undefined;

  // Always return success to avoid email enumeration
  if (!user) {
    return NextResponse.json({ success: true });
  }

  const token = createPasswordResetToken(user.id);
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Biblia <onboarding@resend.dev>",
      to: email,
      subject: "Restablecer contraseña — Biblia RV 1960",
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="font-size: 24px; color: #1C1917; margin-bottom: 8px;">Biblia</h1>
          <p style="font-size: 13px; color: #78716c; margin-bottom: 24px;">Reina Valera 1960</p>
          <p style="font-size: 15px; color: #1C1917; line-height: 1.6;">
            Hola${user.name ? ` ${user.name}` : ""}, hemos recibido una solicitud para restablecer tu contraseña.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #7C5C3E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; margin: 24px 0;">
            Restablecer contraseña
          </a>
          <p style="font-size: 13px; color: #78716c; line-height: 1.6; margin-top: 24px;">
            Si no solicitaste este cambio, ignora este mensaje. Tu contraseña no cambiará.
          </p>
          <p style="font-size: 12px; color: #a8a29e; margin-top: 32px;">
            Este enlace expira en 1 hora.
          </p>
        </div>
      `,
    });
  } catch {
    // Don't expose email sending errors
  }

  return NextResponse.json({ success: true });
}
