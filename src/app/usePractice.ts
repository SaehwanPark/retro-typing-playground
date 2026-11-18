import { useReducer } from "react";
import type { Activity, PositionActivity, TextActivity, TextLesson } from "../content/lessons";
import { createPositionSession, pressPosition, scorePositions } from "../domain/positions";
import type { PositionKey, PositionSession } from "../domain/positions";
import { calculateTypingScore, createPracticeSession, hasReachedEnd, reducePracticeSession } from "../domain/typing";
import type { PracticeSession, TypingScore } from "../domain/typing";

export type PracticeState =
  | { screen: "menu"; selected: string | null }
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
  | { screen: "result"; activity: Activity; score: TypingScore };

export type AppAction =
  | { type: "start"; activity: Activity }
  | { type: "input-changed"; input: string; at: number }
  | { type: "submit"; at: number }
  | { type: "position-key"; key: PositionKey; at: number }
  | { type: "finish" }
  | { type: "return-to-menu" }
  | { type: "retry" };

function startActivity(activity: Activity): PracticeState {
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

export function reducePracticeState(state: PracticeState, action: AppAction): PracticeState {
  if (action.type === "start") return startActivity(action.activity);
  if (state.screen === "menu") return state;
  if (action.type === "return-to-menu") return { screen: "menu", selected: state.activity.id };
  if (state.screen === "result" && action.type === "retry") return startActivity(state.activity);
  if (state.screen === "practice") return reduceTextPractice(state, action);

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
