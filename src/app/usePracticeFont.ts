import { useEffect, useRef, useState } from "react";
import {
  defaultPracticeFonts,
  practiceFontKey,
  readPracticeFonts,
  resetPracticeFonts,
  savePracticeFont,
} from "../storage/settingsStorage";
import type { PracticeFont, PracticeFonts } from "../storage/settingsStorage";
import type { Language } from "../content/lessons";

export function usePracticeFont(language: Language) {
  const [stored, setStored] = useState<PracticeFonts | null>(readPracticeFonts);
  const [temporary, setTemporary] = useState<PracticeFonts | null>(null);
  const [notice, setNotice] = useState("");
  const request = useRef(0);
  const font = (temporary ?? stored ?? defaultPracticeFonts)[language];

  useEffect(() => {
    document.documentElement.dataset.practiceFont = font;
  }, [font]);

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === practiceFontKey || event.key === null) setStored(readPracticeFonts());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  async function change(nextFont: PracticeFont, reset = false) {
    const version = ++request.current;
    const next = { ...(temporary ?? stored ?? defaultPracticeFonts), [language]: nextFont };
    setTemporary(next);
    const saved = await savePracticeFont(nextFont, reset, language);
    if (version !== request.current) return;
    if (saved) {
      setStored(readPracticeFonts());
      setTemporary(null);
      setNotice("");
    } else {
      setNotice("save-failed");
    }
  }

  async function resetAll() {
    const version = ++request.current;
    setTemporary(defaultPracticeFonts);
    const saved = await resetPracticeFonts();
    if (version !== request.current) return;
    if (saved) {
      setStored(defaultPracticeFonts);
      setTemporary(null);
      setNotice("");
    } else {
      setNotice("save-failed");
    }
  }

  return {
    font,
    change,
    resetAll,
    notice: notice ? "save-failed" : stored === null ? "invalid" : "",
  };
}
