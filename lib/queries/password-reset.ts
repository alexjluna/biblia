import { getDb } from "../db";

export function createPasswordResetToken(userId: string): string {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h

  // Delete any existing tokens for this user
  getDb()
    .prepare("DELETE FROM password_reset_tokens WHERE user_id = ?")
    .run(userId);

  getDb()
    .prepare(
      "INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)"
    )
    .run(token, userId, expiresAt);

  return token;
}

export function getPasswordResetToken(token: string): {
  userId: string;
  expiresAt: string;
} | null {
  const row = getDb()
    .prepare("SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?")
    .get(token) as { user_id: string; expires_at: string } | undefined;

  if (!row) return null;
  return { userId: row.user_id, expiresAt: row.expires_at };
}

export function deletePasswordResetToken(token: string): void {
  getDb().prepare("DELETE FROM password_reset_tokens WHERE token = ?").run(token);
}

export function setUserPassword(userId: string, passwordHash: string): void {
  getDb()
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .run(passwordHash, userId);
}
