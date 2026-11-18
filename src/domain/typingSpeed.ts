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
  unit: TypingSpeedUnit,
): number | null {
  if (charactersPerMinute === null) return null;
  return unit === "wpm" ? charactersPerMinute / 5 : charactersPerMinute;
}
