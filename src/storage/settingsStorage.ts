export const settingsKey = "retro-typing-playground:display";
export const textSizes = {
  standard: "기본",
  large: "크게",
  largest: "아주 크게",
} as const;

export type TextSize = keyof typeof textSizes;
export const defaultSize: TextSize = "standard";

export function isTextSize(value: unknown): value is TextSize {
  return typeof value === "string" && Object.hasOwn(textSizes, value);
}

export function readTextSize(): TextSize | null {
  try {
    const raw = localStorage.getItem(settingsKey);
    if (raw === null) return defaultSize;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || !("version" in value) ||
        value.version !== 1 || !("size" in value) || !isTextSize(value.size)) {
      return null;
    }
    return value.size;
  } catch {
    return null;
  }
}

export async function saveTextSize(size: TextSize, reset: boolean): Promise<boolean> {
  try {
    return await navigator.locks.request(settingsKey, () => {
      if (reset) {
        localStorage.removeItem(settingsKey);
        return true;
      }
      if (readTextSize() === null) return false;

      localStorage.setItem(settingsKey, JSON.stringify({ version: 1, size }));
      return true;
    });
  } catch {
    return false;
  }
}
