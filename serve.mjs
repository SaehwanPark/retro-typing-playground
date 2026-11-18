import { createServer } from "node:http";
import { readFile, realpath } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const port = 41793;
const address = `http://${host}:${port}`;
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
]);

function isInside(root, path) {
  const name = relative(root, path);
  return name !== ".." && !name.startsWith(`..${sep}`) && !isAbsolute(name);
}

async function serve(root, request, response) {
  if (request.headers.host !== `${host}:${port}`) {
    response.writeHead(403).end();
    return;
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  try {
    const uri = new URL(request.url, address);
    const pathname = uri.pathname === "/" ? "/index.html" : decodeURIComponent(uri.pathname);
    const path = resolve(root, `.${pathname}`);
    const contentType = contentTypes.get(extname(path));
    if (!contentType || !isInside(root, path) || !isInside(root, await realpath(path))) {
      response.writeHead(404).end();
      return;
    }

    const file = await readFile(path);
    response.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": file.length,
      "X-Content-Type-Options": "nosniff",
    }).end(request.method === "HEAD" ? undefined : file);
  } catch {
    response.writeHead(404).end();
  }
}

try {
  const root = await realpath(fileURLToPath(new URL("./dist/", import.meta.url)));
  await readFile(resolve(root, "index.html"));
  const server = createServer((request, response) => void serve(root, request, response));
  server.on("error", (error) => {
    console.error(error.code === "EADDRINUSE"
      ? `${address} 포트가 이미 사용 중입니다. 기존 로컬 서버를 종료한 뒤 다시 실행하세요.`
      : error.message);
    process.exitCode = 1;
  });
  server.listen(port, host, () => console.log(`브라우저에서 ${address}/ 를 여세요.`));
} catch {
  console.error("빌드한 dist/index.html이 필요합니다. 개발 중이라면 npm run build를 먼저 실행하세요.");
  process.exitCode = 1;
}
