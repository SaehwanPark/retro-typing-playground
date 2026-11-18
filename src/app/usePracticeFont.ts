import { useEffect, useRef, useState } from "react";
import {
  defaultPracticeFont,
  practiceFontKey,
  readPracticeFont,
  savePracticeFont,
} from "../storage/settingsStorage";
import type { PracticeFont } from "../storage/settingsStorage";

export function usePracticeFont() {
  const [stored, setStored] = useState(readPracticeFont);
  const [temporary, setTemporary] = useState<PracticeFont | null>(null);
  const [notice, setNotice] = useState("");
  const request = useRef(0);
  const font = temporary ?? stored ?? defaultPracticeFont;

  useEffect(() => {
    document.documentElement.dataset.practiceFont = font;
  }, [font]);

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === practiceFontKey || event.key === null) setStored(readPracticeFont());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  async function change(nextFont: PracticeFont, reset = false) {
    const version = ++request.current;
    setTemporary(nextFont);
    const saved = await savePracticeFont(nextFont, reset);
    if (version !== request.current) return;
    if (saved) {
      setStored(readPracticeFont());
      setTemporary(null);
      setNotice("");
    } else {
      setNotice("연습 글꼴을 저장하지 못했습니다. 이번 탭에서만 적용됩니다.");
    }
  }

  return {
    font,
    change,
    notice: notice || (stored === null ? "저장된 연습 글꼴을 읽을 수 없습니다." : ""),
  };
}
