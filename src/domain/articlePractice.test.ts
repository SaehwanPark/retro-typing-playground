import { expect, it } from "vitest";
import { createArticleSession, submitArticleLine, updateArticleInput } from "./articlePractice";

it("sums finalized lines and includes time spent between lines", () => {
  const lines = ["한글", "문장"];
  const first = updateArticleInput(createArticleSession(), "한클!", 1_000);
  const next = submitArticleLine(lines, first, 2_000);
  if (next.type !== "next-line") throw new Error("Expected the second line");

  expect(next.session.line.input).toBe("");
  expect(submitArticleLine(lines, next.session, 2_500)).toEqual({ type: "waiting" });
  const second = updateArticleInput(next.session, "문장", 4_000);
  expect(submitArticleLine(lines, second, 7_000)).toEqual({
    type: "completed",
    score: {
      correctCount: 3,
      typedCount: 5,
      elapsedMs: 6_000,
      accuracy: 60,
      charactersPerMinute: null,
      keystrokeCount: 13,
      keystrokesPerMinute: 130,
    },
  });
});
