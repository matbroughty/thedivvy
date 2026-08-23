// Shared MDX → plain text helpers for the build-time generators.
//
// Used by:
//   - scripts/generate-search-index.mjs  (public/search-index.json)
//   - scripts/generate-word-stats.mjs    (src/data/word-stats.json)
//
// Both need the same thing: the prose a reader would actually see, with the
// MDX scaffolding taken off. Keeping one implementation means search results
// and word counts are derived from an identical view of each review.

/**
 * Tolerant YAML frontmatter reader. Deliberately regex-based rather than a
 * real YAML parser, because these scripts run in plain Node with no access to
 * the Vite/MDX pipeline. Same approach as scripts/lib/routes.mjs.
 *
 * Only flat `key: value` pairs are read — nested blocks (e.g. `soundtrack:`)
 * are ignored, which is fine because no caller needs them.
 */
export function parseFrontmatter(source) {
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
  return { fm, body: source.slice(match[0].length) };
}

/**
 * Reduce an MDX review body to the plain prose it renders as.
 *
 * Ordering matters here. JSX comments are stripped before tags, because a
 * comment can legally contain angle brackets; fenced code goes first because
 * it can contain anything at all.
 */
export function mdxToPlainText(mdx, { dropHeadings = false } = {}) {
  let text = mdx;

  // Headings are structural furniture on this site, not prose: every review
  // carries "One Wink Plot", "Review", "Favourite Moment", "Good Quote",
  // "Guest Focus — X" and "The Divvy Verdict". Counting them puts one hit per
  // review on each of those words and tells us nothing about the writing, so
  // the word-map generator drops them. Search keeps them — a reader looking
  // for "favourite moment" should still find it.
  if (dropHeadings) {
    text = text.replace(/^#{1,6}\s+.*$/gm, " ");
  }

  // Fenced code blocks — never prose.
  text = text.replace(/```[\s\S]*?```/g, " ");

  // JSX expression comments: {/* ... */}. Every review carries a research
  // trail in one of these (verified facts, things deliberately left out,
  // material cut for length). None of it is rendered, so none of it should
  // reach the search index or the word counts.
  text = text.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, " ");

  // JSX/HTML tags → space. Children survive, which is what we want: the
  // <Ep slug="...">Bin Diving</Ep> shortcode renders its label as prose.
  text = text.replace(/<\/?[a-zA-Z][^>]*>/g, " ");

  // Images (dropped) then links (label kept).
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  // Block markers.
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/^>\s?/gm, "");
  text = text.replace(/^-{3,}$/gm, " ");

  // Emphasis markers (leave the words).
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  text = text.replace(/\*(.+?)\*/g, "$1");
  text = text.replace(/__(.+?)__/g, "$1");
  text = text.replace(/_(.+?)_/g, "$1");
  text = text.replace(/~~(.+?)~~/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");

  return text.replace(/\s+/g, " ").trim();
}
