export type KoreanShortLesson = {
  id: string;
  title: string;
  mode: "sentence";
  source: "original";
  language: "ko";
  text: string;
};

export const firstKoreanLesson: KoreanShortLesson = {
  id: "first-steps",
  title: "손끝에 다시 익숙해지기",
  mode: "sentence",
  source: "original",
  language: "ko",
  text: "한글을 한 줄씩 입력하면 손끝에 작은 리듬이 돌아옵니다.",
};
