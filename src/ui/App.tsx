import { usePracticeState } from "../app/usePractice";
import { activities } from "../content/lessons";
import { ActivityMenu } from "./ActivityMenu";
import { PositionView } from "./PositionView";
import { PracticeView } from "./PracticeView";
import { ResultView } from "./ResultView";

export function App() {
  const [state, dispatch] = usePracticeState();
  const back = () => dispatch({ type: "return-to-menu" });

  return (
    <main className="shell">
      <header className="masthead">
        <span className="brand"><span aria-hidden="true">▰</span> Retro Typing Playground</span>
        <span className="local-status"><span aria-hidden="true" /> 로컬 연습</span>
      </header>

      {state.screen === "menu" && (
        <ActivityMenu
          activities={activities}
          selected={state.selected}
          onStart={(activity) => dispatch({ type: "start", activity })}
        />
      )}

      {state.screen === "practice" && (
        <PracticeView
          key={state.round}
          lesson={state.lesson}
          session={state.session}
          previous={state.previous}
          onInput={(input, at) => dispatch({ type: "input-changed", input, at })}
          onSubmit={(at) => dispatch({ type: "submit", at })}
          onFinish={() => dispatch({ type: "finish" })}
          onBack={back}
        />
      )}

      {state.screen === "positions" && (
        <PositionView
          activity={state.activity}
          session={state.session}
          onKey={(key, at) => dispatch({ type: "position-key", key, at })}
          onBack={back}
        />
      )}

      {state.screen === "result" && (
        <ResultView
          title={state.activity.kind === "sentence" ? "직전 문장" : state.activity.label}
          score={state.score}
          showSpeed={state.activity.kind !== "position"}
          onRetry={() => dispatch({ type: "retry" })}
          onBack={back}
        />
      )}
    </main>
  );
}
