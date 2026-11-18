import type { TypingScore } from "../domain/typing";
import type { TypingSpeedUnit } from "../domain/typingSpeed";
import type { InterfaceText } from "../content/interfaceText";
import type { Language } from "../content/lessons";
import { Scoreboard } from "./Scoreboard";
import { useFocus } from "./useFocus";

type ResultViewProps = {
  title: string;
  score: TypingScore;
  showSpeed: boolean;
  comparison?: TypingScore | undefined;
  language: Language;
  speedUnit: TypingSpeedUnit;
  backLabel?: string;
  onRetry: () => void;
  onBack: () => void;
  copy: InterfaceText;
};

export function ResultView({ title, score, showSpeed, comparison, language, speedUnit, backLabel, onRetry, onBack, copy }: ResultViewProps) {
  const heading = useFocus<HTMLHeadingElement>();
  const destination = backLabel ?? copy.menu;

  return (
    <section className="screen" onKeyDown={(event) => {
      if (event.nativeEvent.isComposing || event.repeat) return;
      if (event.key === "Escape") onBack();
      if (event.key === "Enter" && event.target === heading.current) onRetry();
    }}>
      <h1 ref={heading} tabIndex={-1} aria-describedby="result-title result-hint">{copy.practiceComplete}</h1>
      <p id="result-title" className="lede">{title}</p>
      <Scoreboard score={score} label={copy.thisResult} showSpeed={showSpeed} language={language} speedUnit={speedUnit} showTime copy={copy} />
      {comparison && (
        <section className="previous-score" aria-labelledby="comparison-title">
          <h2 id="comparison-title">{copy.sameModePrevious}</h2>
          <Scoreboard score={comparison} label={copy.previousResult} showSpeed={showSpeed} language={language} speedUnit={speedUnit} showTime copy={copy} />
        </section>
      )}
      <div className="result-actions">
        <button type="button" className="button" onClick={onRetry}>{copy.practiceAgain}</button>
        <button type="button" className="button secondary" onClick={onBack}>{copy.returnTo(destination)}</button>
      </div>
      <p className="keys" id="result-hint"><kbd>Enter</kbd> {copy.practiceAgain} <kbd>Esc</kbd> {destination}</p>
    </section>
  );
}
