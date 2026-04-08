import { cookies } from "next/headers";

export const DEFAULT_VERSION = "rv1960";
export const VALID_VERSIONS = ["rv1960", "bdj"] as const;
export type BibleVersionId = (typeof VALID_VERSIONS)[number];

export const VERSION_LABELS: Record<BibleVersionId, string> = {
  rv1960: "Reina Valera 1960",
  bdj: "Biblia de Jerusalen",
};

export const VERSION_SHORT: Record<BibleVersionId, string> = {
  rv1960: "R. Valera 1960",
  bdj: "Biblia Jerusalen",
};

/** Read the active Bible version from the cookie (for Server Components). */
export async function getActiveVersion(): Promise<BibleVersionId> {
  const cookieStore = await cookies();
  const version = cookieStore.get("bible_version")?.value;
  if (version && VALID_VERSIONS.includes(version as BibleVersionId)) {
    return version as BibleVersionId;
  }
  return DEFAULT_VERSION;
}

/** Parse version from a NextRequest (for API routes). */
export function getVersionFromParam(
  searchParams: URLSearchParams | null,
  cookieValue?: string
): BibleVersionId {
  const param = searchParams?.get("version");
  if (param && VALID_VERSIONS.includes(param as BibleVersionId)) {
    return param as BibleVersionId;
  }
  if (cookieValue && VALID_VERSIONS.includes(cookieValue as BibleVersionId)) {
    return cookieValue as BibleVersionId;
  }
  return DEFAULT_VERSION;
}
