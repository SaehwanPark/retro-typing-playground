import type { Language } from "../content/lessons";

export type TypingSpeedUnit = "cpm" | "wpm";
export type TypingSpeedUnits = Readonly<Record<Language, TypingSpeedUnit>>;

export const defaultTypingSpeedUnits: TypingSpeedUnits = {
  ko: "cpm",
  en: "wpm",
};

export function isTypingSpeedUnit(value: unknown): value is TypingSpeedUnit {
  return value === "cpm" || value === "wpm";
}

export function toDisplayedTypingSpeed(
  charactersPerMinute: number | null,
  keystrokesPerMinute: number | null,
  language: Language,
  unit: TypingSpeedUnit,
): number | null {
  const rate = language === "ko" ? keystrokesPerMinute : charactersPerMinute;
  if (rate === null) return null;
  return unit === "wpm" ? rate / 5 : rate;
}
