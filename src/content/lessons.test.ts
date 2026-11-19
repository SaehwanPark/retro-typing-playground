import { expect, it } from "vitest";
import { activities, firstKoreanLesson } from "./library";
import { textActivities } from "./lessons";
import { passagesFor } from "./passages";

it("skips unusable prompts without losing valid modes", () => {
  const lessons = textActivities([
    { ...firstKoreanLesson, id: "bad", mode: "word", language: "en", text: " " },
    firstKoreanLesson,
  ]);
  expect(lessons.map((activity) => activity.id)).toEqual(["ko-line"]);
});

it("trims only line-ending punctuation from Korean line prompts", () => {
  const lessons = textActivities([
    { ...firstKoreanLesson, id: "ko-line-test", text: "안녕, 반가워요!" },
    { ...firstKoreanLesson, id: "ko-word-test", mode: "word", text: "단어!" },
    { ...firstKoreanLesson, id: "en-line-test", language: "en", text: "Hello!" },
  ]).flatMap((activity) => activity.lessons);
  const promptFor = (id: string) => lessons.find((lesson) => lesson.id === id)?.text;

  expect(promptFor("ko-line-test")).toBe("안녕, 반가워요");
  expect(promptFor("ko-word-test")).toBe("단어!");
  expect(promptFor("en-line-test")).toBe("Hello!");
  const koreanLine = activities.find((activity) => activity.id === "ko-line");
  expect(koreanLine?.kind === "line" ? koreanLine.lessons[0]?.text : undefined)
    .toBe(firstKoreanLesson.text);
});

it("bundles line, short passage, and long passage assets for both languages", () => {
  expect(activities.map((activity) => activity.id)).toEqual(
    ["ko-line", "ko-word", "en-line", "en-word", "ko-positions"],
  );
  const koreanLine = activities.find((activity) => activity.id === "ko-line");
  expect(koreanLine?.kind === "line" ? koreanLine.lessons.length : 0).toBeGreaterThan(5);
  for (const language of ["ko", "en"] as const) {
    expect(passagesFor(language, "short").length).toBeGreaterThanOrEqual(5);
    expect(passagesFor(language, "long").length).toBeGreaterThanOrEqual(1);
  }
  expect(passagesFor("ko", "short").every((passage) => passage.characterCount >= 200)).toBe(true);
  expect(passagesFor("ko", "long").every((passage) => passage.characterCount >= 2_000)).toBe(true);
});
