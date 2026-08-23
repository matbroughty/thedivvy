// Tests for the word-map analysis pipeline.
//
// Uses Node's built-in test runner — no dependency needed. Run with:
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";

import { tokenize, isMeaningfulWord, analyseReviews } from "./word-analysis.mjs";
import { mdxToPlainText, parseFrontmatter } from "./mdx-text.mjs";
import { TUNING } from "./word-map-config.mjs";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal review record. */
function review(series, episode, text, extra = {}) {
  return {
    slug: `series-${series}-episode-${episode}-test`,
    title: `Test ${series}.${episode}`,
    series,
    episode,
    text,
    ...extra,
  };
}

/** Look a word up in the analysis output. */
function find(result, word) {
  return result.words.find((w) => w.word === word);
}

// ── normalisation ────────────────────────────────────────────────────────────

test("tokenize lowercases and splits on punctuation", () => {
  assert.deepEqual(tokenize("The Gold, the RAFT; the king."), [
    "the",
    "gold",
    "the",
    "raft",
    "the",
    "king",
  ]);
});

test("tokenize strips possessives but keeps contractions intact", () => {
  assert.deepEqual(tokenize("Lovejoy's van doesn't start"), [
    "lovejoy",
    "van",
    "doesn't",
    "start",
  ]);
});

test("tokenize folds curly apostrophes to straight ones", () => {
  // Both spellings must land on the same token, or the same word counts twice.
  assert.deepEqual(tokenize("Tinker’s"), tokenize("Tinker's"));
  assert.deepEqual(tokenize("Tinker’s"), ["tinker"]);
});

test("tokenize splits hyphens and dashes", () => {
  assert.deepEqual(tokenize("pre-Columbian"), ["pre", "columbian"]);
  assert.deepEqual(tokenize("gold — raft"), ["gold", "raft"]);
});

test("tokenize discards stray apostrophes and empty tokens", () => {
  assert.deepEqual(tokenize("'quoted' -- ' '"), ["quoted"]);
});

test("tokenize returns an empty array for empty input", () => {
  assert.deepEqual(tokenize(""), []);
  assert.deepEqual(tokenize(undefined), []);
});

// ── filtering ────────────────────────────────────────────────────────────────

test("stop words are rejected", () => {
  for (const word of ["the", "and", "with", "would", "really"]) {
    assert.equal(isMeaningfulWord(word), false, `"${word}" should be a stop word`);
  }
});

test("project exclusions are rejected", () => {
  for (const word of ["lovejoy", "episode", "series", "review", "bbc"]) {
    assert.equal(isMeaningfulWord(word), false, `"${word}" should be excluded`);
  }
});

test("short tokens are rejected", () => {
  assert.equal(isMeaningfulWord("go"), false);
  assert.equal(isMeaningfulWord("a"), false);
  assert.equal(isMeaningfulWord("gold"), true);
});

test("plain numbers are rejected but four-digit years survive", () => {
  assert.equal(isMeaningfulWord("42"), false);
  assert.equal(isMeaningfulWord("287"), false);
  assert.equal(isMeaningfulWord("40000"), false);
  assert.equal(isMeaningfulWord("1991"), true);
  assert.equal(isMeaningfulWord("1986"), true);
  assert.equal(isMeaningfulWord("9999"), false, "outside the plausible year range");
});

test("contractions are rejected via their stem", () => {
  // Negations lose the "n" too — "isn't" stems to "isn", which is why these
  // need handling separately from the "they're" / "we've" case.
  for (const word of ["isn't", "doesn't", "wasn't", "didn't", "couldn't"]) {
    assert.equal(isMeaningfulWord(word), false, `"${word}" should be rejected`);
  }
  for (const word of ["they're", "we've", "it's", "you'll", "i'm"]) {
    assert.equal(isMeaningfulWord(word), false, `"${word}" should be rejected`);
  }
});

test("contractions of meaningful stems are kept", () => {
  assert.equal(isMeaningfulWord("lovejoy's"), false, "excluded stem");
  assert.equal(isMeaningfulWord("suffolk's"), true, "meaningful stem survives");
});

test("character names are kept out of the general cloud", () => {
  // Character mode counts these; the cloud is about the language instead.
  for (const word of ["tinker", "eric", "jane", "gimbert", "felsham"]) {
    assert.equal(
      isMeaningfulWord(word),
      false,
      `"${word}" belongs to Character mode`,
    );
  }
});

test("meaningful words are accepted", () => {
  for (const word of ["raft", "colombian", "curse", "antiques"]) {
    assert.equal(isMeaningfulWord(word), true, `"${word}" should be kept`);
  }
});

// ── counting ─────────────────────────────────────────────────────────────────

test("counting is case-insensitive", () => {
  const result = analyseReviews([
    review(1, 1, "Curse CURSE curse Curse. Raft raft raft."),
  ]);
  assert.equal(find(result, "curse").count, 4);
  assert.equal(find(result, "raft").count, 3);
});

