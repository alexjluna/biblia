import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const passwordHash = await hash(password, 12);

  db.prepare(
    `INSERT INTO users (id, name, email, password_hash)
     VALUES (?, ?, ?, ?)`
  ).run(id, name || null, email, passwordHash);

  return NextResponse.json({ id }, { status: 201 });
}
