interface StreakCardProps {
  currentStreak: number;
  weekDays: boolean[]; // Mon-Sun
}

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export function StreakCard({ currentStreak, weekDays }: StreakCardProps) {
  if (currentStreak === 0 && !weekDays.some(Boolean)) {
    return (
      <div className="bg-white rounded-xl border border-separator p-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl opacity-30">🔥</span>
          <div>
            <p className="text-sm text-text-secondary">
              Lee un capítulo hoy para comenzar tu racha
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-separator p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-lg font-bold text-accent font-[family-name:var(--font-source-serif)]">
              {currentStreak} {currentStreak === 1 ? "día" : "días"}
            </p>
            <p className="text-xs text-text-secondary">racha de lectura</p>
          </div>
        </div>

        {/* Week dots */}
        <div className="flex items-center gap-1.5">
          {weekDays.map((read, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium ${
                  read
                    ? "bg-accent text-white"
                    : "bg-separator/50 text-text-secondary"
                }`}
              >
                {DAY_LABELS[i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
