import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Language } from "../content/lessons";
import { calculateTypingScore, splitCharacters } from "../domain/typing";
import type { PracticeSession, TypingScore } from "../domain/typing";
import { TypingInput } from "./TypingInput";
import { Scoreboard } from "./Scoreboard";

type PracticeViewProps = {
  title: string;
  language: Language;
  prompt: string;
  session: PracticeSession;
  previous?: TypingScore | null;
  context?: ReactNode;
  startedAt?: number | null;
  scoreAt?: (now: number) => TypingScore;
  backLabel?: string;
  onInput: (input: string, at: number) => void;
  onSubmit: (at: number) => void;
  onFinish?: () => void;
  onBack: () => void;
};

export function PracticeView({
  title, language, prompt, session, previous, context, startedAt = session.startedAt,
  scoreAt, backLabel = "메뉴", onInput, onSubmit, onFinish, onBack,
}: PracticeViewProps) {
  const [now, setNow] = useState(() => performance.now());
  const [notice, setNotice] = useState("");
  const target = splitCharacters(prompt);
  const typed = splitCharacters(session.input);
  const remaining = target.length - typed.length;
  const score = scoreAt ? scoreAt(now) : calculateTypingScore(prompt, session, now);

  useEffect(() => {
    if (startedAt === null) return;
    const timer = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  function submit() {
    if (remaining > 0) {
      setNotice(`제시문이 ${remaining}자 남았습니다.`);
      return;
    }
    onSubmit(performance.now());
  }

  return (
    <section className="screen">
      <button className="back" type="button" onClick={onBack}>← {backLabel}</button>
      <h1 lang={language}>{title}</h1>
      {context}
      <div className="target">
        <div className="target-label"><strong>제시문</strong><span>{typed.length} / {target.length}자</span></div>
        <p id="typing-target" aria-label={prompt} lang={language}>
          {target.map((character, index) => {
            const status = index === typed.length ? "current" :
              index > typed.length ? "" : typed[index] === character ? "correct" : "wrong";
            return <span key={index} className={status} aria-hidden="true">{character}</span>;
          })}
          {typed.length > target.length && (
            <span className="wrong" aria-hidden="true">{typed.slice(target.length).join("")}</span>
          )}
        </p>
      </div>
      <div className="entry">
        <label htmlFor="typing-input">따라 입력하기</label>
        <TypingInput
          language={language}
          onInput={(input, at) => {
            setNow(at);
            setNotice("");
            onInput(input, at);
          }}
          onSubmit={submit}
          onBack={onBack}
          onBlockedEdit={() => setNotice("연습 문장은 키보드로 직접 입력하세요.")}
        />
      </div>
      <div className="practice-actions">
        <p className="keys" id="typing-hint"><kbd>Enter</kbd> 제출 <kbd>Esc</kbd> {backLabel}</p>
        <button type="button" className="button" onClick={submit}>제출</button>
      </div>
      <p className="notice" role="status">{notice}</p>
      <Scoreboard label="현재 점수" score={score} />
      {previous && (
        <section className="previous-score" aria-labelledby="previous-title">
          <h2 id="previous-title">직전 문장</h2>
          <Scoreboard label="직전 점수" score={previous} />
          <button type="button" className="button secondary" onClick={onFinish}>연습 마치기</button>
        </section>
      )}
    </section>
  );
}
