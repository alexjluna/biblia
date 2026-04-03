"use client";

import { useState } from "react";
import type { Verse } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";
import { ShareButton } from "./ShareButton";

interface VerseListProps {
  verses: Verse[];
  bookName: string;
  favoriteVerseIds: number[];
}

export function VerseList({
  verses,
  bookName,
  favoriteVerseIds,
}: VerseListProps) {
  const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
  const [favIds, setFavIds] = useState<Set<number>>(
    new Set(favoriteVerseIds)
  );

  const handleToggleFavorite = (verseId: number, isFav: boolean) => {
    setFavIds((prev) => {
      const next = new Set(prev);
      if (isFav) {
        next.add(verseId);
      } else {
        next.delete(verseId);
      }
      return next;
    });
  };

  return (
    <article className="font-[family-name:var(--font-source-serif)] text-lg leading-[1.8] text-text-primary">
      {verses.map((v) => {
        const isSelected = selectedVerseId === v.id;
        const isFav = favIds.has(v.id);

        return (
          <span key={v.id} className="relative inline">
            <span
              onClick={() =>
                setSelectedVerseId(isSelected ? null : v.id)
              }
              className={`cursor-pointer rounded transition-colors ${
                isSelected ? "bg-accent/10" : "hover:bg-accent/5"
              }`}
            >
              {isFav && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-favorite align-super mr-0.5" />
              )}
              <sup className="text-xs font-sans font-bold text-verse-num mr-1">
                {v.verse}
              </sup>
              {v.text}{" "}
            </span>

            {isSelected && (
              <span className="inline-flex items-center gap-1 align-middle ml-1">
                <FavoriteButton
                  verseId={v.id}
                  initialIsFavorite={isFav}
                  onToggle={(isFav) => handleToggleFavorite(v.id, isFav)}
                />
                <ShareButton
                  text={v.text}
                  bookName={bookName}
                  chapter={v.chapter}
                  verse={v.verse}
                />
              </span>
            )}
          </span>
        );
      })}
    </article>
  );
}
