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

// Same tolerant frontmatter reader as scripts/lib/routes.mjs.
function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return { fm: {}, body: source };
  const fm = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.+?)\s*$/);
    if (!m) continue;
    let value = m[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fm[m[1]] = value;
  }
  const body = source.slice(match[0].length);
  return { fm, body };
}

// Reduce MDX/markdown to plain text. We only need enough fidelity that
// searching for phrases in the rendered prose finds them.
function mdxToPlainText(mdx) {
  let text = mdx;
  // Strip fenced code blocks entirely — irrelevant to prose search.
  text = text.replace(/```[\s\S]*?```/g, " ");
  // JSX/HTML tags → space.
  text = text.replace(/<\/?[a-zA-Z][^>]*>/g, " ");
  // Images.
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  // Links → keep the label.
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  // Heading markers.
  text = text.replace(/^#{1,6}\s+/gm, "");
  // Blockquote markers.
  text = text.replace(/^>\s?/gm, "");
  // Bold / italic / strikethrough markers (leave the words).
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  text = text.replace(/\*(.+?)\*/g, "$1");
  text = text.replace(/__(.+?)__/g, "$1");
  text = text.replace(/_(.+?)_/g, "$1");
  text = text.replace(/~~(.+?)~~/g, "$1");
  // Inline code.
  text = text.replace(/`([^`]+)`/g, "$1");
  // Horizontal rules.
  text = text.replace(/^-{3,}$/gm, " ");
  // Collapse whitespace.
  text = text.replace(/\s+/g, " ").trim();
  return text;
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
