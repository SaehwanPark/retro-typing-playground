import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { historyKey } from "../src/storage/historyStorage";

async function finishWord(page: Page, mode: string, word: string) {
  await page.goto("/");
  await page.getByRole("button", { name: mode }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await input.fill(word);
  await input.press("Enter");
  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeVisible();
}

test("simultaneous completions persist across tabs and can be compared and cleared", async ({ page, context }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("button", { name: /연습 언어/ }).click();
  await page.getByRole("button", { name: "← 메뉴" }).click();
  const other = await context.newPage();
  await Promise.all([
    finishWord(page, "영문 낱말", "orchard"),
    finishWord(other, "영문 낱말", "orchard"),
  ]);
  await expect.poll(async () => await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).records.length : 0;
  }, historyKey)).toBe(2);
  await finishWord(page, "영문 낱말", "orchard");
  await expect(page.getByRole("heading", { name: "같은 모드의 이전 기록" })).toBeVisible();
  await page.getByRole("button", { name: "메뉴로 돌아가기" }).click();
  await page.getByRole("button", { name: "최근 연습 기록" }).click();
  await expect(page.getByRole("listitem")).toHaveCount(3);
  await page.getByRole("combobox").selectOption("long");
  await expect(page.getByText("표시할 연습 기록이 없습니다.")).toBeVisible();
  await page.getByRole("button", { name: "기록 지우기", exact: true }).click();
  await page.getByRole("button", { name: "전체 기록 지우기" }).click();
  await expect(page.getByRole("status")).toContainText("기록을 지웠습니다");
  await other.goto("/");
  await other.getByRole("button", { name: "최근 연습 기록" }).click();
  await expect(other.getByText("표시할 연습 기록이 없습니다.")).toBeVisible();
});

test("unreadable data is preserved and a session still completes", async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => localStorage.setItem(key, "unreadable"), historyKey);
  await finishWord(page, "한글 낱말", "연필");
  await expect(page.getByRole("status")).toContainText("이번 기록은 저장하지 못했습니다");
  await expect(page.getByText("100%")).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), historyKey)).toBe("unreadable");
});

test("a failed write leaves the score available in the current page", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Storage is full", "QuotaExceededError"); };
  });
  await finishWord(page, "한글 낱말", "연필");
  await expect(page.getByRole("status")).toContainText("이번 기록은 저장하지 못했습니다");
  await page.getByRole("button", { name: "메뉴로 돌아가기" }).click();
  await page.getByRole("button", { name: "최근 연습 기록" }).click();
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: "최근 연습 기록" }).click();
  await expect(page.getByText("표시할 연습 기록이 없습니다.")).toBeVisible();
});
