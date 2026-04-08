export function buildShareText(
  text: string,
  bookName: string,
  chapter: number,
  verse: number,
  versionLabel: string = "RV 1960"
): string {
  return `"${text}"\n— ${bookName} ${chapter}:${verse} (${versionLabel})`;
}

export function buildWhatsAppUrl(
  text: string,
  bookName: string,
  chapter: number,
  verse: number,
  versionLabel: string = "RV 1960"
): string {
  const message = buildShareText(text, bookName, chapter, verse, versionLabel);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
