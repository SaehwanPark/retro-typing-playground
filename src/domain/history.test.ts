import { expect, it } from "vitest";
import { recentRecords } from "./history";
import type { PracticeRecord } from "./history";

it("deduplicates sessions and keeps the newest 100", () => {
  const records = Array.from({ length: 101 }, (_, index): PracticeRecord => ({
    id: `session-${index}`,
    materialId: "first-steps",
    completedAt: index,
    mode: "sentence",
    language: "ko",
    score: {
      accuracy: 100,
      correctCount: 1,
      typedCount: 1,
      elapsedMs: 1_000,
      charactersPerMinute: null,
      keystrokeCount: 1,
      keystrokesPerMinute: 60,
    },
  }));
  const ordered = recentRecords([...records, records[100]!]);
  expect(ordered).toHaveLength(100);
  expect(ordered[0]?.id).toBe("session-100");
  expect(ordered.at(-1)?.id).toBe("session-1");
});
