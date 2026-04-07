import Link from "next/link";
import { auth } from "@/lib/auth";
import { getTopReaders, getUserRank, getTotalParticipants } from "@/lib/queries/ranking";
import { RankingList } from "@/components/RankingList";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const topReaders = getTopReaders(10);
  const totalParticipants = getTotalParticipants();

  let currentUserRank = null;
  if (userId) {
    const isInTop = topReaders.some((r) => r.userId === userId);
    if (!isInTop) {
      currentUserRank = getUserRank(userId);
    } else {
      currentUserRank = topReaders.find((r) => r.userId === userId) ?? null;
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold font-[family-name:var(--font-source-serif)] text-text-primary">
          Ranking de Lectores
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Los 10 que más capítulos han leído
        </p>
      </header>

      {topReaders.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto text-text-secondary opacity-30 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.672c-.99 0-1.932-.223-2.77-.672" />
          </svg>
          <p className="text-text-secondary mb-2">Aún no hay lectores</p>
          <p className="text-sm text-text-secondary mb-6">
            Sé el primero en marcar un capítulo como leído.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors"
          >
            Ir a leer
          </Link>
        </div>
      ) : (
        <RankingList
          topReaders={topReaders}
          currentUserId={userId}
          currentUserRank={currentUserRank}
          totalParticipants={totalParticipants}
        />
      )}
    </div>
  );
}
