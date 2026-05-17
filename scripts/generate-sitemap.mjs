// Generates dist/sitemap.xml after `vite build`. Reads MDX files from
// src/content/reviews/ and discovers each episode by its frontmatter slug.
// Static routes are listed below.
//
// Set the production hostname via the SITE_URL env var, or edit the default.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REVIEWS_DIR = path.join(ROOT, "src", "content", "reviews");
const DIST_DIR = path.join(ROOT, "dist");

const SITE_URL = (
  process.env.SITE_URL ?? "https://thedivvy.example.com"
).replace(/\/$/, "");

// ---------------------------------------------------------------- helpers

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      if (e.isFile() && full.endsWith(".mdx")) return [full];
      return [];
    }),
  );
  return files.flat();
}

// Cheap-but-sufficient YAML frontmatter extractor for the fields we know
// we'll have. Pulls "key: value" pairs, strips quotes. Anything more
// elaborate would mean adding a YAML parser dependency just for this.
function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.+)\s*$/);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[m[1]] = value;
  }
  return out;
}

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

  // Discover episode entries from MDX frontmatter
  const mdxFiles = existsSync(REVIEWS_DIR) ? await walk(REVIEWS_DIR) : [];
  const episodes = [];
  for (const file of mdxFiles) {
    const src = await readFile(file, "utf-8");
    const fm = parseFrontmatter(src);
    if (!fm.slug) {
      console.warn(`[sitemap] skipping ${path.relative(ROOT, file)} — no slug in frontmatter`);
      continue;
    }
    episodes.push({
      slug: fm.slug,
      series: Number(fm.series),
      lastmod: reviewDateToIso(fm.reviewDate),
    });
  }

  const seriesNumbers = [
    ...new Set(episodes.map((e) => e.series).filter((n) => Number.isFinite(n))),
  ].sort((a, b) => a - b);

  // Always advertise all six series even if some are empty — they're real pages
  const allSeries = [1, 2, 3, 4, 5, 6];

  // Build url list
  const today = new Date().toISOString().slice(0, 10);
  const urls = [];

  urls.push(urlEntry(`${SITE_URL}/`, today, "weekly", "1.0"));
  urls.push(urlEntry(`${SITE_URL}/series`, today, "weekly", "0.7"));
  urls.push(urlEntry(`${SITE_URL}/archive`, today, "weekly", "0.6"));
  urls.push(urlEntry(`${SITE_URL}/lovejoy-overview`, today, "monthly", "0.7"));
  urls.push(urlEntry(`${SITE_URL}/about`, today, "yearly", "0.4"));

  for (const s of allSeries) {
    urls.push(
      urlEntry(`${SITE_URL}/series/${s}`, today, "weekly", "0.6"),
    );
  }

  for (const ep of episodes) {
    urls.push(
      urlEntry(
        `${SITE_URL}/episodes/${ep.slug}`,
        ep.lastmod ?? today,
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
    `[sitemap] wrote ${urls.length} URLs (${episodes.length} episodes, ${seriesNumbers.length} series with reviews) → dist/sitemap.xml`,
  );
}

main().catch((err) => {
  console.error("[sitemap] failed:", err);
  process.exitCode = 1;
});
