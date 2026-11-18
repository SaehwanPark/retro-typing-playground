import { expect, test } from "@playwright/test";
import { firstKoreanLesson } from "../src/content/lessons";

test("a new profile can practice from the build with only loopback access", async ({ page, baseURL }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return url.origin === baseURL ? route.continue() : route.abort();
  });
  await page.goto("/");
  const menu = page.getByRole("button", { name: /한글 단문/ });
  await expect(menu).toBeFocused();
  await page.keyboard.press("Enter");

  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await expect(input).toBeFocused();
  await input.fill("한");
  await input.press("Enter");
  await expect(page.getByRole("status")).toContainText("남았습니다");

  await input.fill(firstKoreanLesson.text + "!");
  await expect(page.locator(".target .wrong")).toHaveText("!");
  await input.press("Backspace");
  await expect(page.locator(".target .wrong")).toHaveCount(0);
  await input.press("Enter");
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await expect(page.getByRole("heading", { name: "창가의 아침" })).toBeVisible();
  await expect(page.getByText("100%")).toBeVisible();
  await page.getByRole("button", { name: "연습 마치기" }).click();
  const result = page.getByRole("heading", { name: "연습 완료" });
  await expect(result).toBeFocused();
  await expect(page.getByText("100%")).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("");
  await input.press("Escape");
  await expect(menu).toBeFocused();
});

test("IME composition and its Enter are processed separately from submission", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /한글 단문/ }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });

  await input.evaluate((element, text) => {
    const field = element as HTMLInputElement;
    field.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    field.value = text;
    field.dispatchEvent(new InputEvent("input", { isComposing: true, bubbles: true }));
    field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  }, firstKoreanLesson.text);
  await expect(page.getByText("100%")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "연습 완료" })).toHaveCount(0);
  await expect(page.getByRole("status")).toBeEmpty();

  await input.dispatchEvent("compositionend", { bubbles: true });
  await expect(page.getByText("100%")).toBeVisible();
  await input.press("Enter");
  await expect(page.getByRole("heading", { name: "창가의 아침" })).toBeVisible();
});

test("arrow navigation selects a language and returns focus to that mode", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "한글 단문" })).toBeFocused();
  for (let index = 0; index < 3; index += 1) await page.keyboard.press("ArrowDown");
  const wordMode = page.getByRole("button", { name: "영문 낱말" });
  await expect(wordMode).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "orchard" })).toBeVisible();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await input.press("Escape");
  await expect(wordMode).toBeFocused();
});

test("position practice follows physical key codes and includes missed attempts", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "두벌식 자리 연습" }).click();
  const status = page.getByRole("status");
  await expect(status).toContainText("F · ㄹ");
  await page.keyboard.press("q");
  await expect(status).toContainText("다시 시도");
  for (const key of ["f", "j", "d", "k", "s", "l", "a", "g", "h"]) {
    await page.keyboard.press(key);
  }
  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeFocused();
  await expect(page.getByText("90%")).toBeVisible();
});
