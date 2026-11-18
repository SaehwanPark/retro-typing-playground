import type { ArticleActivity } from "../content/articles";
import { scoreArticle } from "../domain/articlePractice";
import type { ArticleSession } from "../domain/articlePractice";
import { PracticeView } from "./PracticeView";
import type { InterfaceText } from "../content/interfaceText";
import type { TypingSpeedUnit } from "../domain/typingSpeed";

type ArticleViewProps = {
  activity: ArticleActivity;
  session: ArticleSession;
  onInput: (input: string, at: number) => void;
  onSubmit: (at: number) => void;
  onBack: () => void;
  copy: InterfaceText;
  speedUnit: TypingSpeedUnit;
};

export function ArticleView({ activity, session, onInput, onSubmit, onBack, copy, speedUnit }: ArticleViewProps) {
  const index = session.lineIndex;
  const target = activity.lines[index];
  if (!target) return null;

  const prior = activity.lines[index - 1];
  const next = activity.lines[index + 1];
  return (
    <PracticeView
      key={index}
      title={activity.label}
      language={activity.language}
      prompt={target}
      session={session.line}
      startedAt={session.startedAt}
      scoreAt={(now) => scoreArticle(target, session, now)}
      speedUnit={speedUnit}
      backLabel={copy.chooseArticle}
      copy={copy}
      context={
        <div className="article-progress" lang={activity.language}>
          <p><strong>{copy.articleCurrentLine}</strong> {index + 1} / {activity.lines.length}</p>
          {prior && <p><strong>{copy.articleCompletedLine}</strong> {prior}</p>}
          {next && <p><strong>{copy.articleNextLine}</strong> {next}</p>}
        </div>
      }
      onInput={onInput}
      onSubmit={onSubmit}
      onBack={onBack}
    />
  );
}
