import { expect, test } from "@playwright/test";
import { appPreferencesKey } from "../src/storage/appPreferences";

test("settings are reachable by keyboard and return focus to the home entry", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "한글 단문" })).toBeFocused();
  await page.keyboard.press("ArrowUp");
  const settingsEntry = page.getByRole("button", { name: "환경설정" });
  await expect(settingsEntry).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "환경설정" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(settingsEntry).toBeFocused();
});

test("completion sound is off by default", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  await expect(page.getByRole("combobox", { name: "완료 효과음" })).toHaveValue("off");
});

test("interface and practice languages are independent and filter home content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("combobox", { name: "인터페이스 언어" }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("combobox", { name: "Practice language" }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("data-practice-language", "en");
  await page.getByRole("button", { name: "← Menu" }).click();

  await expect(page.getByRole("heading", { name: "Typing practice" })).toBeVisible();
  await expect(page.getByRole("button", { name: "English sentences" })).toBeVisible();
  await expect(page.getByRole("button", { name: "English words" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Korean words" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Korean keyboard positions" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Choose a passage" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "30-second word challenge" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Free typing" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Recent practice" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Settings" })).toBeVisible();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-practice-language", "en");
  await expect(page.getByRole("button", { name: "English words" })).toBeVisible();
});

test("completion sound plays only after submitting a practice item", async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      preferences: { interfaceLanguage: "ko", practiceLanguage: "ko", completionSound: true },
    }));
    const target = window as typeof window & { __toneStarts?: number };
    target.__toneStarts = 0;
    class AudioContextMock {
      currentTime = 0;
      destination = {};
      createOscillator() {
        return {
          type: "sine",
          frequency: { setValueAtTime() {} },
          connect() {},
          start() { target.__toneStarts = (target.__toneStarts ?? 0) + 1; },
          stop() {},
          onended: null as (() => void) | null,
        };
      }
      createGain() {
        return {
          gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect() {},
        };
      }
      close() { return Promise.resolve(); }
    }
    Object.defineProperty(window, "AudioContext", { configurable: true, value: AudioContextMock });
  }, appPreferencesKey);
  await page.goto("/");
  await page.getByRole("button", { name: "한글 단문" }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();

  await input.fill(prompt!.slice(0, 1));
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __toneStarts?: number }).__toneStarts)).toBe(0);
  await input.fill(prompt!);
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __toneStarts?: number }).__toneStarts)).toBe(0);
  await input.press("Enter");
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __toneStarts?: number }).__toneStarts)).toBe(1);
});
