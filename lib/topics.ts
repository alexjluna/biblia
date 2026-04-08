import { getDb } from "./db";
import temasData from "@/data/temas.json";

export interface Topic {
  slug: string;
  name: string;
  icon: string;
  verseCount: number;
}

export interface TopicVerse {
  id: number;
  bookNumber: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export function getAllTopics(): Topic[] {
  return temasData.map((t) => ({
    slug: t.slug,
    name: t.name,
    icon: t.icon,
    verseCount: t.verses.length,
  }));
}

export function getTopicBySlug(slug: string): { name: string; icon: string } | null {
  const topic = temasData.find((t) => t.slug === slug);
  return topic ? { name: topic.name, icon: topic.icon } : null;
}

export function getTopicVerses(slug: string, versionId: string): TopicVerse[] {
  const topic = temasData.find((t) => t.slug === slug);
  if (!topic) return [];

  const db = getDb();
  const verses: TopicVerse[] = [];

  for (const [bookNumber, chapter, verse] of topic.verses) {
    const row = db
      .prepare(
        `SELECT v.id, v.book_number as bookNumber, b.name as bookName,
                v.chapter, v.verse, v.text
         FROM verses v
         JOIN books b ON v.book_number = b.number AND v.version_id = b.version_id
         WHERE v.version_id = ? AND v.book_number = ? AND v.chapter = ? AND v.verse = ?`
      )
      .get(versionId, bookNumber, chapter, verse) as TopicVerse | undefined;

    if (row) verses.push(row);
  }

  return verses;
}
