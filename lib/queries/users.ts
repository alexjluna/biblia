import { getDb } from "../db";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  email_verified: string | null;
  image: string | null;
  role: string;
  created_at: string;
  has_password: boolean;
  favorites_count: number;
  chapters_read: number;
}

export function getAllUsers(): AdminUser[] {
  return getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.email_verified, u.image, u.role, u.created_at,
              CASE WHEN u.password_hash IS NOT NULL THEN 1 ELSE 0 END as has_password,
              (SELECT COUNT(*) FROM favorites f WHERE f.user_id = u.id) as favorites_count,
              (SELECT COUNT(*) FROM reading_progress rp WHERE rp.user_id = u.id) as chapters_read
       FROM users u
       ORDER BY u.created_at DESC`
    )
    .all() as AdminUser[];
}

export function getUserById(id: string): AdminUser | null {
  const row = getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.email_verified, u.image, u.role, u.created_at,
              CASE WHEN u.password_hash IS NOT NULL THEN 1 ELSE 0 END as has_password,
              (SELECT COUNT(*) FROM favorites f WHERE f.user_id = u.id) as favorites_count,
              (SELECT COUNT(*) FROM reading_progress rp WHERE rp.user_id = u.id) as chapters_read
       FROM users u
       WHERE u.id = ?`
    )
    .get(id) as AdminUser | undefined;
  return row ?? null;
}

export function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: string }
): boolean {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.email !== undefined) {
    fields.push("email = ?");
    values.push(data.email);
  }
  if (data.role !== undefined) {
    fields.push("role = ?");
    values.push(data.role);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const result = getDb()
    .prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);
  return result.changes > 0;
}

export function deleteUser(id: string): boolean {
  const result = getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
  return result.changes > 0;
}

export function verifyUserEmail(id: string): boolean {
  const result = getDb()
    .prepare("UPDATE users SET email_verified = datetime('now') WHERE id = ?")
    .run(id);
  return result.changes > 0;
}

export function isAdmin(userId: string): boolean {
  const row = getDb()
    .prepare("SELECT role FROM users WHERE id = ?")
    .get(userId) as { role: string } | undefined;
  return row?.role === "admin";
}
