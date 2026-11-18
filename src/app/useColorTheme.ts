import { useEffect, useRef, useState } from "react";
import {
  colorThemeKey,
  defaultColorTheme,
  readColorTheme,
  saveColorTheme,
} from "../storage/settingsStorage";
import type { ColorTheme } from "../storage/settingsStorage";

export function useColorTheme() {
  const [stored, setStored] = useState(readColorTheme);
  const [temporary, setTemporary] = useState<ColorTheme | null>(null);
  const [notice, setNotice] = useState("");
  const request = useRef(0);
  const theme = temporary ?? stored ?? defaultColorTheme;

  useEffect(() => {
    document.documentElement.dataset.colorTheme = theme;
  }, [theme]);

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === colorThemeKey || event.key === null) setStored(readColorTheme());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  async function change(nextTheme: ColorTheme, reset = false) {
    const version = ++request.current;
    setTemporary(nextTheme);
    const saved = await saveColorTheme(nextTheme, reset);
    if (version !== request.current) return;
    if (saved) {
      setStored(readColorTheme());
      setTemporary(null);
      setNotice("");
    } else {
      setNotice("색상 테마를 저장하지 못했습니다. 이번 탭에서만 적용됩니다.");
    }
  }

  return {
    theme,
    change,
    notice: notice || (stored === null ? "저장된 색상 테마를 읽을 수 없습니다." : ""),
  };
}
