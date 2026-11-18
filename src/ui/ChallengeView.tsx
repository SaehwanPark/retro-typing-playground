import { useEffect, useReducer, useState } from "react";
import { challengeWords } from "../content/challengeWords";
import { advanceChallenge, challengeDurationMs, targetWord } from "../domain/challenge";
import type { ChallengeAction, ChallengeState } from "../domain/challenge";
import { TypingInput } from "./TypingInput";
import { useFocus } from "./useFocus";

type ChallengeViewProps = { onBack: () => void };

function reduce(state: ChallengeState, action: ChallengeAction): ChallengeState {
  return advanceChallenge(challengeWords, state, action);
}

export function ChallengeView({ onBack }: ChallengeViewProps) {
  const [state, dispatch] = useReducer(reduce, { phase: "ready" });
  const [blocked, setBlocked] = useState(false);
  const startButton = useFocus<HTMLButtonElement>(state.phase === "ready");
  const result = useFocus<HTMLHeadingElement>(state.phase === "finished");
  const running = state.phase === "running";
  const start = () => {
    setBlocked(false);
    dispatch({ type: "start", at: performance.now() });
  };
  const stop = () => dispatch({ type: "stop", at: performance.now() });
  const submit = () => {
    setBlocked(false);
    dispatch({ type: "submit", at: performance.now() });
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => dispatch({ type: "tick", at: performance.now() }), 150);
    return () => window.clearInterval(timer);
  }, [running]);

  if (state.phase === "ready") {
    return (
      <section className="screen" onKeyDown={(event) => {
        if (event.key === "Escape") onBack();
      }}>
        <button className="back" type="button" onClick={onBack}>← 메뉴</button>
        <h1>30초 낱말 도전</h1>
        <p className="lede">한글 낱말을 그대로 입력하고 Enter를 누르세요. 30초 동안 맞힌 낱말 수를 셉니다.</p>
        <button ref={startButton} className="button" type="button" onClick={start}>도전 시작</button>
      </section>
    );
  }

  if (state.phase === "finished") {
    return (
      <section className="screen" onKeyDown={(event) => {
        if (event.repeat || event.nativeEvent.isComposing) return;
        if (event.key === "Escape") onBack();
        if (event.key === "Enter" && event.target === result.current) start();
      }}>
        <h1 ref={result} tabIndex={-1} aria-describedby="challenge-outcome">도전 결과</h1>
        <p className="lede" id="challenge-outcome">{state.timedOut ? "시간이 끝났습니다." : "도전을 중단했습니다."}</p>
        <dl className="scores">
          <div><dt>맞힌 낱말</dt><dd>{state.solved}개</dd></div>
          <div><dt>경과 시간</dt><dd>{(state.elapsedMs / 1000).toFixed(1)}초</dd></div>
        </dl>
        <div className="result-actions">
          <button className="button" type="button" onClick={start}>다시 도전</button>
          <button className="button secondary" type="button" onClick={onBack}>메뉴로 돌아가기</button>
        </div>
        <p className="keys"><kbd>Enter</kbd> 다시 도전 <kbd>Esc</kbd> 메뉴</p>
      </section>
    );
  }

  const remaining = Math.max(0, challengeDurationMs - (state.now - state.startedAt));
  return (
    <section className="screen">
      <h1>30초 낱말 도전</h1>
      <div className="target challenge-target">
        <div className="target-label">
          <span>남은 시간 {Math.ceil(remaining / 1_000)}초</span>
          <span>맞힌 낱말 {state.solved}개</span>
        </div>
        <progress aria-label="남은 도전 시간" max={challengeDurationMs} value={remaining} />
        <p id="typing-target">{targetWord(challengeWords, state.solved)}</p>
      </div>
      <div className="entry">
        <label htmlFor="typing-input">따라 입력하기</label>
        <TypingInput
          key={state.solved}
          language="ko"
          onInput={(input, at) => {
            setBlocked(false);
            dispatch({ type: "input", input, at });
          }}
          onSubmit={submit}
          onBack={stop}
          onBlockedEdit={() => setBlocked(true)}
        />
      </div>
      <div className="practice-actions">
        <p className="keys" id="typing-hint"><kbd>Enter</kbd> 제출 <kbd>Esc</kbd> 중단</p>
        <div className="result-actions">
          <button className="button" type="button" onClick={submit}>제출</button>
          <button className="button secondary" type="button" onClick={stop}>중단</button>
        </div>
      </div>
      <p className="notice" role="status">
        {blocked ? "낱말은 키보드로 직접 입력하세요." : state.missed ? "제시된 낱말과 같은지 확인하세요." : ""}
      </p>
    </section>
  );
}
