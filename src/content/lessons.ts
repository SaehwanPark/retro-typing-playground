import type { PositionKey } from "../domain/positions";

export type Language = "ko" | "en";
export type TextMode = "word" | "sentence";
export type NonEmpty<T> = readonly [T, ...T[]];

export type TextLesson = {
  id: string;
  title: string;
  mode: TextMode;
  language: Language;
  source: "original";
  text: string;
};

export type TextActivity = {
  id: string;
  kind: TextMode;
  label: string;
  lessons: NonEmpty<TextLesson>;
};

export type PositionActivity = {
  id: string;
  kind: "position";
  label: string;
  keys: NonEmpty<PositionKey>;
};

export type Activity = TextActivity | PositionActivity;

export const firstKoreanLesson: TextLesson = {
  id: "first-steps",
  title: "손끝에 다시 익숙해지기",
  mode: "sentence",
  language: "ko",
  source: "original",
  text: "한글을 한 줄씩 입력하면 손끝에 작은 리듬이 돌아옵니다",
};

function trimKoreanSentenceEnding(lesson: TextLesson): TextLesson {
  if (lesson.language !== "ko" || lesson.mode !== "sentence") return lesson;
  // Korean sentence drills should end on the final word rather than its punctuation mark.
  return { ...lesson, text: lesson.text.replace(/\p{P}+$/u, "") };
}

const sourceLessons: readonly TextLesson[] = [
  firstKoreanLesson,
  { id: "ko-window", title: "창가의 아침", mode: "sentence", language: "ko", source: "original", text: "창가에 앉아 비가 그치는 소리를 들었습니다." },
  { id: "ko-pencil", title: "연필", mode: "word", language: "ko", source: "original", text: "연필" },
  { id: "en-window", title: "Morning at the window", mode: "sentence", language: "en", source: "original", text: "The rain drew thin lines across the window." },
  { id: "en-tea", title: "A quiet morning", mode: "sentence", language: "en", source: "original", text: "I made a pot of tea and opened my notebook." },
  { id: "en-orchard", title: "orchard", mode: "word", language: "en", source: "original", text: "orchard" },
];

export function textActivities(lessons: readonly TextLesson[]): TextActivity[] {
  const valid = lessons.map(trimKoreanSentenceEnding).filter((lesson) =>
    lesson.id.trim() && lesson.title.trim() && lesson.text.trim() && !/[\r\n]/.test(lesson.text)
  );
  const languages = ["ko", "en"] as const;
  const modes = ["sentence", "word"] as const;

  return languages.flatMap((language) => modes.flatMap<TextActivity>((mode) => {
    const [first, ...rest] = valid.filter((lesson) => lesson.language === language && lesson.mode === mode);
    return first ? [{
      id: `${language}-${mode}`,
      kind: mode,
      label: `${language === "ko" ? "한글" : "영문"} ${mode === "word" ? "낱말" : "단문"}`,
      lessons: [first, ...rest],
    }] : [];
  }));
}

export const activities: readonly Activity[] = [
  ...textActivities(sourceLessons),
  {
    id: "ko-positions",
    kind: "position",
    label: "두벌식 자리 연습",
    keys: ["KeyF", "KeyJ", "KeyD", "KeyK", "KeyS", "KeyL", "KeyA", "KeyG", "KeyH"],
  },
];
