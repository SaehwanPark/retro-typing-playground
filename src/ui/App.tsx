import { usePracticeState } from "../app/usePractice";
import { activities } from "../content/lessons";
import { articles, libraryEntry } from "../content/articles";
import { splitCharacters } from "../domain/typing";
import { ActivityMenu } from "./ActivityMenu";
import { ArticleView } from "./ArticleView";
import { PositionView } from "./PositionView";
import { PracticeView } from "./PracticeView";
import { ResultView } from "./ResultView";

const mainActivities = [
  ...activities,
  ...(articles.length ? [{ ...libraryEntry, kind: "library" as const }] : []),
];
const articleList = articles.map((article) => ({
  ...article,
  detail: `${article.lines.reduce((total, line) => total + splitCharacters(line).length, 0)}자`,
}));

export function App() {
  const [state, dispatch] = usePracticeState();
  const back = () => dispatch({ type: "return-to-menu" });
  const onInput = (input: string, at: number) => dispatch({ type: "input-changed", input, at });
  const onSubmit = (at: number) => dispatch({ type: "submit", at });

  return (
    <main className="shell">
      <header className="masthead">
        <span className="brand"><span aria-hidden="true">▰</span> Retro Typing Playground</span>
        <span className="local-status"><span aria-hidden="true" /> 로컬 연습</span>
      </header>

      {state.screen === "menu" && (
        <ActivityMenu
          title="타자 연습"
          activities={mainActivities}
          selected={state.selected}
          onStart={(activity) => {
            if (activity.kind === "library") dispatch({ type: "open-library" });
            else dispatch({ type: "start", activity });
          }}
        />
      )}

      {state.screen === "library" && (
        <ActivityMenu
          title="장문 고르기"
          activities={articleList}
          selected={state.selected}
          onStart={(activity) => dispatch({ type: "start", activity })}
          onBack={back}
        />
      )}

      {state.screen === "practice" && (
        <PracticeView
          key={state.round}
          title={state.lesson.title}
          prompt={state.lesson.text}
          language={state.lesson.language}
          session={state.session}
          previous={state.previous}
          onInput={onInput}
          onSubmit={onSubmit}
          onFinish={() => dispatch({ type: "finish" })}
          onBack={back}
        />
      )}

      {state.screen === "article" && (
        <ArticleView activity={state.activity} session={state.session} onInput={onInput} onSubmit={onSubmit} onBack={back} />
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
          backLabel={state.activity.kind === "article" ? "장문 목록" : "메뉴"}
          onRetry={() => dispatch({ type: "retry" })}
          onBack={back}
        />
      )}
    </main>
  );
}
