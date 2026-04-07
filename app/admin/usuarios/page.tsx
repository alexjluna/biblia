import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAllUsers, isAdmin } from "@/lib/queries/users";
import { AdminUserList } from "@/components/admin/AdminUserList";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isAdmin(session.user.id)) redirect("/");

  const users = getAllUsers();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <header className="mb-6">
        <Link href="/" className="text-sm text-accent hover:underline">
          &larr; Inicio
        </Link>
        <h1 className="text-2xl font-semibold mt-2 font-[family-name:var(--font-source-serif)] text-text-primary">
          Panel de Administración
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
        </p>
      </header>

      <AdminUserList initialUsers={users} currentUserId={session.user.id} />
    </div>
  );
}