test("possessive and plain forms of a name collapse together", () => {
  const result = analyseReviews([
    review(1, 1, "The raft. The raft's edge. A raft again."),
  ]);
  assert.equal(find(result, "raft").count, 3);
});

// ── aggregation ──────────────────────────────────────────────────────────────

test("series aggregation splits counts by series", () => {
  const result = analyseReviews([
    review(1, 1, "curse curse curse"),
    review(1, 2, "curse curse"),
    review(2, 1, "curse"),
  ]);
  const curse = find(result, "curse");
  assert.equal(curse.count, 6);
  assert.deepEqual(curse.series, { 1: 5, 2: 1 });
});

test("episode aggregation records per-review counts and review totals", () => {
  const result = analyseReviews([
    review(1, 1, "curse curse curse"),
    review(1, 2, "raft raft raft"),
    review(2, 1, "curse curse curse"),
  ]);
  const curse = find(result, "curse");
  // Reviews are indexed in series/episode order: 0 = S1E1, 1 = S1E2, 2 = S2E1.
  assert.deepEqual(curse.episodes, [
    [0, 3],
    [2, 3],
  ]);
  assert.equal(curse.reviews, 2, "appears in two of the three reviews");
});

test("review indices in episodes[] resolve against the reviews array", () => {
  const result = analyseReviews([
    review(2, 1, "raft raft raft"),
    review(1, 1, "raft raft raft raft"),
  ]);
  const raft = find(result, "raft");
  // Input order was S2E1 then S1E1; output must be sorted so index 0 is S1E1.
  assert.equal(result.reviews[0].series, 1);
  assert.equal(result.reviews[1].series, 2);
  const [[firstIndex, firstCount]] = raft.episodes;
  assert.equal(result.reviews[firstIndex].series, 1);
  assert.equal(firstCount, 4);
});

test("seriesPresent lists only series that have reviews", () => {
  const result = analyseReviews([
    review(1, 1, "curse curse curse"),
    review(4, 2, "curse curse curse"),
  ]);
  assert.deepEqual(result.generatedFrom.seriesPresent, [1, 4]);
});

// ── characters ───────────────────────────────────────────────────────────────

test("character mode counts Lovejoy even though the cloud excludes him", () => {
  const result = analyseReviews([
    review(1, 1, "Lovejoy and Lovejoy and Tinker. Lovejoy again."),
  ]);
  assert.equal(find(result, "lovejoy"), undefined, "excluded from the cloud");
  const lovejoy = result.characters.find((c) => c.word === "Lovejoy");
  assert.equal(lovejoy.count, 3, "still counted as a character");
});

test("character aliases roll up into one canonical name", () => {
  const result = analyseReviews([
    review(1, 1, "Jane and Janey and Jane. Tinker and Tink."),
  ]);
  const jane = result.characters.find((c) => c.word === "Lady Jane");
  assert.equal(jane.count, 3);
  const tinker = result.characters.find((c) => c.word === "Tinker");
  assert.equal(tinker.count, 2);
});

test("characters carry the same series and episode breakdown as words", () => {
  const result = analyseReviews([
    review(1, 1, "Eric Eric"),
    review(2, 1, "Eric"),
  ]);
  const eric = result.characters.find((c) => c.word === "Eric");
  assert.deepEqual(eric.series, { 1: 2, 2: 1 });
  assert.deepEqual(eric.episodes, [
    [0, 2],
    [1, 1],
  ]);
});

// ── determinism ──────────────────────────────────────────────────────────────

test("output is byte-identical across repeated runs", () => {
  const input = [
    review(1, 1, "curse raft gold curse antiques gold"),
    review(2, 1, "gold raft raft curse antiques"),
  ];
  const a = JSON.stringify(analyseReviews(input));
  const b = JSON.stringify(analyseReviews(input));
  assert.equal(a, b);
});

test("output does not depend on the order reviews are supplied in", () => {
  const forwards = [
    review(1, 1, "curse raft gold"),
    review(1, 2, "gold raft raft"),
    review(2, 1, "curse curse gold"),
  ];
  const backwards = [...forwards].reverse();
  assert.equal(
    JSON.stringify(analyseReviews(forwards)),
    JSON.stringify(analyseReviews(backwards)),
  );
});

test("words on equal counts are ordered alphabetically, not by chance", () => {
  // Both appear three times; "alpha" must always precede "zulu".
  const result = analyseReviews([
    review(1, 1, "zulu zulu zulu alpha alpha alpha"),
  ]);
  const words = result.words.map((w) => w.word);
  assert.ok(words.indexOf("alpha") < words.indexOf("zulu"));
});

// ── thresholds and scaling ───────────────────────────────────────────────────

test("words below the minimum total count are dropped", () => {
  const result = analyseReviews([review(1, 1, "raft raft raft solitary")]);
  assert.equal(find(result, "raft").count, 3);
  assert.equal(
    find(result, "solitary"),
    undefined,
    `one mention is below the minimum of ${TUNING.minTotalCount}`,
  );
});

