import type { Language } from "../content/lessons";

export const appPreferencesKey = "retro-typing-playground:preferences";

export type AppPreferences = Readonly<{
  interfaceLanguage: Language;
  practiceLanguage: Language;
  completionSound: boolean;
}>;

export const defaultAppPreferences: AppPreferences = {
  interfaceLanguage: "ko",
  practiceLanguage: "ko",
  completionSound: false,
};

export type AppPreferencesRead = Readonly<{ value: AppPreferences; valid: boolean }>;

function isLanguage(value: unknown): value is Language {
  return value === "ko" || value === "en";
}

function isAppPreferences(value: unknown): value is AppPreferences {
  return typeof value === "object" && value !== null &&
    "interfaceLanguage" in value && isLanguage(value.interfaceLanguage) &&
    "practiceLanguage" in value && isLanguage(value.practiceLanguage) &&
    "completionSound" in value && typeof value.completionSound === "boolean";
}

export function readAppPreferences(): AppPreferencesRead {
  try {
    const raw = localStorage.getItem(appPreferencesKey);
    if (raw === null) return { value: defaultAppPreferences, valid: true };
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || !("version" in value) ||
        value.version !== 1 || !("preferences" in value) || !isAppPreferences(value.preferences)) {
      return { value: defaultAppPreferences, valid: false };
    }
    return { value: value.preferences, valid: true };
  } catch {
    return { value: defaultAppPreferences, valid: false };
  }
}

export async function saveAppPreferences(
  preferences: AppPreferences,
  reset = false,
): Promise<boolean> {
  try {
    return await navigator.locks.request(appPreferencesKey, () => {
      if (reset) {
        localStorage.removeItem(appPreferencesKey);
        return true;
      }
      if (!readAppPreferences().valid) return false;
      localStorage.setItem(appPreferencesKey, JSON.stringify({ version: 1, preferences }));
      return true;
    });
  } catch {
    return false;
  }
}
