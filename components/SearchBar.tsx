"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  initialQuery: string;
}

export function SearchBar({ initialQuery }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar versículo, palabra o frase..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-separator bg-white text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              router.push("/buscar");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}
