import { useEffect, useRef, useState } from "react";
import {
  appPreferencesKey,
  defaultAppPreferences,
  readAppPreferences,
  saveAppPreferences,
} from "../storage/appPreferences";
import type { AppPreferences, AppPreferencesRead } from "../storage/appPreferences";

export function useAppPreferences() {
  const [stored, setStored] = useState<AppPreferencesRead>(readAppPreferences);
  const [temporary, setTemporary] = useState<AppPreferences | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const request = useRef(0);
  const preferences = temporary ?? stored.value;

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === appPreferencesKey || event.key === null) {
        setStored(readAppPreferences());
        setTemporary(null);
        setSaveFailed(false);
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  async function change(update: Partial<AppPreferences>, reset = false) {
    const version = ++request.current;
    const next = reset ? defaultAppPreferences : { ...preferences, ...update };
    setTemporary(next);
    const saved = await saveAppPreferences(next, reset);
    if (version !== request.current) return;
    if (saved) {
      setStored(readAppPreferences());
      setTemporary(null);
      setSaveFailed(false);
    } else {
      setSaveFailed(true);
    }
  }

  return {
    preferences,
    change,
    reset: () => change({}, true),
    notice: saveFailed ? "save-failed" : stored.valid ? "" : "invalid",
  } as const;
}
