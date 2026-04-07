import { getDb } from "./db";

/**
 * Check if a user can post UGC (discussions, messages).
 * Google OAuth users are always allowed (their email is verified by Google).
 * Email+password users must verify their email first.
 */
export function canPostContent(userId: string): boolean {
  const db = getDb();

  // Check if user has a Google OAuth account — if so, always allowed
  const oauthAccount = db
    .prepare("SELECT 1 FROM accounts WHERE user_id = ? AND provider = 'google'")
    .get(userId);
  if (oauthAccount) return true;

  // Otherwise, check email_verified
  const user = db
    .prepare("SELECT email_verified FROM users WHERE id = ?")
    .get(userId) as { email_verified: string | null } | undefined;

  return !!user?.email_verified;
}
