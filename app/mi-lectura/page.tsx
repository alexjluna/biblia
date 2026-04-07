import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOverallProgress, getReadingPosition } from "@/lib/queries/reading-progress";
import { OverallProgressCard } from "@/components/OverallProgressCard";
import { BookProgressRow } from "@/components/BookProgressRow";

export const dynamic = "force-dynamic";

export default async function MiLecturaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const progress = getOverallProgress(session.user.id);
  const position = getReadingPosition(session.user.id);

  console.log("[mi-lectura] userId:", session.user.id);
  console.log("[mi-lectura] chaptersRead:", progress.chaptersRead);
  console.log("[mi-lectura] position:", JSON.stringify(position));

  const inProgress = progress.bookProgress.filter(
    (b) => b.chaptersRead > 0 && !b.completed
  );
  const completed = progress.bookProgress.filter((b) => b.completed);

  const atProgress = progress.bookProgress
    .filter((b) => b.bookNumber <= 39)
    .reduce((sum, b) => sum + b.chaptersRead, 0);
  const atTotal = progress.bookProgress
    .filter((b) => b.bookNumber <= 39)
    .reduce((sum, b) => sum + b.chaptersCount, 0);
  const ntProgress = progress.bookProgress
    .filter((b) => b.bookNumber >= 40)
    .reduce((sum, b) => sum + b.chaptersRead, 0);
  const ntTotal = progress.bookProgress
    .filter((b) => b.bookNumber >= 40)
    .reduce((sum, b) => sum + b.chaptersCount, 0);

  if (progress.chaptersRead === 0 && !position) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold font-[family-name:var(--font-source-serif)] text-text-primary">
            Mi Lectura
          </h1>
        </header>
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto text-text-secondary opacity-30 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-text-secondary mb-2">Comienza tu lectura</p>
          <p className="text-sm text-text-secondary mb-6">
            Marca capítulos como leídos mientras lees para ver tu progreso aquí.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors"
          >
            Ir a leer
          </Link>
        </div>
      </div>
    );
  }

  const allComplete = progress.chaptersRead === progress.totalChapters;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold font-[family-name:var(--font-source-serif)] text-text-primary">
          Mi Lectura
        </h1>
      </header>

      <OverallProgressCard
        totalRead={progress.chaptersRead}
        totalChapters={progress.totalChapters}
      />

      {position && (
        <Link
          href={`/libro/${position.bookNumber}/${position.chapter}`}
          className="flex items-center gap-3 bg-white rounded-xl border border-separator p-4 mt-4 hover:border-accent transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Dejé la lectura en
            </p>
            <p className="text-base font-semibold text-text-primary font-[family-name:var(--font-source-serif)]">
              {position.bookName} {position.chapter}:{position.verse}
            </p>
          </div>
          <svg
            className="w-5 h-5 text-accent flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      )}

      {allComplete && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mt-4 text-center">
          <p className="text-accent font-semibold font-[family-name:var(--font-source-serif)]">
            Gloria a Dios
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Has completado la lectura de toda la Biblia.
          </p>
        </div>
      )}

      {/* Testament breakdown */}
      <div className="mt-6 space-y-4">
        <TestamentBar label="Antiguo Testamento" read={atProgress} total={atTotal} />
        <TestamentBar label="Nuevo Testamento" read={ntProgress} total={ntTotal} />
      </div>

      {/* Books in progress */}
      {inProgress.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">
            Libros en progreso
          </h2>
          <div className="divide-y divide-separator/50">
            {inProgress.map((b) => (
              <BookProgressRow
                key={b.bookNumber}
                bookNumber={b.bookNumber}
                bookName={b.bookName}
                chaptersRead={b.chaptersRead}
                totalChapters={b.chaptersCount}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed books */}
      {completed.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">
            Libros completados ({completed.length})
          </h2>
          <div className="divide-y divide-separator/50">
            {completed.map((b) => (
              <BookProgressRow
                key={b.bookNumber}
                bookNumber={b.bookNumber}
                bookName={b.bookName}
                chaptersRead={b.chaptersRead}
                totalChapters={b.chaptersCount}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TestamentBar({
  label,
  read,
  total,
}: {
  label: string;
  read: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((read / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-text-primary font-medium">{label}</span>
        <span className="text-text-secondary text-xs">
          {read} / {total} ({pct}%)
        </span>
      </div>
      <div className="w-full h-2 bg-separator rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
