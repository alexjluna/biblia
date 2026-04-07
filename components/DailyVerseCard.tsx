import Link from "next/link";
import type { DailyVerse } from "@/lib/daily-verse";

interface DailyVerseCardProps {
  verse: DailyVerse;
}

export function DailyVerseCard({ verse }: DailyVerseCardProps) {
  return (
    <Link
      href={`/libro/${verse.bookNumber}/${verse.chapter}`}
      className="block bg-accent/5 border border-accent/15 rounded-xl p-4 mb-4 hover:border-accent/30 transition-colors group"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-accent/70 mb-2">
        Versículo del día
      </p>
      <p className="text-base leading-relaxed text-text-primary font-[family-name:var(--font-source-serif)] italic line-clamp-3">
        &ldquo;{verse.text}&rdquo;
      </p>
      <p className="text-sm text-accent font-medium mt-2">
        {verse.bookName} {verse.chapter}:{verse.verse}
      </p>
    </Link>
  );
}
