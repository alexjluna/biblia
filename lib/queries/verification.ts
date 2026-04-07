import { getDb } from "../db";

export function createVerificationToken(userId: string, email: string): string {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

  getDb()
    .prepare(
      `INSERT INTO verification_tokens (token, user_id, email, expires_at)
       VALUES (?, ?, ?, ?)`
    )
    .run(token, userId, email, expiresAt);

  return token;
}

export function getVerificationToken(token: string): {
  userId: string;
  email: string;
  expiresAt: string;
} | null {
  const row = getDb()
    .prepare("SELECT user_id, email, expires_at FROM verification_tokens WHERE token = ?")
    .get(token) as { user_id: string; email: string; expires_at: string } | undefined;

  if (!row) return null;
  return { userId: row.user_id, email: row.email, expiresAt: row.expires_at };
}

export function deleteVerificationToken(token: string): void {
  getDb().prepare("DELETE FROM verification_tokens WHERE token = ?").run(token);
}

export function cleanExpiredTokens(): void {
  getDb()
    .prepare("DELETE FROM verification_tokens WHERE expires_at < datetime('now')")
    .run();
}
