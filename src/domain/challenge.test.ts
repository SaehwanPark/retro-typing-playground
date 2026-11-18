import { expect, it } from "vitest";
import { advanceChallenge, targetWord } from "./challenge";

const words = ["바람", "새벽"] as const;

it("counts only exact matches submitted before the deadline", () => {
  const start = advanceChallenge(words, { phase: "ready" }, { type: "start", at: 1_000 });
  const typo = advanceChallenge(words, start, { type: "input", input: "바람!", at: 2_000 });
  const miss = advanceChallenge(words, typo, { type: "submit", at: 2_100 });
  expect(miss).toMatchObject({ phase: "running", solved: 0, missed: true });

  const input = advanceChallenge(words, miss, { type: "input", input: "바람", at: 4_000 });
  expect(advanceChallenge(words, input, { type: "submit", at: 30_999 })).toMatchObject({ solved: 1 });
  expect(advanceChallenge(words, input, { type: "submit", at: 31_000 })).toEqual({
    phase: "finished", solved: 0, timedOut: true, elapsedMs: 30_000,
  });
  expect(targetWord(words, 2)).toBe("바람");
});
