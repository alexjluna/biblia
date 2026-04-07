import { containsOffensiveWords } from "./moderation";

/**
 * Sanitize and validate user-generated text content.
 * Strips HTML, control characters, zero-width chars.
 * Checks for offensive words.
 */
export function validateContent(
  content: unknown,
  maxLength: number = 2000
): { valid: true; sanitized: string } | { valid: false; error: string } {
  if (typeof content !== "string") {
    return { valid: false, error: "Contenido requerido" };
  }

  let cleaned = content
    // Strip HTML tags
    .replace(/<[^>]*>/g, "")
    // Normalize Unicode
    .normalize("NFC")
    // Strip control chars except newline (U+000A)
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
    // Strip zero-width and formatting chars
    .replace(/[\u200B\u200C\u200D\u200E\u200F\uFEFF\u202A-\u202E\u2066-\u2069]/g, "")
    .trim();

  if (cleaned.length === 0) {
    return { valid: false, error: "El mensaje no puede estar vacío" };
  }

  if (cleaned.length > maxLength) {
    return {
      valid: false,
      error: `El mensaje es demasiado largo (máximo ${maxLength} caracteres)`,
    };
  }

  const offensive = containsOffensiveWords(cleaned);
  if (offensive) {
    return {
      valid: false,
      error: "Tu mensaje contiene lenguaje inapropiado",
    };
  }

  return { valid: true, sanitized: cleaned };
}
