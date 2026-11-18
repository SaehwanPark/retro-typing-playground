import { expect, test } from "@playwright/test";
import { articles } from "../src/content/articles";

test("article lines advance with focus and return to the selected article", async ({ page }) => {
  const article = articles[0]!;
  await page.goto("/");
  const library = page.getByRole("button", { name: "장문 고르기" });
  await library.click();
  const entry = page.getByRole("button", { name: /새벽 강변 \d+자/ });
  await expect(entry).toBeFocused();
  await entry.press("Enter");

  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  for (const [index, line] of article.lines.entries()) {
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("");
    await expect(page.getByText(`${index + 1} / ${article.lines.length}`, { exact: false })).toBeVisible();
    await input.fill(line);
    await input.press("Enter");
  }
  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeFocused();
  await expect(page.getByText("100%")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(entry).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(library).toBeFocused();
});
