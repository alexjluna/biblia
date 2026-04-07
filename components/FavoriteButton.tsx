"use client";

import { useState } from "react";

interface FavoriteButtonProps {
  verseId: number;
  initialIsFavorite: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({
  verseId,
  initialIsFavorite,
  onToggle,
}: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    const newState = !isFav;

    try {
      if (newState) {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verseId }),
        });
      } else {
        // Get the favorite id first, then delete
        const res = await fetch(`/api/favorites?verseId=${verseId}`);
        const data = await res.json();
        if (data.favoriteId) {
          await fetch(`/api/favorites/${data.favoriteId}`, {
            method: "DELETE",
          });
        }
      }
      setIsFav(newState);
      onToggle?.(newState);
    } catch {
      // Revert on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      disabled={loading}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-110 active:scale-95 ${
        isFav
          ? "text-favorite scale-110"
          : "text-text-secondary hover:text-favorite"
      } ${loading ? "opacity-50" : ""}`}
      title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
    >
      <svg
        className="w-5 h-5"
        fill={isFav ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
