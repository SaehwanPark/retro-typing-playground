import type { TypingScore } from "../domain/typing";
import type { InterfaceText } from "../content/interfaceText";

type ScoreboardProps = { score: TypingScore; label?: string; showTime?: boolean; showSpeed?: boolean; copy: InterfaceText };

export function Scoreboard({ score, label, showTime = false, showSpeed = true, copy }: ScoreboardProps) {
  return (
    <dl className="scores" aria-label={label}>
      <div><dt>{copy.accuracy}</dt><dd>{score.accuracy === null ? "—" : `${Math.round(score.accuracy)}%`}</dd></div>
      {showSpeed && (
        <div><dt>{copy.speedCpm}</dt><dd>{score.charactersPerMinute === null ? "—" : Math.round(score.charactersPerMinute)}</dd></div>
      )}
      {showTime && score.elapsedMs !== null && (
        <div><dt>{copy.elapsedTime}</dt><dd>{copy.elapsedTimeValue((score.elapsedMs / 1000).toFixed(1))}</dd></div>
      )}
    </dl>
  );
}
