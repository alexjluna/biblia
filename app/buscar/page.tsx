import { searchVerses } from "@/lib/queries/verses";
import { SearchBar } from "@/components/SearchBar";
import { getAllTopics } from "@/lib/topics";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const results = query.length >= 2 ? searchVerses(query) : [];

  // Group results by book
  const grouped = new Map<string, typeof results>();
  for (const r of results) {
    const list = grouped.get(r.book_name) || [];
    list.push(r);
    grouped.set(r.book_name, list);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold font-[family-name:var(--font-source-serif)] text-text-primary">
          Buscar
        </h1>
      </header>

      <SearchBar initialQuery={query} />

      {query && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">
            No se encontraron resultados para &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Intenta con otra palabra o frase
          </p>
        </div>
      )}

      {query && results.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-text-secondary mb-4">
            {results.length} resultado{results.length !== 1 ? "s" : ""} para
            &ldquo;{query}&rdquo;
          </p>
          <div className="space-y-6">
            {[...grouped.entries()].map(([bookName, verses]) => (
              <div key={bookName}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  {bookName}
                </h3>
                <div className="space-y-2">
                  {verses.map((v) => (
                    <Link
                      key={v.id}
                      href={`/libro/${v.book_number}/${v.chapter}`}
                      className="block bg-white rounded-lg border border-separator p-3 hover:border-accent transition-colors"
                    >
                      <span className="text-sm font-semibold text-accent">
                        {v.book_name} {v.chapter}:{v.verse}
                      </span>
                      <p className="text-sm text-text-primary mt-1 leading-relaxed font-[family-name:var(--font-source-serif)]">
                        {highlightText(v.text, query)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!query && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">
            Versículos por tema
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {getAllTopics().map((topic) => (
              <Link
                key={topic.slug}
                href={`/temas/${topic.slug}`}
                className="flex items-center gap-2 bg-white rounded-xl border border-separator px-3 py-3 hover:border-accent transition-colors text-sm"
              >
                <span className="text-lg">{topic.icon}</span>
                <span className="text-text-primary font-medium truncate">{topic.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function highlightText(text: string, query: string): React.ReactNode {
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-accent/20 text-text-primary rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
