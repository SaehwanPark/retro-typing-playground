import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { textLicenseMarkdown } from "./textLicenseInventory";

it("keeps TEXT-LICENSES.md aligned with the practice-text assets", () => {
  const documented = readFileSync(new URL("../../TEXT-LICENSES.md", import.meta.url), "utf8");

  // Regenerate with `npm run text-licenses:update` when this fails.
  expect(documented).toBe(textLicenseMarkdown());
});
