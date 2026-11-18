import { useEffect, useState } from "react";
import type { KoreanShortLesson } from "../content/lessons";
import { calculateTypingScore, splitCharacters } from "../domain/typing";
import type { PracticeSession } from "../domain/typing";
import { TypingInput } from "./TypingInput";
import { Scoreboard } from "./Scoreboard";

type PracticeViewProps = {
  lesson: KoreanShortLesson;
  session: PracticeSession;
  onInput: (input: string, at: number) => void;
  onSubmit: (at: number) => void;
  onBack: () => void;
};

export function PracticeView({ lesson, session, onInput, onSubmit, onBack }: PracticeViewProps) {
  const [now, setNow] = useState(() => performance.now());
  const [notice, setNotice] = useState("");
  const target = splitCharacters(lesson.text);
  const typed = splitCharacters(session.input);
  const remaining = target.length - typed.length;
  const score = calculateTypingScore(lesson.text, session, now);

  useEffect(() => {
    if (session.startedAt === null) return;
    const timer = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(timer);
  }, [session.startedAt]);

  function submit() {
    if (remaining > 0) {
      setNotice(`제시문이 ${remaining}자 남았습니다.`);
      return;
    }
    onSubmit(performance.now());
  }

  return (
    <section className="screen">
      <button className="back" type="button" onClick={onBack}>← 메뉴</button>
      <h1>{lesson.title}</h1>
      <div className="target">
        <div className="target-label"><strong>제시문</strong><span>{typed.length} / {target.length}자</span></div>
        <p id="typing-target" aria-label={lesson.text}>
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
        <p className="keys" id="typing-hint"><kbd>Enter</kbd> 제출 <kbd>Esc</kbd> 메뉴</p>
        <button type="button" className="button" onClick={submit}>제출</button>
      </div>
      <p className="notice" role="status">{notice}</p>
      <Scoreboard score={score} />
    </section>
  );
}
