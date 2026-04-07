import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getDb } from "./db";
import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";

// Custom SQLite adapter for better-sqlite3 (JWT strategy — no sessions table needed)
function SqliteAdapter(): Adapter {
  const db = getDb();

  return {
    createUser(user) {
      const id = crypto.randomUUID();
      db.prepare(
        `INSERT INTO users (id, name, email, email_verified, image)
         VALUES (?, ?, ?, ?, ?)`
      ).run(id, user.name ?? null, user.email, user.emailVerified?.toISOString() ?? null, user.image ?? null);
      return { ...user, id, emailVerified: user.emailVerified ?? null } as AdapterUser;
    },

    getUser(id) {
      const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as Record<string, unknown> | undefined;
      if (!row) return null;
      return mapUser(row);
    },

    getUserByEmail(email) {
      const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as Record<string, unknown> | undefined;
      if (!row) return null;
      return mapUser(row);
    },

    getUserByAccount({ provider, providerAccountId }) {
      const row = db.prepare(
        `SELECT u.* FROM users u
         JOIN accounts a ON u.id = a.user_id
         WHERE a.provider = ? AND a.provider_account_id = ?`
      ).get(provider, providerAccountId) as Record<string, unknown> | undefined;
      if (!row) return null;
      return mapUser(row);
    },

    updateUser(user) {
      const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id) as Record<string, unknown>;
      db.prepare(
        `UPDATE users SET name = ?, email = ?, email_verified = ?, image = ? WHERE id = ?`
      ).run(
        user.name ?? existing.name,
        user.email ?? existing.email,
        user.emailVerified?.toISOString() ?? existing.email_verified,
        user.image ?? existing.image,
        user.id
      );
      const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id) as Record<string, unknown>;
      return mapUser(updated);
    },

    linkAccount(account) {
      const id = crypto.randomUUID();
      db.prepare(
        `INSERT INTO accounts (id, user_id, type, provider, provider_account_id,
         access_token, refresh_token, expires_at, token_type, scope, id_token)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        account.userId,
        account.type,
        account.provider,
        account.providerAccountId,
        account.access_token ?? null,
        account.refresh_token ?? null,
        account.expires_at ?? null,
        account.token_type ?? null,
        account.scope ?? null,
        account.id_token ?? null
      );
      return account as AdapterAccount;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      db.prepare(
        "DELETE FROM accounts WHERE provider = ? AND provider_account_id = ?"
      ).run(provider, providerAccountId);
    },

    async deleteUser(userId) {
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    },
  };
}

function mapUser(row: Record<string, unknown>): AdapterUser {
  return {
    id: row.id as string,
    name: (row.name as string) ?? null,
    email: row.email as string,
    emailVerified: row.email_verified ? new Date(row.email_verified as string) : null,
    image: (row.image as string) ?? null,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SqliteAdapter(),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const db = getDb();
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as Record<string, unknown> | undefined;
        if (!user || !user.password_hash) return null;

        const isValid = await compare(password, user.password_hash as string);
        if (!isValid) return null;

        return {
          id: user.id as string,
          name: user.name as string,
          email: user.email as string,
          image: user.image as string | null,
        };
      },
    }),
  ],
  allowDangerousEmailAccountLinking: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
