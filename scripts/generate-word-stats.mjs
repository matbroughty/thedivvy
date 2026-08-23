// Emits src/data/word-stats.json — the data behind /word-map.
//
// Walks every review MDX, reduces each body to the prose it renders as, and
// hands the lot to analyseReviews() for counting. All the interesting logic
// lives in scripts/lib/word-analysis.mjs (pure, tested); this file is just IO.
//
// Output goes to src/data/ rather than public/ on purpose. The page imports
// the JSON as a module so React can render the cloud synchronously, which is
// what lets scripts/prerender.mjs capture it as real HTML — giving us both a
// crawlable page and a no-JavaScript fallback. A runtime fetch would prerender
// as an empty loading state.
//
// Runs in `npm run build` (before tsc, since TypeScript type-checks the
// import) and in `predev`. On demand: `npm run generate:words`.
//
// To change what gets counted, edit scripts/lib/word-map-config.mjs.

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseFrontmatter, mdxToPlainText } from "./lib/mdx-text.mjs";
import { analyseReviews } from "./lib/word-analysis.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REVIEWS_DIR = path.join(ROOT, "src", "content", "reviews");
const OUT_DIR = path.join(ROOT, "src", "data");
const OUT_FILE = path.join(OUT_DIR, "word-stats.json");

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
    console.warn(`[words] no reviews directory at ${REVIEWS_DIR}`);
    return;
  }

  const files = (await walk(REVIEWS_DIR)).sort();
  const reviews = [];

  for (const file of files) {
    const src = await readFile(file, "utf-8");
    const { fm, body } = parseFrontmatter(src);

    // Mirror the runtime loader in src/lib/episodes.ts: a review missing its
    // identifying fields never appears on the site, so it should not be
    // counted here either.
    if (!fm.slug || !fm.title || !fm.series || !fm.episode) {
      console.warn(
        `[words] skipping ${path.relative(ROOT, file)} — missing slug/title/series/episode`,
      );
      continue;
    }

    reviews.push({
      slug: fm.slug,
      title: fm.title,
      series: Number(fm.series),
      episode: Number(fm.episode),
      ...(fm.episodeEnd ? { episodeEnd: Number(fm.episodeEnd) } : {}),
      // dropHeadings: section titles are the same in every review, so they
      // would otherwise add one hit per review to "plot", "moment", "quote",
      // "verdict" and "focus" without saying anything about the prose.
      text: mdxToPlainText(body, { dropHeadings: true }),
    });
  }

  const result = analyseReviews(reviews);

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });
  // Pretty-printed with a trailing newline: this file is committed, so a
  // readable diff is worth the extra bytes (Vite minifies it into the bundle).
  const json = `${JSON.stringify(result, null, 2)}\n`;
  await writeFile(OUT_FILE, json, "utf-8");

  const kb = (Buffer.byteLength(json, "utf-8") / 1024).toFixed(1);
  console.log(
    `[words] analysed ${result.stats.reviewsAnalysed} reviews · ` +
      `${result.stats.totalWords.toLocaleString("en-GB")} words · ` +
      `${result.stats.uniqueMeaningfulWords.toLocaleString("en-GB")} unique · ` +
      `top word "${result.stats.topWord}" (${result.stats.topWordCount})`,
  );
  console.log(
    `[words] wrote ${result.words.length} words + ${result.characters.length} characters ` +
      `to ${path.relative(ROOT, OUT_FILE)} (${kb} KB)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
