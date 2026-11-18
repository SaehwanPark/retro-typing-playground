import { useCallback, useReducer } from "react";
import type { Activity, PositionActivity, TextActivity, TextLesson } from "../content/lessons";
import { libraryEntry } from "../content/articles";
import type { ArticleActivity } from "../content/articles";
import { createArticleSession, submitArticleLine, updateArticleInput } from "../domain/articlePractice";
import type { ArticleSession } from "../domain/articlePractice";
import { createPositionSession, pressPosition, scorePositions } from "../domain/positions";
import type { PositionKey, PositionSession } from "../domain/positions";
import { calculateTypingScore, createPracticeSession, hasReachedEnd, reducePracticeSession } from "../domain/typing";
import type { PracticeSession, TypingScore } from "../domain/typing";
import type { PracticeRecord } from "../domain/history";

export const historyEntry = { id: "history", label: "최근 연습 기록", kind: "history" } as const;
export const challengeEntry = { id: "challenge", label: "30초 낱말 도전", kind: "challenge" } as const;
export const freePracticeEntry = { id: "free-practice", label: "연습장", kind: "free-practice" } as const;
export const settingsEntry = { id: "settings", label: "환경설정", kind: "settings" } as const;

export type PracticeContentState =
  | { screen: "menu"; selected: string | null }
  | { screen: "library"; selected: string | null }
  | { screen: "history" }
  | { screen: "challenge" }
  | { screen: "free-practice" }
  | {
    screen: "practice";
    activity: TextActivity;
    lesson: TextLesson;
    index: number;
    round: number;
    session: PracticeSession;
    previous: TypingScore | null;
  }
  | { screen: "positions"; activity: PositionActivity; session: PositionSession }
  | { screen: "article"; activity: ArticleActivity; session: ArticleSession }
  | { screen: "result"; activity: Activity | ArticleActivity; score: TypingScore };

export type PracticeState =
  | PracticeContentState
  | { screen: "settings"; returnState: PracticeContentState };

type CompletionTime = { id: string; completedAt: number; at: number };
export type AppAction =
  | { type: "start"; activity: Activity | ArticleActivity }
  | { type: "open-library" }
  | { type: "open-history" }
  | { type: "open-settings" }
  | { type: "close-settings" }
  | { type: "open-challenge" }
  | { type: "open-free-practice" }
  | { type: "input-changed"; input: string; at: number }
  | ({ type: "submit" } & CompletionTime)
  | ({ type: "position-key"; key: PositionKey } & CompletionTime)
  | { type: "finish" }
  | { type: "return-to-menu" }
  | { type: "retry" };

function startActivity(activity: Activity | ArticleActivity): PracticeState {
  if (activity.kind === "article") {
    return { screen: "article", activity, session: createArticleSession() };
  }
  if (activity.kind === "position") {
    return { screen: "positions", activity, session: createPositionSession() };
  }
  return {
    screen: "practice",
    activity,
    lesson: activity.lessons[0],
    index: 0,
    round: 0,
    session: createPracticeSession(),
    previous: null,
  };
}

function reduceTextPractice(
  state: Extract<PracticeState, { screen: "practice" }>,
  action: AppAction,
): PracticeState {
  if (action.type === "input-changed") {
    return { ...state, session: reducePracticeSession(state.session, action) };
  }
  if (action.type === "finish" && state.previous) {
    return { screen: "result", activity: state.activity, score: state.previous };
  }
  if (action.type !== "submit" || !hasReachedEnd(state.lesson.text, state.session.input)) {
    return state;
  }

  const completed = reducePracticeSession(state.session, { type: "submitted", at: action.at });
  const score = calculateTypingScore(state.lesson.text, completed, action.at);
  if (state.activity.kind === "word") {
    return { screen: "result", activity: state.activity, score };
  }
  const index = (state.index + 1) % state.activity.lessons.length;
  return {
    ...state,
    index,
    lesson: state.activity.lessons[index] ?? state.activity.lessons[0],
    round: state.round + 1,
    session: createPracticeSession(),
    previous: score,
  };
}

