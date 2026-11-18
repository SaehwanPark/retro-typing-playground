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
    field.dispatchEvent(new KeyboardEvent("keydown", { key: "Process", code: "Enter", bubbles: true }));
  }, firstKoreanLesson.text);
  await expect(page.getByText("100%")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "연습 완료" })).toHaveCount(0);
  await expect(page.getByRole("status")).toBeEmpty();

  await input.dispatchEvent("compositionend", { bubbles: true });
  await expect(page.getByText("100%")).toBeVisible();
  await input.dispatchEvent("keydown", { key: "Enter", code: "Enter", bubbles: true });
  await expect(page.getByRole("heading", { name: firstKoreanLesson.title })).toBeVisible();
  await input.dispatchEvent("keyup", { key: "Enter", code: "Enter", bubbles: true });
  await input.press("Enter");
  await expect(page.getByRole("heading", { name: "창가의 아침" })).toBeVisible();
});

test("Korean sentence Space submits only after the prompt is complete", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /한글 단문/ }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await expect(page.locator("#typing-target")).toHaveAttribute("aria-label", firstKoreanLesson.text);

  await input.fill("한글을");
  await input.press("Space");
  await expect(input).toHaveValue("한글을 ");
  await input.press("Enter");
  await expect(page.getByRole("heading", { name: firstKoreanLesson.title })).toBeVisible();

  await input.fill(firstKoreanLesson.text);
  await input.press("Space");
  await expect(page.getByRole("heading", { name: "창가의 아침" })).toBeVisible();
  await expect(input).toHaveValue("");
});

test("a Space key used by Korean IME composition does not submit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /한글 단문/ }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });

  await input.evaluate((element, text) => {
    const field = element as HTMLInputElement;
    field.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    field.value = text;
    field.dispatchEvent(new InputEvent("input", { isComposing: true, bubbles: true }));
    field.dispatchEvent(new KeyboardEvent("keydown", {
      key: " ", code: "Space", isComposing: true, bubbles: true,
    }));
  }, firstKoreanLesson.text);
  await input.dispatchEvent("compositionend", { bubbles: true });
  await expect(input).toHaveValue(firstKoreanLesson.text);
  await expect(page.getByRole("heading", { name: firstKoreanLesson.title })).toBeVisible();

  await input.dispatchEvent("keydown", { key: " ", code: "Space", bubbles: true });
  await expect(page.getByRole("heading", { name: firstKoreanLesson.title })).toBeVisible();
  await input.dispatchEvent("keyup", { key: " ", code: "Space", bubbles: true });
  await input.press("Space");
  await expect(page.getByRole("heading", { name: "창가의 아침" })).toBeVisible();
});

test("Space submission stays limited to Korean sentence practice", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한글 낱말" }).click();
  const koreanWordInput = page.getByRole("textbox", { name: "따라 입력하기" });
  await koreanWordInput.fill("연필");
  await koreanWordInput.press("Space");
  await expect(koreanWordInput).toHaveValue("연필 ");
  await expect(page.getByRole("heading", { name: "연습 완료" })).toHaveCount(0);
  await koreanWordInput.fill("연필");
  await koreanWordInput.press("Enter");
  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeVisible();

  await page.getByRole("button", { name: "메뉴로 돌아가기" }).click();
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("combobox", { name: "연습 언어" }).selectOption("en");
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await page.getByRole("button", { name: "영문 단문" }).click();
  const englishInput = page.getByRole("textbox", { name: "따라 입력하기" });
  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();
  await englishInput.fill(prompt!);
  await englishInput.press("Space");
  await expect(englishInput).toHaveValue(`${prompt} `);
  await expect(page.getByRole("heading", { name: "연습 완료" })).toHaveCount(0);
});

test("arrow navigation selects a language and returns focus to that mode", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("combobox", { name: "연습 언어" }).selectOption("en");
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("button", { name: "영문 단문" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  const wordMode = page.getByRole("button", { name: "영문 낱말" });
  await expect(wordMode).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "orchard" })).toBeVisible();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await input.press("Escape");
  await expect(wordMode).toBeFocused();
});

test("free practice edits multiline text without scoring or saving it", async ({ page }) => {
  await page.goto("/");
  const practicePad = page.getByRole("button", { name: "연습장" });
  const entries = await page.locator(".activity-menu button").evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("data-activity"))
  );
  const practiceIndex = entries.indexOf("free-practice");
  expect(practiceIndex).toBeGreaterThan(0);
  for (let step = 0; step < practiceIndex; step += 1) await page.keyboard.press("ArrowDown");
  await expect(practicePad).toBeFocused();
  await page.keyboard.press("Enter");

  const editor = page.getByRole("textbox", { name: "원하는 내용을 자유롭게 입력하세요" });
  await expect(editor).toBeFocused();
  await editor.fill("첫 줄\n둘째 줄");
  await editor.press("Enter");
  await expect(editor).toHaveValue("첫 줄\n둘째 줄\n");
  await expect(page.getByRole("button", { name: "제출" })).toHaveCount(0);

  await editor.dispatchEvent("compositionstart", { bubbles: true });
  await editor.press("Escape");
  await expect(page.getByRole("heading", { name: "연습장" })).toBeVisible();
  await editor.dispatchEvent("compositionend", { bubbles: true });
  await editor.press("Escape");
  await expect(practicePad).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue("");

  await editor.fill("나가면 버려지는 임시 입력");
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await expect(practicePad).toBeFocused();
  await page.getByRole("button", { name: "최근 연습 기록" }).click();
  await expect(page.getByText("표시할 연습 기록이 없습니다.")).toBeVisible();
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
