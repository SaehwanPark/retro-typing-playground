import { expect, it } from "vitest";
import { createPassageSession, submitPassageLine, updatePassageInput } from "./passagePractice";

it("sums finalized lines and includes time spent between lines", () => {
  const lines = ["한글", "문장"];
  const first = updatePassageInput(createPassageSession(), "한클!", 1_000);
  const next = submitPassageLine(lines, first, 2_000, "ko");
  if (next.type !== "next-line") throw new Error("Expected the second line");

  expect(next.session.line.input).toBe("");
  expect(submitPassageLine(lines, next.session, 2_500, "ko")).toEqual({ type: "waiting" });
  const second = updatePassageInput(next.session, "문장", 4_000);
  expect(submitPassageLine(lines, second, 7_000, "ko")).toEqual({
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
