// Generates dist/sitemap.xml after `vite build`.
//
// Route enumeration is delegated to scripts/lib/routes.mjs so the sitemap
// and the build-time prerender share a single source of truth.
//
// Set the production hostname via the SITE_URL env var, the VITE_SITE_URL
// entry in .env.production, or edit the default in scripts/lib/routes.mjs.

import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAllRoutes, getEpisodeEntries, getSiteUrl } from "./lib/routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");

const SITE_URL = getSiteUrl();

// ---------------------------------------------------------------- helpers

function urlEntry(loc, lastmod, changefreq = "monthly", priority = "0.5") {
  const lastmodLine = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>
    <loc>${loc}</loc>${lastmodLine}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// Per-route changefreq/priority hints. Anything prerendered but not listed
// here still gets into the sitemap on the default below — the list is for
// tuning, not for deciding membership, so a new page can never be silently
// left out again.
const ROUTE_HINTS = {
  "/": ["weekly", "1.0"],
  "/series": ["weekly", "0.7"],
  "/archive": ["weekly", "0.6"],
  "/lovejoy-overview": ["monthly", "0.7"],
  "/characters": ["monthly", "0.7"],
  "/soundtrack": ["monthly", "0.6"],
  "/novels": ["monthly", "0.6"],
  "/about": ["yearly", "0.4"],
  "/links": ["monthly", "0.4"],
};
const DEFAULT_HINT = ["monthly", "0.5"];

// /search is a client-side search box with no content of its own — the one
// route we deliberately keep out of the sitemap.
const SITEMAP_EXCLUDE = new Set(["/search"]);

function hintFor(route) {
  if (ROUTE_HINTS[route]) return ROUTE_HINTS[route];
  if (/^\/series\/\d+$/.test(route)) return ["weekly", "0.6"];
  if (/^\/series\/\d+\/overview$/.test(route)) return ["monthly", "0.7"];
  return DEFAULT_HINT;
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

  // Episode reviews carry their own lastmod, so index them by route.
  const episodeByRoute = new Map(
    episodes.map((ep) => [`/episodes/${ep.slug}`, ep]),
  );

  const today = new Date().toISOString().slice(0, 10);
  const routes = await getAllRoutes();
  const urls = [];

  for (const route of routes) {
    if (SITEMAP_EXCLUDE.has(route)) continue;
    const episode = episodeByRoute.get(route);
    if (episode) {
      urls.push(
        urlEntry(
          `${SITE_URL}${route}`,
          reviewDateToIso(episode.reviewDate) ?? today,
          "monthly",
          "0.8",
        ),
      );
      continue;
    }
    const [changefreq, priority] = hintFor(route);
    urls.push(
      urlEntry(
        `${SITE_URL}${route === "/" ? "/" : route}`,
        today,
        changefreq,
        priority,
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
