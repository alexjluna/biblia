/**
 * Offensive word filter for Spanish content.
 * Case-insensitive, accent-insensitive matching.
 */

const OFFENSIVE_WORDS = [
  "puta", "puto", "mierda", "joder", "coño", "cabron", "cabrón",
  "gilipollas", "hijoputa", "hijosdeputa", "maricón", "maricon",
  "zorra", "pendejo", "pendeja", "chingar", "verga", "culo",
  "maldito", "maldita", "estupido", "estúpido", "imbecil", "imbécil",
  "idiota", "subnormal", "retrasado", "basura", "escoria",
  "hdp", "ctm", "ptm", "stfu", "fuck", "shit", "bitch", "asshole",
  "dick", "pussy", "whore", "bastard", "damn", "crap",
];

/**
 * Normalize text for comparison: lowercase, remove accents.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // strip accent marks
}

/**
 * Check if text contains offensive words.
 * Uses word boundary detection to avoid false positives.
 */
export function containsOffensiveWords(text: string): boolean {
  const normalized = normalize(text);

  for (const word of OFFENSIVE_WORDS) {
    const normalizedWord = normalize(word);
    // Word boundary: check if the word appears as a standalone word
    const regex = new RegExp(`\\b${normalizedWord}\\b`);
    if (regex.test(normalized)) {
      return true;
    }
  }

  return false;
}
