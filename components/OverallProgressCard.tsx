interface OverallProgressCardProps {
  totalRead: number;
  totalChapters: number;
}

export function OverallProgressCard({
  totalRead,
  totalChapters,
}: OverallProgressCardProps) {
  const pct = totalChapters > 0 ? (totalRead / totalChapters) * 100 : 0;
  const displayPct = Math.round(pct * 10) / 10;

  // SVG circle math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-separator p-6 text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-28 h-28" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-separator)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span className="absolute text-2xl font-bold text-accent font-[family-name:var(--font-source-serif)]">
          {displayPct}%
        </span>
      </div>
      <p className="text-sm text-text-secondary mt-3">
        {totalRead} de {totalChapters} capítulos leídos
      </p>
    </div>
  );
}
