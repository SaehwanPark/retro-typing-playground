export type PracticeSession = {
  input: string;
  startedAt: number | null;
  completedAt: number | null;
};

export type TypingScore = {
  accuracy: number | null;
  correctCount: number;
  typedCount: number;
  elapsedMs: number | null;
  charactersPerMinute: number | null;
};

export type PracticeAction =
  | { type: "input-changed"; input: string; at: number }
  | { type: "submitted"; at: number };

const koreanCharacterSegmenter = new Intl.Segmenter("ko", {
  granularity: "grapheme",
});

export function normalizeInput(input: string): string {
  return input.normalize("NFC");
}

export function splitCharacters(input: string): string[] {
  return Array.from(koreanCharacterSegmenter.segment(normalizeInput(input)), (part) =>
    part.segment
  );
}

export function createPracticeSession(): PracticeSession {
  return {
    input: "",
    startedAt: null,
    completedAt: null,
  };
}

export function reducePracticeSession(
  session: PracticeSession,
  action: PracticeAction,
): PracticeSession {
  if (session.completedAt !== null) {
    return session;
  }

  if (action.type === "submitted") {
    return {
      ...session,
      completedAt: action.at,
    };
  }

  const input = normalizeInput(action.input);

  return {
    ...session,
    input,
    startedAt: session.startedAt ?? (input.length > 0 ? action.at : null),
  };
}

export function calculateTypingScore(
  target: string,
  session: PracticeSession,
  now: number,
): TypingScore {
  const targetCharacters = splitCharacters(target);
  const typedCharacters = splitCharacters(session.input);
  const correctCount = typedCharacters.reduce(
    (count, character, index) =>
      character === targetCharacters[index] ? count + 1 : count,
    0,
  );
  const typedCount = typedCharacters.length;
  const completedAt = session.completedAt ?? now;
  const elapsedMs =
    session.startedAt === null
      ? null
      : Math.max(0, completedAt - session.startedAt);
  const accuracy =
    typedCount === 0 ? null : (correctCount * 100) / typedCount;
  const charactersPerMinute =
    elapsedMs === null || elapsedMs < 1_000
      ? null
      : (correctCount * 60_000) / elapsedMs;

  return {
    accuracy,
    correctCount,
    typedCount,
    elapsedMs,
    charactersPerMinute,
  };
}

export function hasReachedEnd(target: string, input: string): boolean {
  return splitCharacters(input).length >= splitCharacters(target).length;
}
