import { searchVerses } from "@/lib/queries/verses";
import { SearchBar } from "@/components/SearchBar";
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
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 mx-auto text-text-secondary/30 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <p className="text-text-secondary">
            Busca por palabra, frase o referencia
          </p>
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
