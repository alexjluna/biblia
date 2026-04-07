import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getDb } from "@/lib/db";
import { createVerificationToken } from "@/lib/queries/verification";
import { sendVerificationEmail } from "@/lib/email";

// Simple in-memory rate limiter: max 3 registrations per IP per hour
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }

  entry.count++;
  return entry.count > 3;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429 }
    );
  }

  const { name, email, password, website } = await request.json();

  // Honeypot: if "website" field is filled, it's a bot
  if (website) {
    // Pretend success to confuse the bot
    return NextResponse.json({ id: "ok" }, { status: 201 });
  }

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare("SELECT id, email_verified FROM users WHERE email = ?").get(email) as
    | { id: string; email_verified: string | null }
    | undefined;

  if (existing) {
    if (existing.email_verified) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 });
    }
    // User exists but not verified: resend verification email
    const token = createVerificationToken(existing.id, email);
    try {
      await sendVerificationEmail(email, token);
    } catch {
      return NextResponse.json(
        { error: "Error al enviar el email de verificación" },
        { status: 500 }
      );
    }
    return NextResponse.json({ needsVerification: true }, { status: 201 });
  }

  const id = crypto.randomUUID();
  const passwordHash = await hash(password, 12);

  db.prepare(
    `INSERT INTO users (id, name, email, password_hash)
     VALUES (?, ?, ?, ?)`
  ).run(id, name || null, email, passwordHash);

  // Create verification token and send email
  const token = createVerificationToken(id, email);
  try {
    await sendVerificationEmail(email, token);
  } catch {
    return NextResponse.json(
      { error: "Cuenta creada pero error al enviar email de verificación. Intenta de nuevo." },
      { status: 500 }
    );
  }

  return NextResponse.json({ needsVerification: true }, { status: 201 });
}
