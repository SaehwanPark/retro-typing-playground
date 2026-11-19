import { passageLineWidth, wrapText } from "../domain/textLayout";
import { splitCharacters } from "../domain/typing";
import type { Language, NonEmpty } from "./lessons";
import rawKorean from "./assets/passages.ko.json" with { type: "json" };
import rawEnglish from "./assets/passages.en.json" with { type: "json" };

export type PassageLength = "short" | "long";
export type PassageGenre = "literature" | "nonfiction" | "technology" | "life" | "subculture";

export type PassageActivity = {
  id: string;
  kind: "passage";
  label: string;
  language: Language;
  length: PassageLength;
  genre: PassageGenre;
  source: "original" | "public-domain";
  text: string;
  characterCount: number;
  lines: NonEmpty<string>;
};

type RawPassage = {
  id: unknown;
  title: unknown;
  language: unknown;
  length: unknown;
  genre: unknown;
  source: unknown;
  paragraphs: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLanguage(value: unknown): value is Language {
  return value === "ko" || value === "en";
}

function isLength(value: unknown): value is PassageLength {
  return value === "short" || value === "long";
}

function isGenre(value: unknown): value is PassageGenre {
  return value === "literature" || value === "nonfiction" ||
    value === "technology" || value === "life" || value === "subculture";
}

function isSource(value: unknown): value is PassageActivity["source"] {
  return value === "original" || value === "public-domain";
}

function readPassage(value: unknown): PassageActivity | null {
  if (!isObject(value)) return null;
  const raw = value as RawPassage;
  if (typeof raw.id !== "string" || !raw.id.trim()) return null;
  if (typeof raw.title !== "string" || !raw.title.trim()) return null;
  if (!isLanguage(raw.language) || !isLength(raw.length) || !isGenre(raw.genre) || !isSource(raw.source)) return null;
  if (!Array.isArray(raw.paragraphs)) return null;

  const text = raw.paragraphs
    .filter((paragraph): paragraph is string => typeof paragraph === "string")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join("\n\n");
  const lines = wrapText(text, passageLineWidth[raw.language]);
  const [first, ...rest] = lines;
  if (!first) return null;

  return {
    id: raw.id,
    kind: "passage",
    label: raw.title,
    language: raw.language,
    length: raw.length,
    genre: raw.genre,
    source: raw.source,
    text,
    characterCount: splitCharacters(text).length,
    lines: [first, ...rest],
  };
}

const sources: unknown[] = [...rawKorean, ...rawEnglish];

export const passageActivities: readonly PassageActivity[] = sources
  .map(readPassage)
  .filter((passage): passage is PassageActivity => passage !== null);

export function passagesFor(language: Language, length: PassageLength): PassageActivity[] {
  return passageActivities.filter((passage) => passage.language === language && passage.length === length);
}

export const shortPassageEntry = { id: "short-library", label: "짧은 글", kind: "short-library" } as const;
export const longPassageEntry = { id: "long-library", label: "긴 글", kind: "long-library" } as const;
