import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Biblia <onboarding@resend.dev>",
    to: email,
    subject: "Confirma tu cuenta — Biblia RV 1960",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; color: #1C1917; margin-bottom: 8px;">Biblia</h1>
        <p style="font-size: 13px; color: #78716c; margin-bottom: 24px;">Reina Valera 1960</p>
        <p style="font-size: 15px; color: #1C1917; line-height: 1.6;">
          Confirma tu dirección de correo electrónico para activar tu cuenta.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; background-color: #7C5C3E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; margin: 24px 0;">
          Confirmar email
        </a>
        <p style="font-size: 13px; color: #78716c; line-height: 1.6; margin-top: 24px;">
          Si no creaste esta cuenta, ignora este mensaje.
        </p>
        <p style="font-size: 12px; color: #a8a29e; margin-top: 32px;">
          Este enlace expira en 24 horas.
        </p>
      </div>
    `,
  });
}
