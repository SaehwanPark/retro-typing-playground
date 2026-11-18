import { useReducer } from "react";
import type { Activity, PositionActivity, TextActivity, TextLesson } from "../content/lessons";
import { libraryEntry } from "../content/articles";
import type { ArticleActivity } from "../content/articles";
import { createArticleSession, submitArticleLine, updateArticleInput } from "../domain/articlePractice";
import type { ArticleSession } from "../domain/articlePractice";
import { createPositionSession, pressPosition, scorePositions } from "../domain/positions";
import type { PositionKey, PositionSession } from "../domain/positions";
import { calculateTypingScore, createPracticeSession, hasReachedEnd, reducePracticeSession } from "../domain/typing";
import type { PracticeSession, TypingScore } from "../domain/typing";

export type PracticeState =
  | { screen: "menu"; selected: string | null }
  | { screen: "library"; selected: string | null }
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

export type AppAction =
  | { type: "start"; activity: Activity | ArticleActivity }
  | { type: "open-library" }
  | { type: "input-changed"; input: string; at: number }
  | { type: "submit"; at: number }
  | { type: "position-key"; key: PositionKey; at: number }
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
  if (action.type === "open-library") return { screen: "library", selected: null };
  if (action.type === "start") return startActivity(action.activity);
  if (state.screen === "menu") return state;
  if (state.screen === "library") {
    return action.type === "return-to-menu" ? { screen: "menu", selected: libraryEntry.id } : state;
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

export function usePracticeState() {
  return useReducer(reducePracticeState, { screen: "menu", selected: null });
}
