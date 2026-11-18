import { useEffect, useRef, useState } from "react";
import { defaultSize, readTextSize, saveTextSize, settingsKey } from "../storage/settingsStorage";
import type { TextSize } from "../storage/settingsStorage";

export function useTextSize() {
  const [stored, setStored] = useState(readTextSize);
  const [temporary, setTemporary] = useState<TextSize | null>(null);
  const [notice, setNotice] = useState("");
  const request = useRef(0);

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === settingsKey || event.key === null) setStored(readTextSize());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  async function change(size: TextSize, reset = false) {
    const version = ++request.current;
    setTemporary(size);
    const saved = await saveTextSize(size, reset);
    if (version !== request.current) return;
    if (saved) {
      setStored(readTextSize());
      setTemporary(null);
      setNotice("");
    } else {
      setNotice("글자 크기를 저장하지 못했습니다. 이번 페이지에서만 적용됩니다.");
    }
  }

  return {
    size: temporary ?? stored ?? defaultSize,
    change,
    notice: notice || (stored === null ? "저장된 글자 크기를 읽을 수 없습니다." : ""),
  };
}
