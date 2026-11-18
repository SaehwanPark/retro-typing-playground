import { expect, it } from "vitest";
import { firstKoreanLesson, textActivities } from "./lessons";

it("skips unusable prompts without losing valid modes", () => {
  const lessons = textActivities([
    { ...firstKoreanLesson, id: "bad", mode: "word", language: "en", text: " " },
    firstKoreanLesson,
  ]);
  expect(lessons.map((activity) => activity.id)).toEqual(["ko-sentence"]);
});
