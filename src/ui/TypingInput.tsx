import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { hasReachedEnd, insertSpaceAtSelection } from "../domain/typing";
import { useFocus } from "./useFocus";

type TypingInputProps = {
  language: "ko" | "en";
  target: string;
  onInput: (value: string, at: number) => void;
  onSubmit: () => void;
  onSpaceSubmit: (value: string, at: number) => void;
  onBack: () => void;
  onBlockedEdit?: () => void;
};

const imeShortcuts = new Set<string>();

if (typeof window !== "undefined") {
  window.addEventListener("keyup", (event) => {
    imeShortcuts.delete(physicalKeyCode(event.key, event.code));
  });
  window.addEventListener("blur", () => imeShortcuts.clear());
}

function physicalKeyCode(key: string, code: string): string {
  return key === " " || key === "Spacebar" || code === "Space" ? "Space" : code || key;
}

export function TypingInput({ language, target, onInput, onSubmit, onSpaceSubmit, onBack, onBlockedEdit }: TypingInputProps) {
  const field = useFocus<HTMLInputElement>();
  const composing = useRef(false);
  const spacePressedDuringComposition = useRef(false);
  const pendingCompositionSpace = useRef<{ input: string; caret: number } | null>(null);
  const confirmed = useRef("");

  function commit(value: string) {
    if (confirmed.current === value) return;
    confirmed.current = value;
    onInput(value, performance.now());
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    const native = event.nativeEvent;
    const code = physicalKeyCode(event.key, event.code);
    const spaceKey = code === "Space";
    if (imeShortcuts.has(code)) {
      event.preventDefault();
      return;
    }
    // Some browsers report isComposing=false on the key that ends an IME edit.
    if (composing.current || native.isComposing || native.keyCode === 229) {
      if (event.key === "Enter" || event.key === "Escape" || code === "Enter" ||
          code === "NumpadEnter" || spaceKey) {
        imeShortcuts.add(code);
      }
      if (spaceKey) spacePressedDuringComposition.current = true;
      return;
    }
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
    }
    if (spaceKey && hasReachedEnd(target, event.currentTarget.value)) {
      event.preventDefault();
      onSpaceSubmit(event.currentTarget.value, performance.now());
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
        const value = event.currentTarget.value;
        if (!spacePressedDuringComposition.current) {
          commit(value);
          return;
        }

        spacePressedDuringComposition.current = false;
        const at = performance.now();
        if (hasReachedEnd(target, value)) {
          confirmed.current = value;
          pendingCompositionSpace.current = {
            input: value,
            caret: event.currentTarget.selectionStart ?? value.length,
          };
          onSpaceSubmit(value, at);
          return;
        }

        const insertion = insertSpaceAtSelection(
          value,
          event.currentTarget.selectionStart ?? value.length,
          event.currentTarget.selectionEnd ?? value.length,
        );
        event.currentTarget.value = insertion.input;
        event.currentTarget.setSelectionRange(insertion.caret, insertion.caret);
        pendingCompositionSpace.current = { input: insertion.input, caret: insertion.caret };
        commit(insertion.input);
      }}
      onBeforeInput={(event) => {
        const native = event.nativeEvent as InputEvent;
        const pending = pendingCompositionSpace.current;
        if (pending && native.inputType === "insertText" && native.data === " ") {
          // Chrome may deliver the ending Space as text after compositionend.
          event.preventDefault();
          pendingCompositionSpace.current = null;
        }
      }}
      onInput={(event) => {
        const native = event.nativeEvent as InputEvent;
        if (composing.current || native.isComposing) return;

        const pending = pendingCompositionSpace.current;
        if (pending && native.inputType === "insertText" && native.data === " ") {
          const duplicate = insertSpaceAtSelection(pending.input, pending.caret, pending.caret).input;
          if (event.currentTarget.value === duplicate) {
            event.currentTarget.value = pending.input;
            event.currentTarget.setSelectionRange(pending.caret, pending.caret);
            pendingCompositionSpace.current = null;
            return;
          }
        }
        pendingCompositionSpace.current = null;
        commit(event.currentTarget.value);
      }}
      onKeyDown={handleKey}
      onKeyUp={(event) => {
        const code = physicalKeyCode(event.key, event.code);
        imeShortcuts.delete(code);
        if (code === "Space") pendingCompositionSpace.current = null;
      }}
      onBlur={() => {
        spacePressedDuringComposition.current = false;
        pendingCompositionSpace.current = null;
      }}
      onPaste={(event) => {
        event.preventDefault();
        onBlockedEdit?.();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onBlockedEdit?.();
      }}
    />
  );
}
