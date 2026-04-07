"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Favorite } from "@/lib/types";
import type { Collection } from "@/lib/queries/collections";
import { ShareButton } from "./ShareButton";

interface FavoriteCardProps {
  favorite: Favorite;
  collections?: Collection[];
  onAssign?: (collectionId: number) => Promise<void>;
}

export function FavoriteCard({ favorite, collections, onAssign }: FavoriteCardProps) {
  const [removed, setRemoved] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    await fetch(`/api/favorites/${favorite.id}`, { method: "DELETE" });
    setRemoved(true);
    router.refresh();
  };

  const handleAssign = async (colId: number) => {
    if (onAssign) await onAssign(colId);
    setShowCollections(false);
  };

  if (removed) return null;

  const timeAgo = getTimeAgo(favorite.created_at);

  return (
    <div className="bg-white rounded-xl border border-separator p-4">
      <div className="flex items-start justify-between mb-2">
        <Link
          href={`/libro/${favorite.book_number}/${favorite.chapter}`}
          className="text-sm font-semibold text-accent hover:underline"
        >
          {favorite.book_name} {favorite.chapter}:{favorite.verse}
        </Link>
        <div className="flex items-center gap-1">
          {collections && collections.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowCollections(!showCollections)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-text-secondary hover:text-accent transition-colors cursor-pointer hover:scale-110 active:scale-95"
                title="Añadir a colección"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </button>
              {showCollections && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCollections(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-separator shadow-lg z-50 py-1 min-w-[160px]">
                    {collections.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => handleAssign(col.id)}
                        className="w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-accent/5 transition-colors"
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <ShareButton
            text={favorite.text}
            bookName={favorite.book_name}
            chapter={favorite.chapter}
            verse={favorite.verse}
          />
          <button
            onClick={handleRemove}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-text-secondary hover:text-favorite transition-colors cursor-pointer hover:scale-110 active:scale-95"
            title="Eliminar de favoritos"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
      <p className="font-[family-name:var(--font-source-serif)] text-base leading-relaxed text-text-primary">
        &ldquo;{favorite.text}&rdquo;
      </p>
      <p className="text-xs text-text-secondary mt-2">{timeAgo}</p>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr + "Z");
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Justo ahora";
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? "s" : ""}`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? "s" : ""}`;

  const diffWeeks = Math.floor(diffDays / 7);
  return `Hace ${diffWeeks} semana${diffWeeks !== 1 ? "s" : ""}`;
}
