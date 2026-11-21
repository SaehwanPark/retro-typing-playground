import type { TypingScore } from "../domain/typing";
import type { TypingSpeedUnit } from "../domain/typingSpeed";
import type { InterfaceText } from "../content/interfaceText";
import type { Language } from "../content/lessons";
import { Scoreboard } from "./Scoreboard";
import { useFocus } from "./useFocus";

type ResultViewProps = {
  title: string;
  progress?: string | undefined;
  score: TypingScore;
  showSpeed: boolean;
  comparison?: TypingScore | undefined;
  language: Language;
  speedUnit: TypingSpeedUnit;
  backLabel?: string;
  /**
   * Word drills finish one word at a time, so their result leads with the next word.
   * Other modes complete the whole activity and lead with repeating it.
   */
  onContinue?: () => void;
  continueLabel?: string;
  onRetry: () => void;
  onBack: () => void;
  copy: InterfaceText;
};

export function ResultView({
  title, progress, score, showSpeed, comparison, language, speedUnit, backLabel, onContinue, continueLabel, onRetry, onBack, copy,
}: ResultViewProps) {
  const heading = useFocus<HTMLHeadingElement>();
  const destination = backLabel ?? copy.menu;
  const advance = onContinue ?? onRetry;

  return (
    <section className="screen" onKeyDown={(event) => {
      if (event.nativeEvent.isComposing || event.repeat) return;
      if (event.key === "Escape") onBack();
      if (event.key === "Enter" && event.target === heading.current) advance();
    }}>
      <h1 ref={heading} tabIndex={-1} aria-describedby="result-title result-hint">{copy.practiceComplete}</h1>
      <p id="result-title" className="lede">{title}</p>
      {progress && <p className="result-progress">{progress}</p>}
      <Scoreboard score={score} label={copy.thisResult} showSpeed={showSpeed} language={language} speedUnit={speedUnit} showTime copy={copy} />
      {comparison && (
        <section className="previous-score" aria-labelledby="comparison-title">
          <h2 id="comparison-title">{copy.sameModePrevious}</h2>
          <Scoreboard score={comparison} label={copy.previousResult} showSpeed={showSpeed} language={language} speedUnit={speedUnit} showTime copy={copy} />
        </section>
      )}
      <div className="result-actions">
        {onContinue ? (
          <>
            <button type="button" className="button" onClick={onContinue}>{continueLabel ?? copy.nextWord}</button>
            <button type="button" className="button secondary" onClick={onRetry}>{copy.practiceAgain}</button>
          </>
        ) : (
          <button type="button" className="button" onClick={onRetry}>{copy.practiceAgain}</button>
        )}
        <button type="button" className="button secondary" onClick={onBack}>{copy.returnTo(destination)}</button>
      </div>
      <p className="keys" id="result-hint">
        <kbd>Enter</kbd> {onContinue ? continueLabel ?? copy.nextWord : copy.practiceAgain}
        {" "}<kbd>Esc</kbd> {destination}
      </p>
    </section>
  );
}
