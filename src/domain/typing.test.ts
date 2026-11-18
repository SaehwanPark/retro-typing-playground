import { describe, expect, it } from "vitest";
import {
  calculateTypingScore,
  createPracticeSession,
  hasReachedEnd,
  normalizeInput,
  reducePracticeSession,
  splitCharacters,
} from "./typing";

describe("Korean text input", () => {
  it("compares precomposed and decomposed Hangul as the same grapheme", () => {
    expect(normalizeInput("한")).toBe("한");
    expect(splitCharacters("한")).toEqual(["한"]);
  });

  it("keeps punctuation and spaces as typed characters", () => {
    expect(splitCharacters("한글, 한 줄!")).toHaveLength(8);
  });
});

describe("practice sessions", () => {
  it("starts its timer with the first confirmed input", () => {
    const empty = createPracticeSession();

    expect(
      reducePracticeSession(empty, {
        type: "input-changed",
        input: "",
        at: 100,
      }).startedAt,
    ).toBeNull();
    expect(
      reducePracticeSession(empty, {
        type: "input-changed",
        input: "한",
        at: 200,
      }).startedAt,
    ).toBe(200);
  });

  it("allows mistakes to be corrected before the final score", () => {
    const typed = reducePracticeSession(createPracticeSession(), {
      type: "input-changed",
      input: "한클",
      at: 1_000,
    });
    const corrected = reducePracticeSession(typed, {
      type: "input-changed",
      input: "한글",
      at: 4_000,
    });

    expect(calculateTypingScore("한글", corrected, 5_000)).toMatchObject({
      accuracy: 100,
      correctCount: 2,
      typedCount: 2,
      elapsedMs: 4_000,
      charactersPerMinute: 30,
    });
  });

  it("scores errors and extra characters by target position", () => {
    const session = reducePracticeSession(createPracticeSession(), {
      type: "input-changed",
      input: "한클!",
      at: 100,
    });

    expect(calculateTypingScore("한글", session, 1_100)).toMatchObject({
      accuracy: 100 / 3,
      correctCount: 1,
      typedCount: 3,
      charactersPerMinute: 60,
    });
  });

  it("hides speed until the session lasts one second", () => {
    const session = reducePracticeSession(createPracticeSession(), {
      type: "input-changed",
      input: "한",
      at: 1_000,
    });

    expect(calculateTypingScore("한글", session, 1_999).charactersPerMinute).toBeNull();
    expect(calculateTypingScore("한글", session, 2_000).charactersPerMinute).toBe(
      60,
    );
  });

  it("does not finish before all target graphemes are typed", () => {
    expect(hasReachedEnd("한글!", "한글")).toBe(false);
    expect(hasReachedEnd("한글!", "한글!")).toBe(true);
  });

  it("keeps a completed session unchanged", () => {
    const session = reducePracticeSession(
      {
        input: "한글",
        startedAt: 1_000,
        completedAt: null,
      },
      { type: "submitted", at: 4_000 },
    );

    expect(
      reducePracticeSession(session, {
        type: "input-changed",
        input: "다른 입력",
        at: 5_000,
      }),
    ).toBe(session);
  });
});
