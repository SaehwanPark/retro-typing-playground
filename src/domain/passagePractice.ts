import type { Language } from "../content/lessons";
import { passageLinesPerPage } from "./textLayout";
import { calculateLiveAccuracy, calculateTypingScore, createPracticeSession, createTypingScore, hasReachedEnd, reducePracticeSession } from "./typing";
import type { PracticeSession, TypingScore } from "./typing";

/**
 * A passage reports speed once per bundle, so the same totals live at two
 * scopes: the whole passage for the final result, and the current bundle for
 * the score shown when its last line is submitted.
 */
export type PassageProgress = {
  startedAt: number | null;
  correctCount: number;
  typedCount: number;
  keystrokeCount: number;
};

export type PassageSession = {
  lineIndex: number;
  line: PracticeSession;
  passage: PassageProgress;
  bundle: PassageProgress;
  /** The most recently finished bundle, so its speed stays visible like a previous line. */
  lastBundle: TypingScore | null;
};

export type PassageAdvance =
  | { type: "waiting" }
  | { type: "next-line"; session: PassageSession; bundle: TypingScore | null }
  | { type: "completed"; score: TypingScore; bundle: TypingScore };

function createProgress(): PassageProgress {
  return { startedAt: null, correctCount: 0, typedCount: 0, keystrokeCount: 0 };
}

export function createPassageSession(): PassageSession {
  return {
    lineIndex: 0,
    line: createPracticeSession(),
    passage: createProgress(),
    bundle: createProgress(),
    lastBundle: null,
  };
}

/**
 * A bundle ends on the last line before a page boundary, and the final line
 * always closes the last (possibly partial) bundle.
 */
export function endsBundle(nextLineIndex: number, lineCount: number): boolean {
  return nextLineIndex === lineCount || nextLineIndex % passageLinesPerPage === 0;
}

export function updatePassageInput(session: PassageSession, input: string, at: number): PassageSession {
  const line = reducePracticeSession(session.line, { type: "input-changed", input, at });
  const startedAt = line.startedAt;
  return {
    ...session,
    line,
    passage: { ...session.passage, startedAt: session.passage.startedAt ?? startedAt },
    bundle: { ...session.bundle, startedAt: session.bundle.startedAt ?? startedAt },
  };
}

function addLine(progress: PassageProgress, score: TypingScore): PassageProgress {
  return {
    startedAt: progress.startedAt,
    correctCount: progress.correctCount + score.correctCount,
    typedCount: progress.typedCount + score.typedCount,
    keystrokeCount: progress.keystrokeCount + (score.keystrokeCount ?? 0),
  };
}

function progressScore(progress: PassageProgress, at: number, language: Language): TypingScore {
  return createTypingScore(
    progress.correctCount,
    progress.typedCount,
    progress.startedAt === null ? null : Math.max(0, at - progress.startedAt),
    language,
    progress.keystrokeCount,
  );
}

/**
 * Accuracy for the lines finalized so far plus the line in progress. Speed is
 * deliberately absent because a passage only reports speed when a bundle ends.
 */
export function passageAccuracy(
  target: string,
  session: PassageSession,
  language: Language,
): TypingScore {
  const line = calculateLiveAccuracy(target, session.line.input, language);
  return createTypingScore(
    session.passage.correctCount + line.correctCount,
    session.passage.typedCount + line.typedCount,
    null,
    language,
    null,
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

  const line = calculateTypingScore(target, session.line, at, language);
  const passage = addLine(session.passage, line);
  const bundle = addLine(session.bundle, line);
  const nextIndex = session.lineIndex + 1;

  if (nextIndex === lines.length) {
    return {
      type: "completed",
      score: progressScore(passage, at, language),
      bundle: progressScore(bundle, at, language),
    };
  }

  const bundleEnds = endsBundle(nextIndex, lines.length);
  const finishedBundle = bundleEnds ? progressScore(bundle, at, language) : null;
  return {
    type: "next-line",
    session: {
      lineIndex: nextIndex,
      line: createPracticeSession(),
      passage,
      bundle: bundleEnds ? createProgress() : bundle,
      lastBundle: finishedBundle ?? session.lastBundle,
    },
    bundle: finishedBundle,
  };
}

/**
 * Whether this submission closes a bundle, so the completion sound can play
 * once per bundle rather than once per line.
 */
export function submissionEndsBundle(
  lines: readonly string[],
  session: PassageSession,
  input?: string,
): boolean {
  const target = lines[session.lineIndex];
  if (!target || !hasReachedEnd(target, input ?? session.line.input)) return false;
  return endsBundle(session.lineIndex + 1, lines.length);
}
