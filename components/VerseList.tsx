"use client";

import { useState, useEffect, useRef } from "react";
import type { Verse, DiscussionSummary } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";
import { ShareButton } from "./ShareButton";
import { DiscussButton } from "./DiscussButton";
import { DiscussionSheet } from "./DiscussionSheet";

interface VerseListProps {
  verses: Verse[];
  bookName: string;
  favoriteVerseIds: number[];
  savedVerse?: number;
  scrollToVerse?: number;
  isLoggedIn?: boolean;
  discussionSummaries?: Record<number, DiscussionSummary>;
}

export function VerseList({
  verses,
  bookName,
  favoriteVerseIds,
  savedVerse,
  scrollToVerse,
  isLoggedIn = false,
  discussionSummaries = {},
}: VerseListProps) {
  const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
  const [favIds, setFavIds] = useState<Set<number>>(
    new Set(favoriteVerseIds)
  );
  const [bookmarkedVerse, setBookmarkedVerse] = useState<number | null>(
    savedVerse ?? null
  );
  const [bookmarkSaving, setBookmarkSaving] = useState(false);
  const [discussionVerseId, setDiscussionVerseId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLSpanElement>(null);
  const scrollToRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll to saved verse or scrollToVerse on mount
  useEffect(() => {
    const targetRef = scrollToVerse ? scrollToRef : scrollRef;
    const hasTarget = scrollToVerse || (savedVerse && savedVerse > 1);
    if (hasTarget && targetRef.current) {
      setTimeout(() => {
        targetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [savedVerse, scrollToVerse]);

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

  const handleBookmark = async (verse: Verse) => {
    if (bookmarkSaving) return;
    setBookmarkSaving(true);

    try {
      await fetch("/api/reading-position", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookNumber: verse.book_number,
          chapter: verse.chapter,
          verse: verse.verse,
        }),
      });
      setBookmarkedVerse(verse.verse);
      setSelectedVerseId(null);
    } catch {
      // silently fail
    } finally {
      setBookmarkSaving(false);
    }
  };

  return (
    <>
      <article className="font-[family-name:var(--font-source-serif)] text-lg leading-[1.8] text-text-primary">
        {verses.map((v) => {
          const isSelected = selectedVerseId === v.id;
          const isFav = favIds.has(v.id);
          const isBookmarked = bookmarkedVerse === v.verse;
          const discussion = discussionSummaries[v.id];
          const hasDiscussion = isLoggedIn && !!discussion;

          return (
            <span
              key={v.id}
              className="relative inline"
              ref={
                scrollToVerse === v.verse
                  ? scrollToRef
                  : savedVerse === v.verse
                    ? scrollRef
                    : undefined
              }
            >
              <span
                onClick={() =>
                  setSelectedVerseId(isSelected ? null : v.id)
                }
                className={`cursor-pointer rounded transition-colors ${
                  isBookmarked
                    ? "bg-accent/15 border-b-2 border-accent/40"
                    : isSelected
                      ? "bg-accent/10"
                      : hasDiscussion
                        ? "bg-discussion/10 hover:bg-discussion/15"
                        : "hover:bg-accent/5"
                }`}
              >
                {isFav && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-favorite align-super mr-0.5" />
                )}
                {hasDiscussion && !isFav && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-discussion align-super mr-0.5" />
                )}
                <sup className="text-xs font-sans font-bold text-verse-num mr-1">
                  {v.verse}
                </sup>
                {v.text}{" "}
              </span>

              {isBookmarked && !isSelected && (
                <span className="inline-flex items-center align-middle ml-0.5">
                  <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                </span>
              )}

              {((isSelected && isLoggedIn) || (hasDiscussion && isLoggedIn)) && (
                <span className="relative inline-flex items-center gap-1.5 align-middle ml-1">
                  {/* 1. Favorito */}
                  <FavoriteButton
                    verseId={v.id}
                    initialIsFavorite={isFav}
                    onToggle={(isFav) => handleToggleFavorite(v.id, isFav)}
                  />
                  {/* 2. Dejé aquí */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark(v);
                    }}
                    disabled={bookmarkSaving}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-110 active:scale-95 ${
                      isBookmarked
                        ? "text-accent scale-110"
                        : "text-text-secondary hover:text-accent"
                    } ${bookmarkSaving ? "opacity-50" : ""}`}
                    title="Dejé aquí"
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isBookmarked ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                      />
                    </svg>
                  </button>
                  {/* 3. Discutir */}
                  <DiscussButton
                    messageCount={discussion?.messageCount ?? 0}
                    onOpen={() => {
                      setDiscussionVerseId(v.id);
                      setSelectedVerseId(null);
                    }}
                  />
                  {/* 4. Compartir */}
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

      {discussionVerseId !== null && (
        <DiscussionSheet
          verseId={discussionVerseId}
          discussionId={discussionSummaries[discussionVerseId]?.discussionId ?? null}
          bookName={bookName}
          verse={verses.find((v) => v.id === discussionVerseId)!}
          onClose={() => setDiscussionVerseId(null)}
        />
      )}
    </>
  );
}
