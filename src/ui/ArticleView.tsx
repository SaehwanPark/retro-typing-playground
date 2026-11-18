import type { ArticleActivity } from "../content/articles";
import { scoreArticle } from "../domain/articlePractice";
import type { ArticleSession } from "../domain/articlePractice";
import { PracticeView } from "./PracticeView";

type ArticleViewProps = {
  activity: ArticleActivity;
  session: ArticleSession;
  onInput: (input: string, at: number) => void;
  onSubmit: (at: number) => void;
  onBack: () => void;
};

export function ArticleView({ activity, session, onInput, onSubmit, onBack }: ArticleViewProps) {
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
      backLabel="장문 목록"
      context={
        <div className="article-progress">
          <p><strong>현재 줄</strong> {index + 1} / {activity.lines.length}</p>
          {prior && <p><strong>완료한 줄</strong> {prior}</p>}
          {next && <p><strong>다음 줄</strong> {next}</p>}
        </div>
      }
      onInput={onInput}
      onSubmit={onSubmit}
      onBack={onBack}
    />
  );
}
