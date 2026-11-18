import { expect, test } from "@playwright/test";
import { settingsKey } from "../src/storage/settingsStorage";

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
