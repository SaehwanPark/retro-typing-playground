import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:41793";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL, ...devices["Desktop Chrome"] },
  webServer: {
    command: "node serve.mjs",
    url: baseURL,
  },
});
