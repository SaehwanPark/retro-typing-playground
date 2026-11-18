import type { TypingScore } from "./typing";

export const keyboardRows = [
  [["Q", "ㅂ"], ["W", "ㅈ"], ["E", "ㄷ"], ["R", "ㄱ"], ["T", "ㅅ"], ["Y", "ㅛ"], ["U", "ㅕ"], ["I", "ㅑ"], ["O", "ㅐ"], ["P", "ㅔ"]],
  [["A", "ㅁ"], ["S", "ㄴ"], ["D", "ㅇ"], ["F", "ㄹ"], ["G", "ㅎ"], ["H", "ㅗ"], ["J", "ㅓ"], ["K", "ㅏ"], ["L", "ㅣ"]],
  [["Z", "ㅋ"], ["X", "ㅌ"], ["C", "ㅊ"], ["V", "ㅍ"], ["B", "ㅠ"], ["N", "ㅜ"], ["M", "ㅡ"]],
] as const;

type KeyLetter = (typeof keyboardRows)[number][number][0];
export type PositionKey = `Key${KeyLetter}`;
export type PositionSession = {
  correct: number;
  attempts: number;
  startedAt: number | null;
  lastWrong: boolean;
};

export function isPositionKey(code: string): code is PositionKey {
  return /^Key[A-Z]$/.test(code);
}

export function createPositionSession(): PositionSession {
  return { correct: 0, attempts: 0, startedAt: null, lastWrong: false };
}

export function pressPosition(
  session: PositionSession,
  target: PositionKey,
  pressed: PositionKey,
  at: number,
): PositionSession {
  const matches = target === pressed;
  return {
    correct: session.correct + Number(matches),
    attempts: session.attempts + 1,
    startedAt: session.startedAt ?? at,
    lastWrong: !matches,
  };
}

export function scorePositions(session: PositionSession, at: number): TypingScore {
  return {
    accuracy: session.attempts === 0 ? null : (100 * session.correct) / session.attempts,
    correctCount: session.correct,
    typedCount: session.attempts,
    elapsedMs: session.startedAt === null ? null : Math.max(0, at - session.startedAt),
    charactersPerMinute: null,
    keystrokeCount: null,
    keystrokesPerMinute: null,
  };
}
