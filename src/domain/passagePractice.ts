import type { Language } from "../content/lessons";
import { calculateTypingScore, createPracticeSession, createTypingScore, hasReachedEnd, reducePracticeSession } from "./typing";
import type { PracticeSession, TypingScore } from "./typing";

export type PassageSession = {
  lineIndex: number;
  line: PracticeSession;
  startedAt: number | null;
  correctCount: number;
  typedCount: number;
  keystrokeCount: number;
};

type PassageAdvance =
  | { type: "waiting" }
  | { type: "next-line"; session: PassageSession }
  | { type: "completed"; score: TypingScore };

export function createPassageSession(): PassageSession {
  return {
    lineIndex: 0,
    line: createPracticeSession(),
    startedAt: null,
    correctCount: 0,
    typedCount: 0,
    keystrokeCount: 0,
  };
}

export function updatePassageInput(session: PassageSession, input: string, at: number): PassageSession {
  const line = reducePracticeSession(session.line, { type: "input-changed", input, at });
  return { ...session, line, startedAt: session.startedAt ?? line.startedAt };
}

export function scorePassage(
  target: string,
  session: PassageSession,
  at: number,
  language: Language,
): TypingScore {
  const line = calculateTypingScore(target, session.line, at, language);
  return createTypingScore(
    session.correctCount + line.correctCount,
    session.typedCount + line.typedCount,
    session.startedAt === null ? null : Math.max(0, at - session.startedAt),
    language,
    session.keystrokeCount + (line.keystrokeCount ?? 0),
  );
}

export function submitPassageLine(
  lines: readonly string[],
  session: PassageSession,
  at: number,
  language: Language,
): PassageAdvance {
  const target = lines[session.lineIndex];
  if (!target || !hasReachedEnd(target, session.line.input)) return { type: "waiting" };

  const score = scorePassage(target, session, at, language);
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
