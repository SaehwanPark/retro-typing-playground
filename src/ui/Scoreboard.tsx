import type { TypingScore } from "../domain/typing";

type ScoreboardProps = { score: TypingScore; label?: string; showTime?: boolean; showSpeed?: boolean };

export function Scoreboard({ score, label, showTime = false, showSpeed = true }: ScoreboardProps) {
  return (
    <dl className="scores" aria-label={label}>
      <div><dt>정확도</dt><dd>{score.accuracy === null ? "—" : `${Math.round(score.accuracy)}%`}</dd></div>
      {showSpeed && (
        <div><dt>글자/분</dt><dd>{score.charactersPerMinute === null ? "—" : Math.round(score.charactersPerMinute)}</dd></div>
      )}
      {showTime && score.elapsedMs !== null && (
        <div><dt>경과 시간</dt><dd>{(score.elapsedMs / 1000).toFixed(1)}초</dd></div>
      )}
    </dl>
  );
}
