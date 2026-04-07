import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserNotes } from "@/lib/queries/notes";

export const dynamic = "force-dynamic";

export default async function MisNotasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notes = getUserNotes(session.user.id, 50);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-6">
        <Link href="/mi-cuenta" className="text-sm text-accent hover:underline">
          &larr; Mi cuenta
        </Link>
        <h1 className="text-2xl font-semibold mt-2 font-[family-name:var(--font-source-serif)] text-text-primary">
          Mis Notas
        </h1>
        {notes.length > 0 && (
          <p className="text-sm text-text-secondary mt-1">
            {notes.length} nota{notes.length !== 1 ? "s" : ""}
          </p>
        )}
      </header>

      {notes.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto text-text-secondary opacity-30 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
          <p className="text-text-secondary mb-2">Aún no tienes notas</p>
          <p className="text-sm text-text-secondary mb-6">
            Toca un versículo mientras lees y escribe una nota personal.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors"
          >
            Ir a leer
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/libro/${note.bookNumber}/${note.chapter}?verse=${note.verse}`}
              className="block bg-white rounded-xl border border-separator p-4 hover:border-accent transition-colors"
            >
              <p className="text-sm font-medium text-accent font-[family-name:var(--font-source-serif)]">
                {note.bookName} {note.chapter}:{note.verse}
              </p>
              <p className="text-xs text-text-secondary mt-1 line-clamp-1 italic font-[family-name:var(--font-source-serif)]">
                &ldquo;{note.verseText}&rdquo;
              </p>
              <p className="text-sm text-text-primary mt-2 line-clamp-2 whitespace-pre-wrap">
                {note.content}
              </p>
              <p className="text-[10px] text-text-secondary mt-2">
                {new Date(note.updatedAt + "Z").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
