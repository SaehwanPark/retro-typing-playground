import {
  challengeEntry,
  completionTime,
  freePracticeEntry,
  historyEntry,
  usePracticeState,
} from "../app/usePractice";
import { useHistory } from "../app/useHistory";
import { useTextSize } from "../app/useTextSize";
import { activities } from "../content/lessons";
import { articles, libraryEntry } from "../content/articles";
import { splitCharacters } from "../domain/typing";
import { comparableRecord } from "../domain/history";
import { ActivityMenu } from "./ActivityMenu";
import { ArticleView } from "./ArticleView";
import { ChallengeView } from "./ChallengeView";
import { DisplaySettings } from "./DisplaySettings";
import { HistoryView } from "./HistoryView";
import { FreePracticeView } from "./FreePracticeView";
import { PositionView } from "./PositionView";
import { PracticeView } from "./PracticeView";
import { ResultView } from "./ResultView";

const mainActivities = [
  ...activities,
  ...(articles.length ? [{ ...libraryEntry, kind: "library" as const }] : []),
  challengeEntry,
  freePracticeEntry,
  historyEntry,
];
const articleList = articles.map((article) => ({
  ...article,
  detail: `${article.lines.reduce((total, line) => total + splitCharacters(line).length, 0)}자`,
}));

export function App() {
  const { state, pending, latest, dispatch, acknowledge } = usePracticeState();
  const history = useHistory(pending, acknowledge);
  const textSize = useTextSize();
  const back = () => dispatch({ type: "return-to-menu" });
  const onInput = (input: string, at: number) => dispatch({ type: "input-changed", input, at });
  const onSubmit = (at: number) => dispatch({ type: "submit", ...completionTime(at) });

  return (
    <main className="shell" data-text-size={textSize.size}>
      <header className="masthead">
        <span className="brand"><span aria-hidden="true">▰</span> Retro Typing Playground</span>
        <DisplaySettings size={textSize.size} onChange={textSize.change} notice={textSize.notice} />
      </header>

      {state.screen === "menu" && (
        <ActivityMenu
          title="타자 연습"
          activities={mainActivities}
          selected={state.selected}
          onStart={(activity) => {
            if (activity.kind === "library") dispatch({ type: "open-library" });
            else if (activity.kind === "challenge") dispatch({ type: "open-challenge" });
            else if (activity.kind === "free-practice") dispatch({ type: "open-free-practice" });
            else if (activity.kind === "history") dispatch({ type: "open-history" });
            else dispatch({ type: "start", activity });
          }}
        />
      )}

      {state.screen === "challenge" && <ChallengeView onBack={back} />}
      {state.screen === "free-practice" && <FreePracticeView onBack={back} />}

      {state.screen === "history" && (
        <HistoryView records={history.records} onClear={history.reset} onBack={back} />
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
          onKey={(key, at) => dispatch({ type: "position-key", key, ...completionTime(at) })}
          onBack={back}
        />
      )}

      {state.screen === "result" && (
        <ResultView
          title={state.activity.kind === "sentence" ? "직전 문장" : state.activity.label}
          score={state.score}
          showSpeed={state.activity.kind !== "position"}
          comparison={latest ? comparableRecord(latest, history.records)?.score : undefined}
          backLabel={state.activity.kind === "article" ? "장문 목록" : "메뉴"}
          onRetry={() => dispatch({ type: "retry" })}
          onBack={back}
        />
      )}

      {history.notice && <p className="storage-notice" role="status">{history.notice}</p>}
    </main>
  );
}
