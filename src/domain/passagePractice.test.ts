import { expect, it } from "vitest";
import { createPassageSession, endsBundle, submissionEndsBundle, submitPassageLine, updatePassageInput } from "./passagePractice";
import type { PassageSession } from "./passagePractice";
import type { TypingScore } from "./typing";

function submit(
  lines: readonly string[],
  session: PassageSession,
  input: string,
  inputAt: number,
  submitAt: number,
) {
  return submitPassageLine(lines, updatePassageInput(session, input, inputAt), submitAt, "en");
}

it("sums line typing time and excludes the pause between lines", () => {
  const lines = ["한글", "문장"];
  const first = updatePassageInput(createPassageSession(), "한클!", 1_000);
  const next = submitPassageLine(lines, first, 2_000, "ko");
  if (next.type !== "next-line") throw new Error("Expected the second line");

  expect(submitPassageLine(lines, next.session, 2_500, "ko")).toEqual({ type: "waiting" });
  // The first line takes 1s; the second starts at 4s and ends at 7s. The 2s
  // pause between them is transition time and must stay out of the score.
  expect(submitPassageLine(lines, updatePassageInput(next.session, "문장", 4_000), 7_000, "ko")).toMatchObject({
    type: "completed",
    score: { correctCount: 3, typedCount: 5, elapsedMs: 4_000, accuracy: 60 },
  });
});

it("reports speed only when a bundle ends", () => {
  // Seven one-letter lines make the first bundle of five end on line five.
  const lines = ["a", "b", "c", "d", "e", "f", "g"];
  let session = createPassageSession();

  for (let index = 0; index < lines.length; index += 1) {
    // Each line starts 100ms after the previous one ended and is typed for 900ms.
    const inputAt = index * 1_000 + 100;
    const at = (index + 1) * 1_000;
    const update = submit(lines, session, lines[index]!, inputAt, at);
    if (update.type === "waiting") throw new Error("Expected submission to advance");

    if (index === 4) {
      // The fifth line closes the first bundle, so its speed is reported here.
      expect(update.type).toBe("next-line");
      if (update.type !== "next-line") throw new Error("unreachable");
      expect(update.bundle).not.toBeNull();
      expect(update.session.lastBundle).toEqual(update.bundle);
      expect(update.bundle?.charactersPerMinute).toBeCloseTo(5 * 60_000 / 4_500);
    } else if (update.type === "next-line") {
      expect(update.bundle).toBeNull();
    }
    session = update.type === "next-line" ? update.session : session;
  }

  expect(session.lastBundle?.typedCount).toBe(5);
});

it("keeps the whole-passage speed for the final result", () => {
  const lines = ["a", "b", "c", "d", "e", "f", "g"];
  let session = createPassageSession();
  let final: TypingScore | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const update = submit(lines, session, lines[index]!, index * 1_000 + 100, (index + 1) * 1_000);
    if (update.type === "waiting") throw new Error("Expected submission to advance");
    if (update.type === "completed") final = update.score;
    else session = update.session;
  }

  expect(final?.typedCount).toBe(7);
  // Seven characters over seven 900ms lines is the whole-passage average, not the last bundle's.
  expect(final?.elapsedMs).toBe(6_300);
  expect(final?.charactersPerMinute).toBeCloseTo(7 * 60_000 / 6_300);
});

it("ends a bundle on the last line as well as on a page boundary", () => {
  expect(endsBundle(5, 12)).toBe(true);
  expect(endsBundle(4, 12)).toBe(false);
  expect(endsBundle(12, 12)).toBe(true);
  expect(endsBundle(3, 3)).toBe(true);
});

it("only closes a bundle once the submitting line is complete", () => {
  const lines = ["ab", "cd"];
  const session = createPassageSession();
  expect(submissionEndsBundle(lines, session, "a")).toBe(false);
  expect(submissionEndsBundle(lines, session, "ab")).toBe(false);

  const first = submit(lines, session, "ab", 0, 1_000);
  if (first.type !== "next-line") throw new Error("Expected the second line");
  expect(submissionEndsBundle(lines, first.session, "cd")).toBe(true);
});
