import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const pngSignature = Buffer.from("89504e470d0a1a0a", "hex");

async function expectPngDownload(page: Page, action: () => Promise<void>) {
  const downloadPromise = page.waitForEvent("download");
  await action();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^retro-typing-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.png$/);
  const path = await download.path();
  expect(path).not.toBeNull();
  const image = await readFile(path!);
  expect(image.subarray(0, pngSignature.length)).toEqual(pngSignature);
  expect(image.byteLength).toBeGreaterThan(1_000);
}

test("the screen button downloads the current screen as PNG", async ({ page }) => {
  await page.goto("/");
  await expectPngDownload(page, () => page.getByRole("button", { name: /화면 저장/ }).click());
  await expect(page.locator(".capture-status")).toHaveText("화면을 PNG로 저장했습니다.");
});

test("Ctrl+S downloads the current screen while free practice text remains in the editor", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "연습장" }).click();
  const editor = page.getByRole("textbox", { name: "원하는 내용을 자유롭게 입력하세요" });
  const text = "화면에 보이는 연습장 입력\n둘째 줄";
  await editor.fill(text);

  await expectPngDownload(page, () => page.keyboard.press("Control+s"));
  await expect(editor).toHaveValue(text);
  await expect(page.locator(".capture-status")).toHaveText("화면을 PNG로 저장했습니다.");
});

test("Ctrl+S does not intercept a shortcut during IME composition", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "연습장" }).click();
  const editor = page.getByRole("textbox", { name: "원하는 내용을 자유롭게 입력하세요" });
  const wasPrevented = await editor.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    const shortcut = new KeyboardEvent("keydown", {
      key: "s",
      code: "KeyS",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(shortcut);
    element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    return shortcut.defaultPrevented;
  });

  expect(wasPrevented).toBe(false);
  await expect(page.locator(".capture-status")).toBeEmpty();
});

test("the app announces a PNG encoding failure and remains usable", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = (callback) => callback(null);
  });
  const save = page.getByRole("button", { name: /화면 저장/ });
  await save.click();

  await expect(page.locator(".capture-status")).toHaveText("화면을 저장하지 못했습니다. 다시 시도해 주세요.");
  await expect(save).toBeEnabled();
});
