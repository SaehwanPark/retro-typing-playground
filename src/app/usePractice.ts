import { useReducer } from "react";
import type { KoreanShortLesson } from "../content/lessons";
import {
  calculateTypingScore,
  createPracticeSession,
  hasReachedEnd,
  reducePracticeSession,
} from "../domain/typing";
import type { PracticeSession, TypingScore } from "../domain/typing";

export type PracticeState =
  | { screen: "menu" }
  | { screen: "practice"; lesson: KoreanShortLesson; session: PracticeSession }
  | { screen: "result"; lesson: KoreanShortLesson; score: TypingScore };

export type AppAction =
  | { type: "start"; lesson: KoreanShortLesson }
  | { type: "input-changed"; input: string; at: number }
  | { type: "submit"; at: number }
  | { type: "return-to-menu" }
  | { type: "retry" };

export function createInitialPracticeState(): PracticeState {
  return { screen: "menu" };
}

export function reducePracticeState(
  state: PracticeState,
  action: AppAction,
): PracticeState {
  if (action.type === "return-to-menu") {
    return { screen: "menu" };
  }

  if (action.type === "start") {
    return {
      screen: "practice",
      lesson: action.lesson,
      session: createPracticeSession(),
    };
  }

  if (action.type === "retry" && state.screen === "result") {
    return {
      screen: "practice",
      lesson: state.lesson,
      session: createPracticeSession(),
    };
  }

  if (state.screen !== "practice") {
    return state;
  }

  if (action.type === "input-changed") {
    return {
      ...state,
      session: reducePracticeSession(state.session, action),
    };
  }

  if (
    action.type === "submit" &&
    hasReachedEnd(state.lesson.text, state.session.input)
  ) {
    const session = reducePracticeSession(state.session, {
      type: "submitted",
      at: action.at,
    });

    return {
      screen: "result",
      lesson: state.lesson,
      score: calculateTypingScore(state.lesson.text, session, action.at),
    };
  }

  return state;
}

export function usePracticeState() {
  return useReducer(
    reducePracticeState,
    undefined,
    createInitialPracticeState,
  );
}
