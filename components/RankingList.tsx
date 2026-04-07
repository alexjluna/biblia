import type { RankingEntry } from "@/lib/types";

interface RankingListProps {
  topReaders: RankingEntry[];
  currentUserId: string | null;
  currentUserRank: RankingEntry | null;
  totalParticipants: number;
}

const TOTAL_CHAPTERS = 1189;

function getMedalClass(rank: number): string {
  switch (rank) {
    case 1:
      return "w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold shadow-sm";
    case 2:
      return "w-7 h-7 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold shadow-sm";
    case 3:
      return "w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-bold shadow-sm";
    default:
      return "w-7 h-7 flex items-center justify-center text-sm text-text-secondary font-medium";
  }
}

function getMotivationalMessage(chaptersRead: number): string {
  const pct = chaptersRead / TOTAL_CHAPTERS;
  if (pct === 0) return "Cada capítulo es un paso en tu camino con Dios";
  if (pct < 0.25) return "Has comenzado un hermoso recorrido. Sigue adelante.";
  if (pct < 0.5) return `Llevas ${chaptersRead} capítulos. Que cada palabra te acompañe.`;
  if (pct < 0.75) return "Ya has leído más de la mitad de la Biblia.";
  if (pct < 1) return "Estás cerca de completar toda la Biblia.";
  return "Gloria a Dios — has leído toda la Biblia.";
}

function RankingRow({
  entry,
  isCurrentUser,
}: {
  entry: RankingEntry;
  isCurrentUser: boolean;
}) {
  const pct = (entry.chaptersRead / TOTAL_CHAPTERS) * 100;
  const initials = entry.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        isCurrentUser ? "bg-accent/5" : ""
      }`}
    >
      <div className={getMedalClass(entry.rank)}>{entry.rank}</div>

      {entry.image ? (
        <img src={entry.image} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
          {initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {entry.name}
          {isCurrentUser && (
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded ml-1.5">
              Tú
            </span>
          )}
        </p>
        <div className="w-full h-1 bg-separator rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-accent font-[family-name:var(--font-source-serif)]">
          {entry.chaptersRead}
        </p>
        <p className="text-[10px] text-text-secondary">capítulos</p>
      </div>
    </div>
  );
}

export function RankingList({
  topReaders,
  currentUserId,
  currentUserRank,
  totalParticipants,
}: RankingListProps) {
  const userInTop = topReaders.some((r) => r.userId === currentUserId);

  return (
    <div>
      <div className="bg-white rounded-xl border border-separator divide-y divide-separator/50">
        {topReaders.map((entry) => (
          <RankingRow
            key={entry.userId}
            entry={entry}
            isCurrentUser={entry.userId === currentUserId}
          />
        ))}

        {!userInTop && currentUserRank && (
          <>
            <div className="border-t-2 border-dashed border-separator mx-4" />
            <RankingRow entry={currentUserRank} isCurrentUser={true} />
          </>
        )}
      </div>

      {currentUserRank && (
        <p className="text-xs text-text-secondary text-center mt-3 italic">
          {getMotivationalMessage(currentUserRank.chaptersRead)}
        </p>
      )}

      {totalParticipants > 0 && (
        <p className="text-xs text-text-secondary text-center mt-2">
          {totalParticipants} {totalParticipants === 1 ? "lector participa" : "lectores participan"}
        </p>
      )}
    </div>
  );
}
