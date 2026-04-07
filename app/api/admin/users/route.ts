import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllUsers, isAdmin } from "@/lib/queries/users";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const users = getAllUsers();
  return NextResponse.json(users);
}
