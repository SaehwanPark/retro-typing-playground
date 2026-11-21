import type { Page } from "@playwright/test";
import { appPreferencesKey } from "../../src/storage/appPreferences";
import type { AppPreferences } from "../../src/storage/appPreferences";

/**
 * Seeds stored preferences before the app boots. Tests that also exercise the
 * migration path pass an older schema version.
 */
export async function seedPreferences(
  page: Page,
  preferences: Partial<AppPreferences>,
  version = 2,
): Promise<void> {
  await page.addInitScript(({ key, stored, schema }) => {
    localStorage.setItem(key, JSON.stringify({ version: schema, preferences: stored }));
  }, { key: appPreferencesKey, stored: preferences, schema: version });
}