test("cloud size scales with review count and stays within bounds", () => {
  const one = analyseReviews([review(1, 1, "raft raft raft")]);
  assert.equal(one.tuning.cloudSize, TUNING.cloudWords.min);

  const many = analyseReviews(
    Array.from({ length: 200 }, (_, i) => review(1, i + 1, "raft raft raft")),
  );
  assert.equal(many.tuning.cloudSize, TUNING.cloudWords.max);
});

test("empty input produces a valid, empty result rather than throwing", () => {
  const result = analyseReviews([]);
  assert.equal(result.stats.reviewsAnalysed, 0);
  assert.equal(result.stats.topWord, null);
  assert.deepEqual(result.words, []);
  assert.deepEqual(result.generatedFrom.seriesPresent, []);
});

// ── summary stats ────────────────────────────────────────────────────────────

test("stats report totals, top word and top character", () => {
  const result = analyseReviews([
    review(1, 1, "Lovejoy curse curse curse raft raft"),
    review(2, 1, "Lovejoy Lovejoy curse raft"),
  ]);
  assert.equal(result.stats.reviewsAnalysed, 2);
  assert.equal(result.stats.totalWords, 10, "every token, before filtering");
  assert.equal(result.stats.topWord, "curse");
  assert.equal(result.stats.topWordCount, 4);
  assert.equal(result.stats.topCharacter, "Lovejoy");
  assert.equal(result.stats.topCharacterCount, 3);
});

// ── MDX text extraction ──────────────────────────────────────────────────────

test("mdxToPlainText strips JSX research comments", () => {
  const mdx = `Real prose here.

{/* Verified against the script:
  - Muisca raft, 287 grams, tumbaga alloy.
  - Do not let any of this reach the word counts.
*/}`;
  const text = mdxToPlainText(mdx);
  assert.match(text, /Real prose here/);
  assert.doesNotMatch(text, /Muisca/);
  assert.doesNotMatch(text, /tumbaga/);
  assert.doesNotMatch(text, /Verified/);
});

test("mdxToPlainText keeps Ep shortcode labels but drops the markup", () => {
  const text = mdxToPlainText(
    'See <Ep slug="series-2-episode-3-bin-diving">*Bin Diving*</Ep> for more.',
  );
  assert.match(text, /Bin Diving/);
  assert.doesNotMatch(text, /slug/);
  assert.doesNotMatch(text, /series-2-episode-3/);
});

test("mdxToPlainText strips emphasis, headings and blockquotes", () => {
  const text = mdxToPlainText("## A Heading\n\n> *quoted* **bold** `code`");
  assert.equal(text, "A Heading quoted bold code");
});

test("mdxToPlainText drops fenced code blocks", () => {
  const text = mdxToPlainText("Before\n\n```yaml\nsecret: value\n```\n\nAfter");
  assert.match(text, /Before/);
  assert.match(text, /After/);
  assert.doesNotMatch(text, /secret/);
});

test("parseFrontmatter separates frontmatter from body", () => {
  const { fm, body } = parseFrontmatter(
    '---\ntitle: "Montezuma\'s Revenge"\nseries: 2\nepisode: 4\n---\n\nBody text.',
  );
  assert.equal(fm.title, "Montezuma's Revenge");
  assert.equal(fm.series, "2");
  assert.equal(fm.episode, "4");
  assert.match(body, /Body text/);
  assert.doesNotMatch(body, /title:/);
});

test("parseFrontmatter tolerates a file with no frontmatter", () => {
  const { fm, body } = parseFrontmatter("Just prose.");
  assert.deepEqual(fm, {});
  assert.equal(body, "Just prose.");
});

// ── the integration guarantee ────────────────────────────────────────────────

test("adding a review changes the statistics with no other edits", () => {
  // This is the property the whole feature rests on: the generated data is a
  // pure function of the reviews on disk, so publishing a review is the only
  // action needed to move the numbers.
  const before = analyseReviews([review(1, 1, "curse curse curse raft raft")]);
  const after = analyseReviews([
    review(1, 1, "curse curse curse raft raft"),
    review(3, 1, "raft raft raft raft forgery forgery forgery"),
  ]);

  assert.equal(before.stats.reviewsAnalysed, 1);
  assert.equal(after.stats.reviewsAnalysed, 2);

  // A new series appears in the filters without being registered anywhere.
  assert.deepEqual(before.generatedFrom.seriesPresent, [1]);
  assert.deepEqual(after.generatedFrom.seriesPresent, [1, 3]);

  // The leader changes because the new review supplies the votes.
  assert.equal(before.stats.topWord, "curse");
  assert.equal(after.stats.topWord, "raft");

  // A word only in the new review is now present, with the right breakdown.
  const forgery = find(after, "forgery");
  assert.equal(forgery.count, 3);
  assert.deepEqual(forgery.series, { 3: 3 });
});
