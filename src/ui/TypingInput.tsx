import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { useFocus } from "./useFocus";

type TypingInputProps = {
  language: "ko" | "en";
  onInput: (value: string, at: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  onBlockedEdit: () => void;
};

export function TypingInput({ language, onInput, onSubmit, onBack, onBlockedEdit }: TypingInputProps) {
  const field = useFocus<HTMLInputElement>();
  const composing = useRef(false);
  const confirmed = useRef("");

  function commit(value: string) {
    if (confirmed.current === value) return;
    confirmed.current = value;
    onInput(value, performance.now());
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    const native = event.nativeEvent;
    // Some browsers report isComposing=false on the key that ends an IME edit.
    if (composing.current || native.isComposing || native.keyCode === 229) return;
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
    }
  }

  return (
    <input
      id="typing-input"
      ref={field}
      type="text"
      lang={language}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      aria-describedby="typing-target typing-hint"
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={(event) => {
        composing.current = false;
        commit(event.currentTarget.value);
      }}
      onInput={(event) => {
        const native = event.nativeEvent as InputEvent;
        if (!composing.current && !native.isComposing) commit(event.currentTarget.value);
      }}
      onKeyDown={handleKey}
      onPaste={(event) => {
        event.preventDefault();
        onBlockedEdit();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onBlockedEdit();
      }}
    />
  );
}
