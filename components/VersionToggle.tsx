"use client";

import { useBibleVersion } from "./BibleVersionProvider";

export function VersionToggle() {
  const { version, setVersion } = useBibleVersion();

  return (
    <div className="inline-flex items-center bg-separator/50 rounded-full p-0.5 text-xs">
      <button
        onClick={() => setVersion("rv1960")}
        className={`px-3 py-1 rounded-full font-medium transition-all ${
          version === "rv1960"
            ? "bg-accent text-white shadow-sm"
            : "text-text-secondary hover:text-text-primary"
        }`}
      >
        R. Valera 1960
      </button>
      <button
        onClick={() => setVersion("bdj")}
        className={`px-3 py-1 rounded-full font-medium transition-all ${
          version === "bdj"
            ? "bg-accent text-white shadow-sm"
            : "text-text-secondary hover:text-text-primary"
        }`}
      >
        Biblia Jerusalen
      </button>
    </div>
  );
}
