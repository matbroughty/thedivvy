// Generates dist/feed.xml (RSS 2.0) after `vite build`.
//
// Episode metadata comes from scripts/lib/routes.mjs so the feed, sitemap and
// prerender all share a single source of truth. Items are newest-first by
// reviewDate (falling back to series/episode order for undated reviews).

import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEpisodeEntries, getSiteUrl } from "./lib/routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");

const SITE_URL = getSiteUrl();
const FEED_TITLE = "The Divvy — Lovejoy reviews";
const FEED_DESCRIPTION =
  "Weekly reviews of every episode of Lovejoy, the BBC's finest dodgy-antiques-dealer drama.";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// reviewDate is "YYYY-MM-DD" or "YYYY-MM" (treated as the 1st of the month).
function reviewDateToIso(input) {
  if (!input) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  if (/^\d{4}-\d{2}$/.test(input)) return `${input}-01`;
  return undefined;
}

function toPubDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toUTCString();
}

async function main() {
  if (!existsSync(DIST_DIR)) {
    console.error(
      "[feed] dist/ does not exist — run `vite build` before this script.",
    );
    process.exitCode = 1;
    return;
  }

  const episodes = await getEpisodeEntries();
  episodes.sort((a, b) => {
    const dateA = reviewDateToIso(a.reviewDate) ?? "";
    const dateB = reviewDateToIso(b.reviewDate) ?? "";
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    if (a.series !== b.series) return b.series - a.series;
    return b.episode - a.episode;
  });

  const items = episodes.map((ep) => {
    const url = `${SITE_URL}/episodes/${ep.slug}`;
    const iso = reviewDateToIso(ep.reviewDate);
    const title = `${ep.title} — Lovejoy S${ep.series}E${ep.episode} review`;
    const pubDateLine = iso
      ? `\n      <pubDate>${toPubDate(iso)}</pubDate>`
      : "";
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>${pubDateLine}
      <description>${escapeXml(ep.summary ?? "")}</description>
    </item>`;
  });

  const newest = episodes
    .map((ep) => reviewDateToIso(ep.reviewDate))
    .filter(Boolean)
    .sort()
    .pop();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en-gb</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>${
      newest ? `\n    <lastBuildDate>${toPubDate(newest)}</lastBuildDate>` : ""
    }
${items.join("\n")}
  </channel>
</rss>
`;

  const outPath = path.join(DIST_DIR, "feed.xml");
  await writeFile(outPath, xml, "utf-8");
  console.log(`[feed] wrote ${items.length} items → dist/feed.xml`);
}

main().catch((err) => {
  console.error("[feed] failed:", err);
  process.exitCode = 1;
});
