"use client";

import { useState } from "react";
import type { Favorite } from "@/lib/types";
import type { Collection } from "@/lib/queries/collections";
import { FavoriteCard } from "./FavoriteCard";

interface Props {
  favorites: Favorite[];
  collections: Collection[];
  collectionFavs: Record<number, number[]>;
}

export function FavoritosClient({ favorites, collections: initialCollections, collectionFavs }: Props) {
  const [activeCollection, setActiveCollection] = useState<number | null>(null);
  const [collections, setCollections] = useState(initialCollections);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const filteredFavorites = activeCollection
    ? favorites.filter((f) => collectionFavs[activeCollection]?.includes(f.id))
    : favorites;

  const handleCreate = async () => {
    if (!newName.trim() || creating) return;
    setCreating(true);
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setCollections((prev) => [...prev, { id: data.id, name: newName.trim(), verseCount: 0, createdAt: new Date().toISOString() }]);
      setNewName("");
      setShowCreate(false);
    }
    setCreating(false);
  };

  return (
    <div>
      {/* Collection pills */}
      {(collections.length > 0 || showCreate) && (
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <button
              onClick={() => setActiveCollection(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCollection === null
                  ? "bg-accent text-white"
                  : "bg-white border border-separator text-text-secondary hover:border-accent"
              }`}
            >
              Todos
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => setActiveCollection(activeCollection === col.id ? null : col.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCollection === col.id
                    ? "bg-accent text-white"
                    : "bg-white border border-separator text-text-secondary hover:border-accent"
                }`}
              >
                {col.name} ({col.verseCount})
              </button>
            ))}
            <button
              onClick={() => setShowCreate(true)}
              className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-separator text-text-secondary hover:border-accent hover:text-accent flex items-center justify-center transition-colors"
              title="Nueva colección"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>

          {showCreate && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre de la colección..."
                maxLength={100}
                className="flex-1 px-3 py-2 rounded-lg border border-separator text-sm focus:outline-none focus:border-accent"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="px-3 py-2 rounded-lg bg-accent text-white text-xs font-medium disabled:opacity-50"
              >
                Crear
              </button>
              <button
                onClick={() => { setShowCreate(false); setNewName(""); }}
                className="px-3 py-2 rounded-lg border border-separator text-xs text-text-secondary"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Favorites list */}
      <div className="space-y-3">
        {filteredFavorites.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            No hay versículos en esta colección
          </p>
        ) : (
          filteredFavorites.map((fav) => (
            <FavoriteCard
              key={fav.id}
              favorite={fav}
              collections={collections}
              onAssign={async (collectionId) => {
                await fetch(`/api/collections/${collectionId}/verses`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ favoriteId: fav.id }),
                });
              }}
            />
          ))
        )}
      </div>

      {/* Create first collection prompt */}
      {collections.length === 0 && favorites.length > 2 && !showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full mt-4 py-3 rounded-xl border border-dashed border-accent/30 text-sm text-accent hover:bg-accent/5 transition-colors"
        >
          + Crear una colección para organizar tus favoritos
        </button>
      )}
    </div>
  );
}
