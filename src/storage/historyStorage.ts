import { modeLabels, recentRecords } from "../domain/history";
import type { PracticeRecord } from "../domain/history";
import type { TypingScore } from "../domain/typing";

export const historyKey = "retro-typing-playground:history";
const historyVersion = 1;

export type HistoryRead =
  | { ok: true; records: PracticeRecord[] }
  | { ok: false; records: [] };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isOptionalNumber(value: unknown): value is number | null {
  return value === null || isNumber(value);
}

function isScore(score: unknown): score is TypingScore {
  if (!isObject(score)) return false;
  const { typedCount, correctCount, accuracy, elapsedMs, charactersPerMinute } = score;
  return isNumber(typedCount) && Number.isSafeInteger(typedCount)
    && isNumber(correctCount) && Number.isSafeInteger(correctCount) && correctCount <= typedCount
    && isOptionalNumber(accuracy) && (accuracy === null || accuracy <= 100)
    && isOptionalNumber(elapsedMs) && isOptionalNumber(charactersPerMinute);
}

function isRecord(value: unknown): value is PracticeRecord {
  if (!isObject(value)) return false;
  return typeof value.id === "string" && value.id.length > 0
    && typeof value.materialId === "string" && value.materialId.length > 0
    && isNumber(value.completedAt) && value.completedAt <= 8.64e15
    && typeof value.mode === "string" && Object.hasOwn(modeLabels, value.mode)
    && (value.language === "ko" || value.language === "en") && isScore(value.score);
}

export function decodeHistory(raw: string | null): HistoryRead {
  if (raw === null) return { ok: true, records: [] };
  try {
    const data: unknown = JSON.parse(raw);
    if (
      !isObject(data) || data.version !== historyVersion ||
      !Array.isArray(data.records) || !data.records.every(isRecord)
    ) return { ok: false, records: [] };

    const records = data.records.map(({ id, materialId, completedAt, mode, language, score }) => ({
      id, materialId, completedAt, mode, language,
      score: {
        accuracy: score.accuracy, correctCount: score.correctCount, typedCount: score.typedCount,
        elapsedMs: score.elapsedMs, charactersPerMinute: score.charactersPerMinute,
      },
    }));
    return { ok: true, records: recentRecords(records) };
  } catch {
    return { ok: false, records: [] };
  }
}

export function readHistory(): HistoryRead {
  try {
    return decodeHistory(localStorage.getItem(historyKey));
  } catch {
    return { ok: false, records: [] };
  }
}

export async function saveRecord(record: PracticeRecord): Promise<HistoryRead> {
  try {
    return await navigator.locks.request(historyKey, () => {
      const previous = readHistory();
      if (!previous.ok) return previous;
      if (previous.records.some((entry) => entry.id === record.id)) return previous;
      const records = recentRecords([...previous.records, record]);
      localStorage.setItem(historyKey, JSON.stringify({ version: historyVersion, records }));
      return { ok: true, records };
    });
  } catch {
    return { ok: false, records: [] };
  }
}

export async function clearHistory(): Promise<boolean> {
  try {
    await navigator.locks.request(historyKey, () => localStorage.removeItem(historyKey));
    return true;
  } catch {
    return false;
  }
}
