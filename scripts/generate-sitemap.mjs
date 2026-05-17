// Generates dist/sitemap.xml after `vite build`.
//
// Route enumeration is delegated to scripts/lib/routes.mjs so the sitemap
// and the build-time prerender share a single source of truth.
//
// Set the production hostname via the SITE_URL env var, the VITE_SITE_URL
// entry in .env.production, or edit the default.

import { writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEpisodeEntries } from "./lib/routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");

// Fall back to .env.production so the site URL has a single source of truth.
// Vite reads VITE_SITE_URL from .env.production for the frontend; we read the
// same file here so the sitemap stays in sync without an extra env var on
// Amplify.
function readSiteUrlFromEnvFile() {
  const envPath = path.join(ROOT, ".env.production");
  if (!existsSync(envPath)) return undefined;
  const contents = readFileSync(envPath, "utf-8");
  const match = contents.match(/^VITE_SITE_URL\s*=\s*(.+?)\s*$/m);
  return match ? match[1].replace(/^["']|["']$/g, "") : undefined;
}

const SITE_URL = (
  process.env.SITE_URL ??
  readSiteUrlFromEnvFile() ??
  "https://thedivvy.example.com"
).replace(/\/$/, "");

// ---------------------------------------------------------------- helpers

function urlEntry(loc, lastmod, changefreq = "monthly", priority = "0.5") {
  const lastmodLine = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>
    <loc>${loc}</loc>${lastmodLine}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function reviewDateToIso(input) {
  if (!input) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  if (/^\d{4}-\d{2}$/.test(input)) return `${input}-01`;
  return undefined;
}

// ---------------------------------------------------------------- main

async function main() {
  if (!existsSync(DIST_DIR)) {
    console.error(
      "[sitemap] dist/ does not exist — run `vite build` before this script.",
    );
    process.exitCode = 1;
    return;
  }

  const episodes = await getEpisodeEntries();
  const seriesWithReviews = [
    ...new Set(episodes.map((e) => e.series).filter((n) => Number.isFinite(n))),
  ].sort((a, b) => a - b);
  const allSeries = [1, 2, 3, 4, 5, 6];

  const today = new Date().toISOString().slice(0, 10);
  const urls = [];

  urls.push(urlEntry(`${SITE_URL}/`, today, "weekly", "1.0"));
  urls.push(urlEntry(`${SITE_URL}/series`, today, "weekly", "0.7"));
  urls.push(urlEntry(`${SITE_URL}/archive`, today, "weekly", "0.6"));
  urls.push(urlEntry(`${SITE_URL}/lovejoy-overview`, today, "monthly", "0.7"));
  urls.push(urlEntry(`${SITE_URL}/about`, today, "yearly", "0.4"));
  urls.push(urlEntry(`${SITE_URL}/links`, today, "monthly", "0.4"));

  for (const s of allSeries) {
    urls.push(urlEntry(`${SITE_URL}/series/${s}`, today, "weekly", "0.6"));
  }

  for (const ep of episodes) {
    urls.push(
      urlEntry(
        `${SITE_URL}/episodes/${ep.slug}`,
        reviewDateToIso(ep.reviewDate) ?? today,
        "monthly",
        "0.8",
      ),
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  const outPath = path.join(DIST_DIR, "sitemap.xml");
  await writeFile(outPath, xml, "utf-8");
  console.log(
    `[sitemap] wrote ${urls.length} URLs (${episodes.length} episodes, ${seriesWithReviews.length} series with reviews) → dist/sitemap.xml`,
  );
}

main().catch((err) => {
  console.error("[sitemap] failed:", err);
  process.exitCode = 1;
});
