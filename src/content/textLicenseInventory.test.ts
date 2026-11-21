import { expect, it } from "vitest";
import documented from "../../TEXT-LICENSES.md?raw";
import rawKoreanPassages from "./assets/passages.ko.json";
import rawEnglishPassages from "./assets/passages.en.json";
import { passageActivities } from "./passages";
import { textLicenseMarkdown } from "./textLicenseInventory";

it("keeps TEXT-LICENSES.md aligned with the practice-text assets", () => {
  // Regenerate with `npm run text-licenses:update` when this fails.
  expect(documented).toBe(textLicenseMarkdown());
});

it("does not silently drop a passage asset from the license inventory", () => {
  // Invalid passages are filtered out at the content boundary. Comparing raw
  // and loaded counts keeps a missing credit from disappearing from the doc.
  expect(passageActivities).toHaveLength(rawKoreanPassages.length + rawEnglishPassages.length);
});
