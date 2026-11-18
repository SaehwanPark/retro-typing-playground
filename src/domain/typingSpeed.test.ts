import { describe, expect, it } from "vitest";
import { defaultTypingSpeedUnits, isTypingSpeedUnit, toDisplayedTypingSpeed } from "./typingSpeed";

describe("typing speed units", () => {
  it("defaults Korean to CPM and English to WPM", () => {
    expect(defaultTypingSpeedUnits).toEqual({ ko: "cpm", en: "wpm" });
  });

  it("converts the raw CPM score to WPM only for display", () => {
    expect(toDisplayedTypingSpeed(150, "cpm")).toBe(150);
    expect(toDisplayedTypingSpeed(150, "wpm")).toBe(30);
    expect(toDisplayedTypingSpeed(null, "wpm")).toBeNull();
  });

  it("accepts only supported speed units", () => {
    expect(isTypingSpeedUnit("cpm")).toBe(true);
    expect(isTypingSpeedUnit("wpm")).toBe(true);
    expect(isTypingSpeedUnit("words")).toBe(false);
  });
});
