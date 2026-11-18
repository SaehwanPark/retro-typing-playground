import { expect, test } from "@playwright/test";
import { colorThemeKey, practiceFontKey, settingsKey } from "../src/storage/settingsStorage";

test("text size changes during practice, survives reload, and can be reset", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한글 단문" }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await input.fill("한글");
  await page.getByText("표시 설정", { exact: true }).click();
  await page.getByRole("combobox", { name: "연습 글자 크기" }).selectOption("largest");
  await expect(input).toHaveCSS("font-size", "32px");
  await expect(page.locator("#typing-target")).toHaveCSS("font-size", "32px");
  await expect(input).toHaveValue("한글");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), settingsKey)).toContain("largest");

  await page.reload();
  await page.getByRole("button", { name: "한글 단문" }).click();
  await expect(input).toHaveCSS("font-size", "32px");
  await page.getByText("표시 설정", { exact: true }).click();
  await page.getByRole("button", { name: "기본 크기로 되돌리기" }).click();
  await expect(input).toHaveCSS("font-size", "21.6px");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), settingsKey)).toBeNull();
});

test("color theme changes immediately, survives reload, and resets independently", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한글 단문" }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await input.fill("한글");
  await page.getByText("표시 설정", { exact: true }).click();
  await page.getByRole("combobox", { name: "연습 글자 크기" }).selectOption("largest");
  await page.getByRole("combobox", { name: "색상 테마" }).selectOption("paper");

  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "paper");
  await expect(page.locator(".shell")).toHaveCSS("background-color", "rgb(255, 253, 248)");
  await expect(input).toHaveValue("한글");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), colorThemeKey)).toContain("paper");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "paper");
  await page.getByRole("button", { name: "한글 단문" }).click();
  await expect(input).toHaveCSS("font-size", "32px");
  await page.getByText("표시 설정", { exact: true }).click();
  await page.getByRole("button", { name: "기본 색상으로 되돌리기" }).click();

  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "terminal");
  await expect(page.getByRole("combobox", { name: "연습 글자 크기" })).toHaveValue("largest");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), colorThemeKey)).toBeNull();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), settingsKey)).toContain("largest");
});

test("invalid theme data falls back without overwriting it", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "{invalid"), colorThemeKey);
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "terminal");
  await page.getByText("표시 설정", { exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("저장된 색상 테마를 읽을 수 없습니다.");
  await page.getByRole("combobox", { name: "색상 테마" }).selectOption("paper");

  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "paper");
  await expect(page.getByRole("status")).toHaveText("색상 테마를 저장하지 못했습니다. 이번 탭에서만 적용됩니다.");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), colorThemeKey)).toBe("{invalid");
});

test("a denied theme write applies for this tab and announces the failure", async ({ page }) => {
  await page.addInitScript((key) => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (storageKey, value) {
      if (storageKey === key) throw new DOMException("Storage is unavailable", "QuotaExceededError");
      originalSetItem.call(this, storageKey, value);
    };
  }, colorThemeKey);
  await page.goto("/");
  await page.getByText("표시 설정", { exact: true }).click();
  await page.getByRole("combobox", { name: "색상 테마" }).selectOption("paper");

  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "paper");
  await expect(page.getByRole("status")).toHaveText("색상 테마를 저장하지 못했습니다. 이번 탭에서만 적용됩니다.");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), colorThemeKey)).toBeNull();
});

test("practice font changes immediately, survives reload, and resets independently", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한글 단문" }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await input.fill("한글");
  await page.getByText("표시 설정", { exact: true }).click();
  await page.getByRole("combobox", { name: "연습 글자 크기" }).selectOption("largest");
  await page.getByRole("combobox", { name: "색상 테마" }).selectOption("paper");
  await page.getByRole("combobox", { name: "연습 글꼴" }).selectOption("serif");

  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "serif");
  await expect(page.locator("#typing-target")).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');
  await expect(input).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');
  await expect(input).toHaveCSS("font-size", "32px");
  await expect(input).toHaveValue("한글");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), practiceFontKey)).toContain("serif");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "serif");
  await page.getByRole("button", { name: "한글 단문" }).click();
  await expect(page.getByRole("textbox", { name: "따라 입력하기" })).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');
  await expect(page.getByRole("textbox", { name: "따라 입력하기" })).toHaveCSS("font-size", "32px");
  await page.getByText("표시 설정", { exact: true }).click();
  await page.getByRole("button", { name: "기본 글꼴로 되돌리기" }).click();

  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "gothic");
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "paper");
  await expect(page.getByRole("combobox", { name: "연습 글자 크기" })).toHaveValue("largest");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), practiceFontKey)).toBeNull();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), colorThemeKey)).toContain("paper");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), settingsKey)).toContain("largest");
});

test("practice font affects practice text without changing menu typography", async ({ page }) => {
  await page.goto("/");
  await page.getByText("표시 설정", { exact: true }).click();
  await page.getByRole("combobox", { name: "연습 글꼴" }).selectOption("serif");
  const menuFont = await page.locator(".lesson-button").first().evaluate((element) => getComputedStyle(element).fontFamily);
  expect(menuFont).not.toContain("Batang");

  await page.getByRole("button", { name: "장문 고르기" }).click();
  await page.getByRole("button", { name: "새벽 강변" }).click();
  await expect(page.locator(".article-progress p").first()).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');
  await expect(page.locator("#typing-target")).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');

  await page.goto("/");
  await page.getByRole("button", { name: "연습장" }).click();
  await expect(page.getByRole("textbox", { name: "원하는 내용을 자유롭게 입력하세요" })).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');

  await page.goto("/");
  await page.getByRole("button", { name: "30초 낱말 도전" }).click();
  await page.getByRole("button", { name: "도전 시작" }).click();
  await expect(page.locator("#typing-target")).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');
  await expect(page.getByRole("textbox", { name: "따라 입력하기" })).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');
});

test("invalid practice font data falls back without overwriting it", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "{invalid"), practiceFontKey);
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "gothic");
  await page.getByText("표시 설정", { exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("저장된 연습 글꼴을 읽을 수 없습니다.");
  await page.getByRole("combobox", { name: "연습 글꼴" }).selectOption("serif");

  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "serif");
  await expect(page.getByRole("status")).toHaveText("연습 글꼴을 저장하지 못했습니다. 이번 탭에서만 적용됩니다.");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), practiceFontKey)).toBe("{invalid");
});

test("a denied practice font write applies for this tab and announces the failure", async ({ page }) => {
  await page.addInitScript((key) => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (storageKey, value) {
      if (storageKey === key) throw new DOMException("Storage is unavailable", "QuotaExceededError");
      originalSetItem.call(this, storageKey, value);
    };
  }, practiceFontKey);
  await page.goto("/");
  await page.getByText("표시 설정", { exact: true }).click();
  await page.getByRole("combobox", { name: "연습 글꼴" }).selectOption("serif");

  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "serif");
  await expect(page.getByRole("status")).toHaveText("연습 글꼴을 저장하지 못했습니다. 이번 탭에서만 적용됩니다.");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), practiceFontKey)).toBeNull();
});
