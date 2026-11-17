// src/lib/cleanText.ts
export function stripMarkdownSyntax(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s+/gm, "")          // Removes ### headings
    .replace(/\*\*(.*?)\*\*/g, "$1")      // Removes **bold** markers
    .replace(/\*(.*?)\*/g, "$1")          // Removes *italic* markers
    .replace(/^\s*[-*]\s+\[\s*\]\s*/gm, "☐ ") // Converts * [ ] into clean checkbox symbol
    .replace(/^\s*[-*]\s+/gm, "• ")       // Converts markdown bullets to clean bullets
    .trim();
}