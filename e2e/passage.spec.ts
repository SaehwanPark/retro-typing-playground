import { expect, test } from "@playwright/test";
import { passagesFor } from "../src/content/passages";

test("short passage lines advance in five-line pages and return to the selected passage", async ({ page }) => {
  const passage = passagesFor("ko", "short")[0]!;
  await page.goto("/");
  const library = page.getByRole("button", { name: "짧은 글" });
  await library.click();
  const entry = page.getByRole("button", { name: /새벽 강변/ });
  await expect(entry).toBeFocused();
  await entry.press("Enter");

  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  for (const [index, line] of passage.lines.entries()) {
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("");
    await expect(page.locator(".passage-page li")).toHaveCount(Math.min(5, passage.lines.length - Math.floor(index / 5) * 5));
    await expect(page.locator(".passage-page li.current")).toHaveText(new RegExp(line));
    await input.fill(line);
    await input.press("Space");
  }
  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeFocused();
  await expect(page.getByText("100%")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(entry).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(library).toBeFocused();
});

test("long passages expose five-line pages and their genre and size", async ({ page }) => {
  const passage = passagesFor("ko", "long")[0]!;
  await page.goto("/");
  await page.getByRole("button", { name: "긴 글" }).click();
  const entry = page.getByRole("button", { name: new RegExp(passage.label) });
  await expect(entry).toContainText(`${passage.characterCount}자`);
  await entry.click();
  await expect(page.getByText("1 / " + Math.ceil(passage.lines.length / 5) + " 묶음")).toBeVisible();
  await expect(page.locator(".passage-page li.current")).toHaveText(new RegExp(passage.lines[0]!));
  await page.getByRole("textbox", { name: "따라 입력하기" }).fill(passage.lines[0]!);
  await page.getByRole("textbox", { name: "따라 입력하기" }).press("Space");
  await expect(page.locator(".passage-page li.done")).toHaveCount(1);
  await expect(page.locator(".passage-page li.current")).toHaveText(new RegExp(passage.lines[1]!));
});
