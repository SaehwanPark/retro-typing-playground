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
  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeVisible();
});
