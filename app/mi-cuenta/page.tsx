import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserStats, getUserActivity } from "@/lib/queries/users";
import { getUserRank, getTotalParticipants, getTotalChapters } from "@/lib/queries/ranking";
import { getNotifications, markAllRead } from "@/lib/queries/notifications";
import { getDb } from "@/lib/db";
import { MiCuentaClient } from "@/components/MiCuentaClient";
import { getActiveVersion } from "@/lib/version";

export const dynamic = "force-dynamic";

export default async function MiCuentaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const versionId = await getActiveVersion();

  const user = getDb()
    .prepare("SELECT id, name, email, image, password_hash, created_at FROM users WHERE id = ?")
    .get(session.user.id) as {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    password_hash: string | null;
    created_at: string;
  };

  const stats = getUserStats(session.user.id);
  const activity = getUserActivity(session.user.id, 15);
  const notifications = getNotifications(session.user.id, 20);
  const userRank = getUserRank(session.user.id, versionId);
  const totalParticipants = getTotalParticipants(versionId);
  const totalChapters = getTotalChapters(versionId);

  const showInRanking = (getDb()
    .prepare("SELECT show_in_ranking FROM users WHERE id = ?")
    .get(session.user.id) as { show_in_ranking: number })?.show_in_ranking === 1;

  // Mark notifications as read on page load
  markAllRead(session.user.id);

  return (
    <MiCuentaClient
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        hasPassword: !!user.password_hash,
        createdAt: user.created_at,
      }}
      stats={stats}
      activity={activity}
      notifications={notifications}
      ranking={userRank ? { userRank: userRank.rank, totalParticipants } : null}
      showInRanking={showInRanking}
      totalChapters={totalChapters}
    />
  );
}
