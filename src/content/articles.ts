import type { NonEmpty } from "./lessons";

export type ArticleActivity = {
  id: string;
  kind: "article";
  label: string;
  language: "ko";
  source: "original";
  lines: NonEmpty<string>;
};

const sources = [
  {
    id: "dawn-river",
    label: "새벽 강변",
    lines: [
      "새벽이 오자 강물 위에 가느다란 물안개가 피어났습니다.",
      "자전거를 세우고 잠깐 멈추니 물가에서 새가 울었습니다.",
      "다리 너머로 첫 버스가 지나가고 창문에 아침빛이 번졌습니다.",
      "나는 강바람을 맞으며 집으로 돌아가는 길을 골랐습니다.",
    ],
  },
  {
    id: "small-library",
    label: "작은 도서관",
    lines: [
      "골목 안 도서관의 문은 토요일에도 일찍 열립니다.",
      "나는 반납할 책을 내려놓고 창가에 놓인 의자에 앉았습니다.",
      "옆자리에서는 누군가 종이를 넘기는 소리만 들렸습니다.",
      "해가 길게 들어올 즈음 책 한 권을 더 골라 밖으로 나왔습니다.",
    ],
  },
] as const;

export const libraryEntry = { id: "article-library", label: "장문 고르기" };

export const articles: readonly ArticleActivity[] = sources.flatMap<ArticleActivity>((source) => {
  const [first, ...rest] = source.lines.filter((line) => line.trim() && !/[\r\n]/.test(line));
  return first && source.label.trim() && source.id.trim() ? [{
    ...source,
    kind: "article",
    language: "ko",
    source: "original",
    lines: [first, ...rest],
  }] : [];
});
