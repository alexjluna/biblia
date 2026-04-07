import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopicBySlug, getTopicVerses } from "@/lib/topics";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const verses = getTopicVerses(slug);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-6">
        <Link href="/buscar" className="text-sm text-accent hover:underline">
          &larr; Temas
        </Link>
        <h1 className="text-2xl font-semibold mt-2 font-[family-name:var(--font-source-serif)] text-text-primary">
          {topic.icon} {topic.name}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {verses.length} versículos
        </p>
      </header>

      <div className="space-y-4">
        {verses.map((v) => (
          <Link
            key={v.id}
            href={`/libro/${v.bookNumber}/${v.chapter}?verse=${v.verse}`}
            className="block bg-white rounded-xl border border-separator p-4 hover:border-accent transition-colors"
          >
            <p className="font-[family-name:var(--font-source-serif)] text-base leading-relaxed text-text-primary">
              &ldquo;{v.text}&rdquo;
            </p>
            <p className="text-sm text-accent font-medium mt-2">
              {v.bookName} {v.chapter}:{v.verse}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
