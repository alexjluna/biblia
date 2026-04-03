import Link from "next/link";
import { getFavorites } from "@/lib/queries/favorites";
import { FavoriteCard } from "@/components/FavoriteCard";

export const dynamic = "force-dynamic";

export default function FavoritosPage() {
  const favorites = getFavorites();

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold font-[family-name:var(--font-source-serif)] text-text-primary">
          Favoritos
        </h1>
        {favorites.length > 0 && (
          <p className="text-sm text-text-secondary mt-1">
            {favorites.length} versículo{favorites.length !== 1 ? "s" : ""}{" "}
            guardado{favorites.length !== 1 ? "s" : ""}
          </p>
        )}
      </header>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-30">
            <svg
              className="w-16 h-16 mx-auto text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
          <p className="text-text-secondary mb-2">
            Aún no tienes versículos guardados
          </p>
          <p className="text-sm text-text-secondary mb-6">
            Toca cualquier versículo mientras lees para guardarlo aquí
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
          {favorites.map((fav) => (
            <FavoriteCard key={fav.id} favorite={fav} />
          ))}
        </div>
      )}
    </div>
  );
}
