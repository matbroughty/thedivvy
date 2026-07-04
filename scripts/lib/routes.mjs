// Single source of truth for the site's route list.
// Used by:
//   - scripts/generate-sitemap.mjs  (sitemap.xml URLs)
//   - scripts/generate-feed.mjs     (feed.xml items)
//   - scripts/prerender.mjs         (build-time prerendering targets)
//
// Routes are returned as absolute paths beginning with "/". Order is stable
// and deterministic so the sitemap and prerender output are reproducible.

import { readdir, readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const REVIEWS_DIR = path.join(ROOT, "src", "content", "reviews");

const STATIC_ROUTES = [
  "/",
  "/series",
  "/series/1",
  "/series/2",
  "/series/3",
  "/series/4",
  "/series/5",
  "/series/6",
  "/archive",
  "/lovejoy-overview",
  "/characters",
  "/soundtrack",
  "/search",
  "/about",
  "/links",
];

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

// Tolerant YAML frontmatter extractor — same logic as generate-sitemap.mjs.
// Pulls "key: value" pairs from the frontmatter block, strips surrounding quotes.
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

async function getEpisodeRoutes() {
  if (!existsSync(REVIEWS_DIR)) return [];
  const mdxFiles = await walk(REVIEWS_DIR);
  const slugs = [];
  for (const file of mdxFiles) {
    const src = await readFile(file, "utf-8");
    const fm = parseFrontmatter(src);
    if (!fm.slug) {
      console.warn(
        `[routes] skipping ${path.relative(ROOT, file)} — no slug in frontmatter`,
      );
      continue;
    }
    slugs.push(fm.slug);
  }
  slugs.sort();
  return slugs.map((slug) => `/episodes/${slug}`);
}

/**
 * Return the full canonical list of routes for the site.
 * Static routes first (in fixed order), then episode routes (sorted by slug).
 */
export async function getAllRoutes() {
  const episodes = await getEpisodeRoutes();
  return [...STATIC_ROUTES, ...episodes];
}

/**
 * Return episode routes along with their parsed frontmatter (for callers that
 * need per-episode metadata, e.g. sitemap lastmod or feed items).
 */
export async function getEpisodeEntries() {
  if (!existsSync(REVIEWS_DIR)) return [];
  const mdxFiles = await walk(REVIEWS_DIR);
  const entries = [];
  for (const file of mdxFiles) {
    const src = await readFile(file, "utf-8");
    const fm = parseFrontmatter(src);
    if (!fm.slug) continue;
    entries.push({
      slug: fm.slug,
      series: Number(fm.series),
      episode: Number(fm.episode),
      title: fm.title,
      summary: fm.summary,
      reviewDate: fm.reviewDate,
    });
  }
  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  return entries;
}

/**
 * Resolve the production site URL: SITE_URL env var, then VITE_SITE_URL from
 * .env.production (the same value Vite gives the frontend), then a placeholder.
 * Trailing slash is stripped.
 */
export function getSiteUrl() {
  const envPath = path.join(ROOT, ".env.production");
  let fromFile;
  if (existsSync(envPath)) {
    const contents = readFileSync(envPath, "utf-8");
    const match = contents.match(/^VITE_SITE_URL\s*=\s*(.+?)\s*$/m);
    if (match) fromFile = match[1].replace(/^["']|["']$/g, "");
  }
  return (
    process.env.SITE_URL ??
    fromFile ??
    "https://thedivvy.example.com"
  ).replace(/\/$/, "");
}
