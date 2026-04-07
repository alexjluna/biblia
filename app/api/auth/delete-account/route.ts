import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { confirm } = await request.json();
  if (confirm !== "ELIMINAR") {
    return NextResponse.json(
      { error: "Debes confirmar escribiendo ELIMINAR" },
      { status: 400 }
    );
  }

  // CASCADE will handle favorites, reading_progress, reading_position,
  // discussions, discussion_messages, discussion_likes, discussion_reads, notifications
  getDb().prepare("DELETE FROM users WHERE id = ?").run(session.user.id);

  return NextResponse.json({ success: true });
}
