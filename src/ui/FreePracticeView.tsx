import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { useFocus } from "./useFocus";
import type { InterfaceText } from "../content/interfaceText";

type FreePracticeViewProps = { onBack: () => void; copy: InterfaceText };

export function FreePracticeView({ onBack, copy }: FreePracticeViewProps) {
  const editor = useFocus<HTMLTextAreaElement>();
  const composing = useRef(false);
  const composingEscapes = useRef(new Set<string>());

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    const code = event.code || event.key;
    const native = event.nativeEvent;
    if (composing.current || native.isComposing || native.keyCode === 229) {
      if (event.key === "Escape") composingEscapes.current.add(code);
      return;
    }
    if (composingEscapes.current.has(code)) {
      event.preventDefault();
      return;
    }
    if (
      event.key !== "Escape" || event.repeat || event.altKey || event.ctrlKey ||
      event.metaKey || event.shiftKey
    ) return;
    event.preventDefault();
    onBack();
  }

  function handleKeyUp(event: KeyboardEvent<HTMLElement>) {
    composingEscapes.current.delete(event.code || event.key);
  }

  return (
    <section
      className="screen free-practice"
      aria-labelledby="free-practice-title"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <button className="back" type="button" onClick={onBack}>{copy.backToMenu}</button>
      <h1 id="free-practice-title">{copy.freePractice}</h1>
      <label className="free-practice-label" htmlFor="free-practice-input">{copy.freePracticeLabel}</label>
      <textarea
        id="free-practice-input"
        ref={editor}
        className="free-practice-editor"
        rows={12}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-describedby="free-practice-hint"
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={() => { composing.current = false; }}
        onBlur={() => { composingEscapes.current.clear(); }}
      />
      <p className="keys" id="free-practice-hint">
        <kbd>Enter</kbd> {copy.newline} <kbd>Esc</kbd> {copy.menu}
        <span className="capture-disclosure">{copy.captureDisclosure}</span>
      </p>
    </section>
  );
}
