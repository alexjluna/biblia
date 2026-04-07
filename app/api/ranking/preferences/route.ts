import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setShowInRanking } from "@/lib/queries/ranking";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { showInRanking } = await request.json();
  if (typeof showInRanking !== "boolean") {
    return NextResponse.json({ error: "showInRanking (boolean) requerido" }, { status: 400 });
  }

  setShowInRanking(session.user.id, showInRanking);
  return NextResponse.json({ showInRanking });
}
