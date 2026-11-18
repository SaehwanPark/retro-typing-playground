import type { TypingScore } from "../domain/typing";
import { Scoreboard } from "./Scoreboard";
import { useFocus } from "./useFocus";

type ResultViewProps = {
  title: string;
  score: TypingScore;
  onRetry: () => void;
  onBack: () => void;
};

export function ResultView({ title, score, onRetry, onBack }: ResultViewProps) {
  const heading = useFocus<HTMLHeadingElement>();

  return (
    <section className="screen" onKeyDown={(event) => {
      if (event.nativeEvent.isComposing || event.repeat) return;
      if (event.key === "Escape") onBack();
      if (event.key === "Enter" && event.target === heading.current) onRetry();
    }}>
      <h1 ref={heading} tabIndex={-1} aria-describedby="result-title result-hint">연습 완료</h1>
      <p id="result-title" className="lede">{title}</p>
      <Scoreboard score={score} showTime />
      <div className="result-actions">
        <button type="button" className="button" onClick={onRetry}>다시 연습</button>
        <button type="button" className="button secondary" onClick={onBack}>메뉴로 돌아가기</button>
      </div>
      <p className="keys" id="result-hint"><kbd>Enter</kbd> 다시 연습 <kbd>Esc</kbd> 메뉴</p>
    </section>
  );
}
