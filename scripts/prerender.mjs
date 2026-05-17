// Build-time prerender for the SPA.
//
// After `vite build` has produced dist/, this script:
//   1. Boots a small static-file server pointing at dist/.
//   2. Launches puppeteer (with --no-sandbox flags for Amplify's root container).
//   3. For each route from scripts/lib/routes.mjs, navigates a headless page,
//      waits for hydration (window.__APP_HYDRATED__ flag from src/main.tsx),
//      captures document.documentElement.outerHTML, and writes the result to
//      dist/{route}/index.html.
//   4. Sanity-checks each captured HTML contains a non-empty <title>.
//   5. On any per-route failure, logs and continues; exits non-zero overall.
//
// Concurrency: 4 routes in parallel (bounded Promise-pool).

import { existsSync, createReadStream } from "node:fs";
import { mkdir, writeFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { getAllRoutes } from "./lib/routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");
const CONCURRENCY = 4;
const HYDRATION_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------- static server

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

function startServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
        let filePath = path.join(rootDir, urlPath);
        let stats;
        try {
          stats = await stat(filePath);
        } catch {
          stats = null;
        }
        if (stats?.isDirectory()) {
          filePath = path.join(filePath, "index.html");
          try {
            stats = await stat(filePath);
          } catch {
            stats = null;
          }
        }
        if (!stats?.isFile()) {
          // Fall back to dist/index.html so client-side routing works during
          // prerender. This mirrors the production SPA-fallback behaviour.
          filePath = path.join(rootDir, "index.html");
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          "content-type": MIME[ext] ?? "application/octet-stream",
          "cache-control": "no-store",
        });
        createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

// ---------------------------------------------------------------- per-route work

function outputPathFor(route) {
  if (route === "/") return path.join(DIST_DIR, "index.html");
  // Strip leading "/" and write to {dist}/{route}/index.html
  const clean = route.replace(/^\/+/, "").replace(/\/+$/, "");
  return path.join(DIST_DIR, clean, "index.html");
}

async function renderRoute(browser, baseUrl, route) {
  const page = await browser.newPage();
  try {
    const url = `${baseUrl}${route}`;
    await page.goto(url, { waitUntil: "networkidle0", timeout: HYDRATION_TIMEOUT_MS });
    await page.waitForFunction(() => window.__APP_HYDRATED__ === true, {
      timeout: HYDRATION_TIMEOUT_MS,
    });
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    if (!/<title>[^<]+<\/title>/i.test(html)) {
      throw new Error("captured HTML has empty or missing <title>");
    }
    const out = outputPathFor(route);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, `<!doctype html>\n${html}`, "utf-8");
    return { route, ok: true, bytes: html.length };
  } finally {
    await page.close();
  }
}

// Small bounded-concurrency Promise pool.
async function runPool(items, limit, worker) {
  const results = [];
  let next = 0;
  async function pump() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i]).catch((err) => ({
        route: items[i],
        ok: false,
        error: err,
      }));
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, pump));
  return results;
}

// ---------------------------------------------------------------- main

async function main() {
  if (!existsSync(DIST_DIR)) {
    console.error("[prerender] dist/ does not exist — run `vite build` first.");
    process.exit(1);
  }

  const routes = await getAllRoutes();
  console.log(`[prerender] ${routes.length} routes to render (concurrency=${CONCURRENCY})`);

  const { server, port } = await startServer(DIST_DIR);
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let results = [];
  try {
    results = await runPool(routes, CONCURRENCY, (route) =>
      renderRoute(browser, baseUrl, route),
    );
  } finally {
    await browser.close();
    server.close();
  }

  const failures = results.filter((r) => !r.ok);
  for (const r of results) {
    if (r.ok) {
      console.log(`[prerender]  ok  ${r.route}  (${r.bytes} bytes)`);
    } else {
      console.error(`[prerender] FAIL ${r.route}: ${r.error?.message ?? r.error}`);
    }
  }
  console.log(
    `[prerender] ${results.length - failures.length}/${results.length} routes OK, ${failures.length} failed`,
  );
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("[prerender] fatal:", err);
  process.exit(1);
});
