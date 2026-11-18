import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Language } from "../content/lessons";
import type { InterfaceText } from "../content/interfaceText";
import { calculateTypingScore, splitCharacters } from "../domain/typing";
import type { PracticeSession, TypingScore } from "../domain/typing";
import type { TypingSpeedUnit } from "../domain/typingSpeed";
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
  speedUnit: TypingSpeedUnit;
  scoreAt?: (now: number) => TypingScore;
  backLabel?: string;
  copy: InterfaceText;
  onInput: (input: string, at: number) => void;
  onSubmit: (at: number, input?: string) => void;
  onFinish?: () => void;
  onBack: () => void;
};

export function PracticeView({
  title, language, prompt, session, previous, context, startedAt = session.startedAt, speedUnit,
  scoreAt, backLabel, onInput, onSubmit, onFinish, onBack, copy,
}: PracticeViewProps) {
  const [now, setNow] = useState(() => performance.now());
  const [notice, setNotice] = useState("");
  const target = splitCharacters(prompt);
  const typed = splitCharacters(session.input);
  const score = scoreAt ? scoreAt(now) : calculateTypingScore(prompt, session, now);

  useEffect(() => {
    if (startedAt === null) return;
    const timer = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  function submit(input?: string, at = performance.now()) {
    const inputToSubmit = input ?? session.input;
    const remainingAtSubmit = target.length - splitCharacters(inputToSubmit).length;
    if (remainingAtSubmit > 0) {
      setNotice(copy.remainingCharacters(remainingAtSubmit));
      return;
    }
    onSubmit(at, input);
  }

  return (
    <section className="screen">
      <button className="back" type="button" onClick={onBack}>← {backLabel ?? copy.menu}</button>
      <h1 lang={language}>{title}</h1>
      {context}
      <div className="target">
        <div className="target-label"><strong>{copy.currentPrompt}</strong><span>{typed.length} / {target.length}</span></div>
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
        <label htmlFor="typing-input">{copy.followAlong}</label>
        <TypingInput
          language={language}
          target={prompt}
          onInput={(input, at) => {
            setNow(at);
            setNotice("");
            onInput(input, at);
          }}
          onSubmit={submit}
          onSpaceSubmit={submit}
          onBack={onBack}
          onBlockedEdit={() => setNotice(copy.blockedPracticeInput)}
        />
      </div>
      <div className="practice-actions">
        <p className="keys" id="typing-hint">
          <kbd>Enter</kbd> {copy.submit}
          {" · "}<kbd>Space</kbd> {copy.spaceSubmitHint}
          {" "}<kbd>Esc</kbd> {backLabel ?? copy.menu}
        </p>
        <button type="button" className="button" onClick={() => submit()}>{copy.submit}</button>
      </div>
      <p className="notice" role="status">{notice}</p>
      <Scoreboard label={copy.currentScore} score={score} speedUnit={speedUnit} copy={copy} />
      {previous && (
        <section className="previous-score" aria-labelledby="previous-title">
          <h2 id="previous-title">{copy.previousSentence}</h2>
          <Scoreboard label={copy.previousScore} score={previous} speedUnit={speedUnit} copy={copy} />
          <button type="button" className="button secondary" onClick={onFinish}>{copy.finishPractice}</button>
        </section>
      )}
    </section>
  );
}
