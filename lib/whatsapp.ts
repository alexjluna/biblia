export function buildShareText(
  text: string,
  bookName: string,
  chapter: number,
  verse: number
): string {
  return `"${text}"\n— ${bookName} ${chapter}:${verse} (RV 1909)`;
}

export function buildWhatsAppUrl(
  text: string,
  bookName: string,
  chapter: number,
  verse: number
): string {
  const message = buildShareText(text, bookName, chapter, verse);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
