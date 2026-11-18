import { calculateTypingScore, createPracticeSession, createTypingScore, hasReachedEnd, reducePracticeSession } from "./typing";
import type { PracticeSession, TypingScore } from "./typing";

export type ArticleSession = {
  lineIndex: number;
  line: PracticeSession;
  startedAt: number | null;
  correctCount: number;
  typedCount: number;
  keystrokeCount: number;
};

type ArticleAdvance =
  | { type: "waiting" }
  | { type: "next-line"; session: ArticleSession }
  | { type: "completed"; score: TypingScore };

export function createArticleSession(): ArticleSession {
  return {
    lineIndex: 0,
    line: createPracticeSession(),
    startedAt: null,
    correctCount: 0,
    typedCount: 0,
    keystrokeCount: 0,
  };
}

export function updateArticleInput(session: ArticleSession, input: string, at: number): ArticleSession {
  const line = reducePracticeSession(session.line, { type: "input-changed", input, at });
  return { ...session, line, startedAt: session.startedAt ?? line.startedAt };
}

export function scoreArticle(target: string, session: ArticleSession, at: number): TypingScore {
  const line = calculateTypingScore(target, session.line, at, "ko");
  return createTypingScore(
    session.correctCount + line.correctCount,
    session.typedCount + line.typedCount,
    session.startedAt === null ? null : Math.max(0, at - session.startedAt),
    "ko",
    session.keystrokeCount + (line.keystrokeCount ?? 0),
  );
}

export function submitArticleLine(lines: readonly string[], session: ArticleSession, at: number): ArticleAdvance {
  const target = lines[session.lineIndex];
  if (!target || !hasReachedEnd(target, session.line.input)) return { type: "waiting" };

  const score = scoreArticle(target, session, at);
  const nextIndex = session.lineIndex + 1;
  if (nextIndex === lines.length) return { type: "completed", score };

  return {
    type: "next-line",
    session: {
      ...session,
      lineIndex: nextIndex,
      line: createPracticeSession(),
      correctCount: score.correctCount,
      typedCount: score.typedCount,
      keystrokeCount: score.keystrokeCount ?? session.keystrokeCount,
    },
  };
}
