import { expect, it } from "vitest";
import { decodeHistory } from "./historyStorage";

it("migrates v1 history without mixing old Korean character speed with keystrokes", () => {
  const read = decodeHistory(JSON.stringify({
    version: 1,
    records: [
      {
        id: "korean",
        materialId: "lesson-ko",
        completedAt: 2,
        mode: "sentence",
        language: "ko",
        score: {
          accuracy: 80,
          correctCount: 4,
          typedCount: 5,
          elapsedMs: 2_000,
          charactersPerMinute: 120,
        },
      },
      {
        id: "english",
        materialId: "lesson-en",
        completedAt: 1,
        mode: "word",
        language: "en",
        score: {
          accuracy: 100,
          correctCount: 5,
          typedCount: 5,
          elapsedMs: 2_000,
          charactersPerMinute: 150,
        },
      },
    ],
  }));

  expect(read.ok).toBe(true);
  if (!read.ok) return;

  expect(read.records.find((record) => record.id === "korean")?.score).toMatchObject({
    accuracy: 80,
    correctCount: 4,
    typedCount: 5,
    elapsedMs: 2_000,
    charactersPerMinute: null,
    keystrokeCount: null,
    keystrokesPerMinute: null,
  });
  expect(read.records.find((record) => record.id === "english")?.score).toMatchObject({
    charactersPerMinute: 150,
    keystrokeCount: null,
    keystrokesPerMinute: null,
  });
});

it("accepts v2 score records with both speed representations", () => {
  const read = decodeHistory(JSON.stringify({
    version: 2,
    records: [{
      id: "korean-v2",
      materialId: "lesson-ko",
      completedAt: 3,
      mode: "word",
      language: "ko",
      score: {
        accuracy: 100,
        correctCount: 2,
        typedCount: 2,
        elapsedMs: 2_000,
        charactersPerMinute: null,
        keystrokeCount: 6,
        keystrokesPerMinute: 180,
      },
    }],
  }));

  expect(read.ok).toBe(true);
  if (!read.ok) return;
  expect(read.records[0]?.score.keystrokeCount).toBe(6);
  expect(read.records[0]?.score.keystrokesPerMinute).toBe(180);
});