function reduceArticlePractice(state: Extract<PracticeState, { screen: "article" }>, action: AppAction): PracticeState {
  if (action.type === "input-changed") {
    return { ...state, session: updateArticleInput(state.session, action.input, action.at) };
  }
  if (action.type !== "submit") return state;
  const update = submitArticleLine(state.activity.lines, state.session, action.at);
  switch (update.type) {
    case "waiting": return state;
    case "next-line": return { ...state, session: update.session };
    case "completed": return { screen: "result", activity: state.activity, score: update.score };
  }
}

export function reducePracticeState(state: PracticeState, action: AppAction): PracticeState {
  if (action.type === "open-settings") {
    if (state.screen === "settings") return state;
    const returnState = state.screen === "menu" ? { ...state, selected: settingsEntry.id } : state;
    return { screen: "settings", returnState };
  }
  if (action.type === "open-library") return { screen: "library", selected: null };
  if (action.type === "open-history") return { screen: "history" };
  if (action.type === "open-challenge") return { screen: "challenge" };
  if (action.type === "open-free-practice") return { screen: "free-practice" };
  if (action.type === "start") return startActivity(action.activity);
  if (state.screen === "menu") return state;
  if (state.screen === "library") {
    return action.type === "return-to-menu" ? { screen: "menu", selected: libraryEntry.id } : state;
  }
  if (state.screen === "history") {
    return action.type === "return-to-menu" ? { screen: "menu", selected: historyEntry.id } : state;
  }
  if (state.screen === "settings") {
    return action.type === "close-settings" ? state.returnState : state;
  }
  if (state.screen === "challenge") {
    return action.type === "return-to-menu" ? { screen: "menu", selected: challengeEntry.id } : state;
  }
  if (state.screen === "free-practice") {
    return action.type === "return-to-menu" ? { screen: "menu", selected: freePracticeEntry.id } : state;
  }
  if (action.type === "return-to-menu") {
    const screen = state.activity.kind === "article" ? "library" : "menu";
    return { screen, selected: state.activity.id };
  }
  if (state.screen === "result" && action.type === "retry") return startActivity(state.activity);
  if (state.screen === "practice") return reduceTextPractice(state, action);
  if (state.screen === "article") return reduceArticlePractice(state, action);

  if (state.screen === "positions" && action.type === "position-key") {
    const target = state.activity.keys[state.session.correct];
    if (!target) return state;
    const session = pressPosition(state.session, target, action.key, action.at);
    if (session.correct === state.activity.keys.length) {
      return { screen: "result", activity: state.activity, score: scorePositions(session, action.at) };
    }
    return { ...state, session };
  }
  return state;
}

type SessionState = {
  screen: PracticeState;
  pending: readonly PracticeRecord[];
  latest: PracticeRecord | null;
};

type SessionAction = AppAction | { type: "saved"; id: string };

function completedRecord(before: PracticeState, after: PracticeState, action: AppAction): PracticeRecord | null {
  if (action.type !== "submit" && action.type !== "position-key") return null;
  if (!("activity" in before) || before.screen === "result") return null;
  const score = after.screen === "result" ? after.score
    : (before.screen === "practice" && after.screen === "practice" && after.round > before.round)
      ? after.previous : null;
  if (!score) return null;
  return {
    id: action.id,
    materialId: before.screen === "practice" ? before.lesson.id : before.activity.id,
    completedAt: action.completedAt,
    mode: before.activity.kind,
    language: before.screen === "practice" ? before.lesson.language : "ko",
    score,
  };
}

function reduceSessions(state: SessionState, action: SessionAction): SessionState {
  if (action.type === "saved") {
    return { ...state, pending: state.pending.filter((record) => record.id !== action.id) };
  }
  const screen = reducePracticeState(state.screen, action);
  const record = completedRecord(state.screen, screen, action);
  return record
    ? { screen, pending: [...state.pending, record], latest: record }
    : { ...state, screen };
}

export function usePracticeState() {
  const [state, dispatch] = useReducer(reduceSessions, {
    screen: { screen: "menu", selected: null },
    pending: [],
    latest: null,
  });
  const acknowledge = useCallback((id: string) => dispatch({ type: "saved", id }), []);
  return { state: state.screen, pending: state.pending[0], latest: state.latest, dispatch, acknowledge };
}

export function completionTime(at: number): CompletionTime {
  return { id: crypto.randomUUID(), completedAt: Date.now(), at };
}
