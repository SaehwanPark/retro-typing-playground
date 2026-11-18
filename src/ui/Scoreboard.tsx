import type { TypingScore } from "../domain/typing";
import { toDisplayedTypingSpeed } from "../domain/typingSpeed";
import type { TypingSpeedUnit } from "../domain/typingSpeed";
import type { InterfaceText } from "../content/interfaceText";
import type { Language } from "../content/lessons";

type ScoreboardProps = {
  score: TypingScore;
  label?: string;
  showTime?: boolean;
  showSpeed?: boolean;
  language: Language;
  speedUnit: TypingSpeedUnit;
  copy: InterfaceText;
};

export function Scoreboard({ score, label, showTime = false, showSpeed = true, language, speedUnit, copy }: ScoreboardProps) {
  const speed = toDisplayedTypingSpeed(score.charactersPerMinute, score.keystrokesPerMinute, language, speedUnit);
  return (
    <dl className="scores" aria-label={label}>
      <div><dt>{copy.accuracy}</dt><dd>{score.accuracy === null ? "—" : `${Math.round(score.accuracy)}%`}</dd></div>
      {showSpeed && (
        <div><dt>{copy.speedLabel(speedUnit, language)}</dt><dd>{speed === null ? "—" : Math.round(speed)}</dd></div>
      )}
      {showTime && score.elapsedMs !== null && (
        <div><dt>{copy.elapsedTime}</dt><dd>{copy.elapsedTimeValue((score.elapsedMs / 1000).toFixed(1))}</dd></div>
      )}
    </dl>
  );
}
