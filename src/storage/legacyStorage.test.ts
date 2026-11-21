import { afterEach, expect, it, vi } from "vitest";
import {
  legacyStorageKey,
  migrateStorageValue,
  readStorageValue,
  resetStorageValue,
  storageKeys,
  withStorageEntryLock,
} from "./legacyStorage";
import type { StorageEntry, StorageLike } from "./legacyStorage";

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  readonly deniedWrites = new Set<string>();
  corruptWritesTo = new Set<string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.deniedWrites.has(key)) throw new DOMException("Write denied", "QuotaExceededError");
    this.values.set(key, this.corruptWritesTo.has(key) ? "{corrupt" : value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

afterEach(() => vi.unstubAllGlobals());

function validJson(raw: string): boolean {
  try {
    JSON.parse(raw);
    return true;
  } catch {
    return false;
  }
}

function seed(storage: MemoryStorage, entry: StorageEntry, value: string): void {
  storage.values.set(legacyStorageKey(entry), value);
}

it("copies and verifies valid legacy data before removing its source", () => {
  const storage = new MemoryStorage();
  const legacy = JSON.stringify({ version: 2, value: "kept" });
  seed(storage, "preferences", legacy);

  expect(migrateStorageValue("preferences", validJson, storage)).toBe(true);
  expect(storage.getItem(storageKeys.preferences)).toBe(legacy);
  expect(storage.getItem(legacyStorageKey("preferences"))).toBeNull();
  expect(readStorageValue("preferences", storage)).toBe(legacy);
  expect(migrateStorageValue("preferences", validJson, storage)).toBe(true);
  expect(storage.getItem(storageKeys.preferences)).toBe(legacy);
});

it("keeps current data when both keys exist, even when the new value is corrupt", () => {
  const storage = new MemoryStorage();
  const current = "{broken-current";
  const legacy = JSON.stringify({ version: 2, value: "older" });
  storage.values.set(storageKeys.display, current);
  seed(storage, "display", legacy);

  expect(migrateStorageValue("display", validJson, storage)).toBe(true);
  expect(readStorageValue("display", storage)).toBe(current);
  expect(storage.getItem(legacyStorageKey("display"))).toBe(legacy);
});

it("preserves invalid legacy data without importing or removing it", () => {
  const storage = new MemoryStorage();
  seed(storage, "history", "not json");

  expect(migrateStorageValue("history", validJson, storage)).toBe(true);
  expect(readStorageValue("history", storage)).toBe("not json");
  expect(storage.getItem(storageKeys.history)).toBeNull();
  expect(storage.getItem(legacyStorageKey("history"))).toBe("not json");
});

it("retains legacy data when copying fails or the copied value fails verification", () => {
  const denied = new MemoryStorage();
  const legacy = JSON.stringify({ value: "kept" });
  seed(denied, "colorTheme", legacy);
  denied.deniedWrites.add(storageKeys.colorTheme);
  expect(migrateStorageValue("colorTheme", validJson, denied)).toBe(false);
  expect(denied.getItem(legacyStorageKey("colorTheme"))).toBe(legacy);

  const corruptCopy = new MemoryStorage();
  seed(corruptCopy, "practiceFont", legacy);
  corruptCopy.corruptWritesTo.add(storageKeys.practiceFont);
  expect(migrateStorageValue("practiceFont", validJson, corruptCopy)).toBe(false);
  expect(corruptCopy.getItem(storageKeys.practiceFont)).toBeNull();
  expect(corruptCopy.getItem(legacyStorageKey("practiceFont"))).toBe(legacy);
});

it("does not reimport values written by an older tab after a reset", () => {
  const storage = new MemoryStorage();
  const legacy = JSON.stringify({ version: 1, records: [] });
  seed(storage, "history", legacy);
  expect(migrateStorageValue("history", validJson, storage)).toBe(true);
  expect(resetStorageValue("history", storage)).toBe(true);

  const olderTabWrite = JSON.stringify({ version: 1, records: [{ id: "stale" }] });
  storage.values.set(legacyStorageKey("history"), olderTabWrite);
  expect(readStorageValue("history", storage)).toBeNull();
  expect(migrateStorageValue("history", validJson, storage)).toBe(true);
  expect(storage.getItem(storageKeys.history)).toBeNull();
});

it("does not clear data when it cannot persist the reset tombstone", () => {
  const storage = new MemoryStorage();
  const current = JSON.stringify({ value: "kept" });
  storage.values.set(storageKeys.display, current);
  storage.deniedWrites.add("tagak:migration:display");

  expect(resetStorageValue("display", storage)).toBe(false);
  expect(storage.getItem(storageKeys.display)).toBe(current);
});

it("takes current and legacy Web Locks in a consistent order", async () => {
  const requested: string[] = [];
  vi.stubGlobal("navigator", {
    locks: {
      request: async (name: string, operation: () => unknown) => {
        requested.push(name);
        return operation();
      },
    },
  });

  await withStorageEntryLock("history", () => "done");

  expect(requested).toEqual([storageKeys.history, legacyStorageKey("history")]);
});
