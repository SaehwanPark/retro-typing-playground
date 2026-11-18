import { useEffect, useState } from "react";
import type { TextLesson } from "../content/lessons";
import { calculateTypingScore, splitCharacters } from "../domain/typing";
import type { PracticeSession, TypingScore } from "../domain/typing";
import { TypingInput } from "./TypingInput";
import { Scoreboard } from "./Scoreboard";

type PracticeViewProps = {
  lesson: TextLesson;
  session: PracticeSession;
  previous: TypingScore | null;
  onInput: (input: string, at: number) => void;
  onSubmit: (at: number) => void;
  onFinish: () => void;
  onBack: () => void;
};

export function PracticeView({ lesson, session, previous, onInput, onSubmit, onFinish, onBack }: PracticeViewProps) {
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
      <h1 lang={lesson.language}>{lesson.title}</h1>
      <div className="target">
        <div className="target-label"><strong>제시문</strong><span>{typed.length} / {target.length}자</span></div>
        <p id="typing-target" aria-label={lesson.text} lang={lesson.language}>
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
          language={lesson.language}
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
