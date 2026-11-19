import { splitCharacters } from "./typing";

export const passageLinesPerPage = 5;

// Display widths are expressed in graphemes so a page keeps the same shape across reloads.
// The view still allows the browser to wrap a line as a fallback on very narrow screens.
export const passageLineWidth = { ko: 24, en: 44 } as const;

function trimEnd(line: readonly string[]): string[] {
  let end = line.length;
  while (end > 0 && line[end - 1] === " ") end -= 1;
  return line.slice(0, end);
}

/**
 * Wraps paragraphs into display lines, preferring the last space inside the width.
 * A break consumes the space at the boundary because it becomes a visual line break.
 */
export function wrapText(text: string, maxCharacters: number): string[] {
  const limit = Math.max(1, Math.floor(maxCharacters));
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .flatMap((paragraph) => {
      const lines: string[] = [];
      let remaining = splitCharacters(paragraph);

      while (remaining.length > limit) {
        const window = remaining.slice(0, limit);
        let breakAt = window.lastIndexOf(" ");
        if (breakAt <= 0) breakAt = limit;
        const line = trimEnd(window.slice(0, breakAt)).join("");
        if (line) lines.push(line);
        remaining = remaining.slice(breakAt === limit ? breakAt : breakAt + 1);
      }

      const last = trimEnd(remaining).join("");
      if (last) lines.push(last);
      return lines;
    });
}

export function passagePages(lines: readonly string[]): string[][] {
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += passageLinesPerPage) {
    pages.push(lines.slice(index, index + passageLinesPerPage));
  }
  return pages;
}
