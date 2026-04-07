import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  getVerificationToken,
  deleteVerificationToken,
} from "@/lib/queries/verification";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=TokenInvalido", request.url));
  }

  const verification = getVerificationToken(token);

  if (!verification) {
    return NextResponse.redirect(new URL("/login?error=TokenInvalido", request.url));
  }

  // Check expiration
  if (new Date(verification.expiresAt) < new Date()) {
    deleteVerificationToken(token);
    return NextResponse.redirect(new URL("/login?error=TokenExpirado", request.url));
  }

  // Mark email as verified
  getDb()
    .prepare("UPDATE users SET email_verified = datetime('now') WHERE id = ?")
    .run(verification.userId);

  // Clean up token
  deleteVerificationToken(token);

  return NextResponse.redirect(new URL("/login?verified=1", request.url));
}
