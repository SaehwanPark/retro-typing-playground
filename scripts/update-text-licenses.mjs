import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const output = fileURLToPath(new URL("../TEXT-LICENSES.md", import.meta.url));
const server = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  // Load the TypeScript content modules through Vite so the document uses the
  // same validated assets and labels as the app.
  const { textLicenseMarkdown } = await server.ssrLoadModule("/src/content/textLicenseInventory.ts");
  writeFileSync(output, textLicenseMarkdown(), "utf8");
  console.log("Updated TEXT-LICENSES.md");
} finally {
  await server.close();
}
