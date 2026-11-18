import { usePracticeState } from "../app/usePractice";
import { firstKoreanLesson } from "../content/lessons";
import { PracticeView } from "./PracticeView";
import { ResultView } from "./ResultView";
import { useFocus } from "./useFocus";

export function App() {
  const [state, dispatch] = usePracticeState();
  const startButton = useFocus<HTMLButtonElement>(state.screen === "menu");
  const back = () => dispatch({ type: "return-to-menu" });

  return (
    <main className="shell">
      <header className="masthead">
        <span className="brand"><span aria-hidden="true">▰</span> Retro Typing Playground</span>
        <span className="local-status"><span aria-hidden="true" /> 로컬 연습</span>
      </header>

      {state.screen === "menu" && (
        <section className="screen">
          <h1>타자 연습</h1>
          <p className="lede">한 문장을 따라 쓰고 정확도와 속도를 확인하세요.</p>
          <button
            className="lesson-button"
            ref={startButton}
            type="button"
            onClick={() => dispatch({ type: "start", lesson: firstKoreanLesson })}
          >
            <span><strong>한글 단문</strong><small>{firstKoreanLesson.title}</small></span>
            <span aria-hidden="true">↵</span>
          </button>
          <p className="keys"><kbd>Enter</kbd> 시작</p>
        </section>
      )}

      {state.screen === "practice" && (
        <PracticeView
          lesson={state.lesson}
          session={state.session}
          onInput={(input, at) => dispatch({ type: "input-changed", input, at })}
          onSubmit={(at) => dispatch({ type: "submit", at })}
          onBack={back}
        />
      )}

      {state.screen === "result" && (
        <ResultView
          title={state.lesson.title}
          score={state.score}
          onRetry={() => dispatch({ type: "retry" })}
          onBack={back}
        />
      )}
    </main>
  );
}
