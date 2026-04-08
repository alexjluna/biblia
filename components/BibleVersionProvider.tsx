"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type BibleVersionId = "rv1960" | "bdj";

interface BibleVersionContextValue {
  version: BibleVersionId;
  setVersion: (v: BibleVersionId) => void;
  versionLabel: string;
  versionShort: string;
}

const labels: Record<BibleVersionId, string> = {
  rv1960: "Reina Valera 1960",
  bdj: "Biblia de Jerusalen",
};

const shorts: Record<BibleVersionId, string> = {
  rv1960: "R. Valera 1960",
  bdj: "Biblia Jerusalen",
};

const BibleVersionContext = createContext<BibleVersionContextValue>({
  version: "rv1960",
  setVersion: () => {},
  versionLabel: labels.rv1960,
  versionShort: shorts.rv1960,
});

export function BibleVersionProvider({
  initialVersion,
  children,
}: {
  initialVersion: BibleVersionId;
  children: React.ReactNode;
}) {
  const [version, setVersionState] = useState<BibleVersionId>(initialVersion);
  const router = useRouter();

  const setVersion = useCallback(
    (v: BibleVersionId) => {
      setVersionState(v);
      // Set cookie client-side
      document.cookie = `bible_version=${v};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
      // Also persist to server for logged-in users
      fetch("/api/version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: v }),
      }).catch(() => {});
      // Refresh server components
      router.refresh();
    },
    [router]
  );

  return (
    <BibleVersionContext.Provider
      value={{
        version,
        setVersion,
        versionLabel: labels[version],
        versionShort: shorts[version],
      }}
    >
      {children}
    </BibleVersionContext.Provider>
  );
}

export function useBibleVersion() {
  return useContext(BibleVersionContext);
}
