import { passageLineWidth, wrapText } from "../domain/textLayout";
import { splitCharacters } from "../domain/typing";
import type { Language, NonEmpty } from "./lessons";
import rawKorean from "./assets/passages.ko.json" with { type: "json" };
import rawEnglish from "./assets/passages.en.json" with { type: "json" };

export type PassageLength = "short" | "long";
export type PassageGenre = "literature" | "nonfiction" | "technology" | "life" | "subculture";
export type PassageLicense = "original" | "public-domain" | "cc-by-sa-4.0";

export type PassageCredit = {
  author: string;
  source: string;
  url: string;
};

export type PassageActivity = {
  id: string;
  kind: "passage";
  label: string;
  language: Language;
  length: PassageLength;
  genre: PassageGenre;
  license: PassageLicense;
  credit: PassageCredit | null;
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
  license: unknown;
  credit: unknown;
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

function isLicense(value: unknown): value is PassageLicense {
  return value === "original" || value === "public-domain" || value === "cc-by-sa-4.0";
}

/**
 * Copied texts must carry a visible credit so CC BY-SA and 공공누리 attribution
 * stays with the passage wherever it is rendered. Original texts need none.
 */
function readCredit(value: unknown, license: PassageLicense): PassageCredit | null | undefined {
  if (value === undefined || value === null) return license === "original" ? null : undefined;
  if (!isObject(value)) return undefined;
  const { author, source, url } = value;
  if (typeof author !== "string" || !author.trim()) return undefined;
  if (typeof source !== "string" || !source.trim()) return undefined;
  if (typeof url !== "string" || !/^https:\/\//.test(url)) return undefined;
  return { author: author.trim(), source: source.trim(), url };
}

function readPassage(value: unknown): PassageActivity | null {
  if (!isObject(value)) return null;
  const raw = value as RawPassage;
  if (typeof raw.id !== "string" || !raw.id.trim()) return null;
  if (typeof raw.title !== "string" || !raw.title.trim()) return null;
  if (!isLanguage(raw.language) || !isLength(raw.length) || !isGenre(raw.genre) || !isLicense(raw.license)) return null;
  if (!Array.isArray(raw.paragraphs)) return null;

  const credit = readCredit(raw.credit, raw.license);
  if (credit === undefined) return null;

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
    license: raw.license,
    credit,
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
