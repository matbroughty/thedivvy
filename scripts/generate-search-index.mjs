// Emits public/search-index.json — one JSON doc per episode, consumed at
// runtime by src/pages/SearchPage.tsx which builds a MiniSearch index in the
// browser on first keystroke.
//
// The MDX body is stripped down to plain text (headings, formatting, links,
// blockquotes) so the index stays compact and search hits land on the words a
// reader would actually see.
//
// Run as part of `npm run build` (before prerender so the file is present in
// dist/) and via `predev` so `npm run dev` has an up-to-date index too.

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Shared with scripts/generate-word-stats.mjs so search results and word
// counts are derived from an identical view of each review. Note that search
// deliberately keeps headings — a reader looking for "Favourite Moment"
// should find it — whereas the word counts drop them as structural.
import { parseFrontmatter, mdxToPlainText } from "./lib/mdx-text.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REVIEWS_DIR = path.join(ROOT, "src", "content", "reviews");
const OUT_DIR = path.join(ROOT, "public");
const OUT_FILE = path.join(OUT_DIR, "search-index.json");

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

async function main() {
  if (!existsSync(REVIEWS_DIR)) {
    console.warn(`[search] no reviews directory at ${REVIEWS_DIR}`);
    return;
  }
  const files = await walk(REVIEWS_DIR);
  const docs = [];
  for (const file of files) {
    const src = await readFile(file, "utf-8");
    const { fm, body } = parseFrontmatter(src);
    if (!fm.slug || !fm.title) {
      console.warn(
        `[search] skipping ${path.relative(ROOT, file)} — missing slug/title`,
      );
      continue;
    }
    docs.push({
      slug: fm.slug,
      title: fm.title,
      series: Number(fm.series),
      episode: Number(fm.episode),
      ...(fm.episodeEnd ? { episodeEnd: Number(fm.episodeEnd) } : {}),
      summary: fm.summary ?? "",
      divvyMoment: fm.divvyMoment ?? "",
      guestStar: fm.guestStar ?? "",
      body: mdxToPlainText(body),
    });
  }
  docs.sort((a, b) =>
    a.series === b.series ? a.episode - b.episode : a.series - b.series,
  );

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(docs), "utf-8");
  const kb = (Buffer.byteLength(JSON.stringify(docs), "utf-8") / 1024).toFixed(
    1,
  );
  console.log(
    `[search] wrote ${docs.length} docs to ${path.relative(ROOT, OUT_FILE)} (${kb} KB)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
