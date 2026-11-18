import { expect, it } from "vitest";
import { activities, firstKoreanLesson, textActivities } from "./lessons";

it("skips unusable prompts without losing valid modes", () => {
  const lessons = textActivities([
    { ...firstKoreanLesson, id: "bad", mode: "word", language: "en", text: " " },
    firstKoreanLesson,
  ]);
  expect(lessons.map((activity) => activity.id)).toEqual(["ko-sentence"]);
});

it("trims only sentence-ending punctuation from Korean sentence prompts", () => {
  const lessons = textActivities([
    { ...firstKoreanLesson, id: "ko-sentence-test", text: "안녕, 반가워요!" },
    { ...firstKoreanLesson, id: "ko-word-test", mode: "word", text: "단어!" },
    { ...firstKoreanLesson, id: "en-sentence-test", language: "en", text: "Hello!" },
  ]).flatMap((activity) => activity.lessons);
  const promptFor = (id: string) => lessons.find((lesson) => lesson.id === id)?.text;

  expect(promptFor("ko-sentence-test")).toBe("안녕, 반가워요");
  expect(promptFor("ko-word-test")).toBe("단어!");
  expect(promptFor("en-sentence-test")).toBe("Hello!");
  const koreanSentence = activities.find((activity) => activity.id === "ko-sentence");
  expect(koreanSentence?.kind === "sentence" ? koreanSentence.lessons[0]?.text : undefined)
    .toBe(firstKoreanLesson.text);
});
