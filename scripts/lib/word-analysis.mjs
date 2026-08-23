// Word-frequency analysis for the /word-map page.
//
// Pure functions only — no filesystem, no console, no clock. Everything here
// is deterministic for a given input, which is what lets the generated JSON
// be stable across builds (so the cloud does not rearrange itself on every
// deploy) and what makes it testable in scripts/lib/word-analysis.test.mjs.
//
// The IO wrapper lives in scripts/generate-word-stats.mjs.

import {
  PROJECT_EXCLUSIONS,
  STOP_WORDS,
  CHARACTERS,
  TUNING,
  EXCLUDE_CHARACTERS_FROM_CLOUD,
} from "./word-map-config.mjs";

const STOP_SET = new Set(STOP_WORDS);

const EXCLUDED_SET = new Set([
  ...PROJECT_EXCLUSIONS,
  // Character aliases are folded into the cloud's exclusion list when the
  // config asks for it, so the two views stay complementary rather than
  // duplicating each other. Character mode reads CHARACTERS directly and is
  // unaffected.
  ...(EXCLUDE_CHARACTERS_FROM_CLOUD
    ? CHARACTERS.flatMap((c) => c.aliases.map((a) => a.toLowerCase()))
    : []),
]);

/**
 * Split prose into normalised lowercase tokens.
 *
 * Apostrophes: curly quotes are folded to straight ones first, then a
 * trailing possessive is dropped ("Lovejoy's" → "lovejoy") while genuine
 * contractions survive as one token ("don't" → "don't"), where they are
 * caught by the stop-word list anyway.
 *
 * Hyphens and em-dashes split, so "pre-Columbian" contributes "pre" and
 * "columbian" — the second of which is the interesting half.
 *
 * No filtering happens here. Tokenising and filtering are separate steps
 * because Character mode needs the unfiltered stream (it counts "lovejoy",
 * which the general cloud excludes).
 */
export function tokenize(text) {
  if (!text) return [];
  const normalised = text
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[–—‒]/g, " ")
    .toLowerCase();

  const tokens = [];
  for (const raw of normalised.split(/[^a-z0-9']+/)) {
    let token = raw.replace(/^'+|'+$/g, "");
    if (!token) continue;
    token = token.replace(/'s$/, "");
    if (!token) continue;
    tokens.push(token);
  }
  return tokens;
}

/**
 * Is this token worth counting in the general word cloud?
 *
 * Pure digits are dropped unless they look like a meaningful year, so 1991
 * and 1986 survive while "20" and "1500" (a valuation) do not.
 */
export function isMeaningfulWord(token) {
  if (token.length < TUNING.minWordLength) return false;
  if (STOP_SET.has(token)) return false;
  if (EXCLUDED_SET.has(token)) return false;

  // Contractions: judge them by their stem, so "isn't", "doesn't", "they're"
  // and "we've" all fall to the stop-word list that already covers "is",
  // "does", "they" and "we". Cheaper and more complete than listing every
  // contracted form by hand.
  //
  // Negations need the "n" back off the front — "isn't" splits to "isn", not
  // "is" — so they are handled before the general case.
  if (token.includes("'")) {
    const stem = token.endsWith("n't")
      ? token.slice(0, -3)
      : token.slice(0, token.indexOf("'"));
    if (stem && (STOP_SET.has(stem) || EXCLUDED_SET.has(stem))) return false;
  }

  if (/^\d+$/.test(token)) {
    const [lo, hi] = TUNING.yearRange;
    const n = Number(token);
    return token.length === 4 && n >= lo && n <= hi;
  }

  // Reject tokens with no letters at all (e.g. leftover "1st" survives, "12'" does not).
  return /[a-z]/.test(token);
}

/** Count occurrences into a Map, in first-seen order. */
function tally(tokens, predicate) {
  const counts = new Map();
  for (const token of tokens) {
    if (predicate && !predicate(token)) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

/**
 * Deterministic ordering: highest count first, then alphabetical. The
 * alphabetical tiebreak is the part that matters — without it, two words on
 * equal counts could swap places between builds and visibly reshuffle the
 * cloud for no reason.
 */
function byCountThenWord(a, b) {
  if (b.count !== a.count) return b.count - a.count;
  return a.word.localeCompare(b.word, "en");
}

/** Map a character alias back to its canonical name. */
function buildAliasIndex(characters) {
  const index = new Map();
  for (const character of characters) {
    for (const alias of character.aliases) {
      index.set(alias.toLowerCase(), character.name);
    }
  }
  return index;
}

/**
 * Analyse a set of reviews into the shape the page consumes.
 *
 * @param reviews Array of { slug, title, series, episode, episodeEnd?, text }
 * @returns The full stats object, ready to be serialised to JSON.
 */
export function analyseReviews(reviews) {
  // Stable review order: series, then episode. The `reviews` array is
  // referenced by index throughout the output, so this order is load-bearing.
  const ordered = [...reviews].sort((a, b) =>
    a.series === b.series ? a.episode - b.episode : a.series - b.series,
  );

  const aliasIndex = buildAliasIndex(CHARACTERS);

  /** word → { total, series: Map<number, count>, episodes: Map<index, count> } */
  const words = new Map();
  /** character name → same shape */
  const characters = new Map();

  let totalWords = 0;

  ordered.forEach((review, reviewIndex) => {
    const tokens = tokenize(review.text);
    totalWords += tokens.length;

    // Pass one: the general cloud, filtered.
    for (const [word, count] of tally(tokens, isMeaningfulWord)) {
      const entry = words.get(word) ?? {
        total: 0,
        series: new Map(),
        episodes: new Map(),
      };
      entry.total += count;
      entry.series.set(review.series, (entry.series.get(review.series) ?? 0) + count);
      entry.episodes.set(reviewIndex, count);
      words.set(word, entry);
    }

    // Pass two: characters, from the same token stream so the two views can
    // never disagree. Unfiltered, because "lovejoy" is excluded above.
    const perCharacter = new Map();
    for (const token of tokens) {
      const name = aliasIndex.get(token);
      if (!name) continue;
      perCharacter.set(name, (perCharacter.get(name) ?? 0) + 1);
    }
    for (const [name, count] of perCharacter) {
      const entry = characters.get(name) ?? {
        total: 0,
        series: new Map(),
        episodes: new Map(),
      };
      entry.total += count;
      entry.series.set(review.series, (entry.series.get(review.series) ?? 0) + count);
      entry.episodes.set(reviewIndex, count);
      characters.set(name, entry);
    }
  });

  const uniqueMeaningfulWords = words.size;

  const serialise = (map) =>
    [...map.entries()]
      .map(([word, entry]) => ({
        word,
        count: entry.total,
        reviews: entry.episodes.size,
        series: Object.fromEntries(
          [...entry.series.entries()].sort((a, b) => a[0] - b[0]),
        ),
        // [reviewIndex, count] pairs, sorted by index — compact and stable.
        episodes: [...entry.episodes.entries()].sort((a, b) => a[0] - b[0]),
      }))
      .sort(byCountThenWord);

  const allWords = serialise(words).filter(
    (w) => w.count >= TUNING.minTotalCount,
  );
  const retained = allWords.slice(0, TUNING.retainWords);

  const characterList = serialise(characters).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.word.localeCompare(b.word, "en");
  });

  const seriesPresent = [...new Set(ordered.map((r) => r.series))].sort(
    (a, b) => a - b,
  );

  const cloudSize = Math.min(
    TUNING.cloudWords.max,
    Math.max(TUNING.cloudWords.min, ordered.length * TUNING.cloudWords.perReview),
  );

  return {
    // Metadata the page needs but should not have to recompute.
    generatedFrom: {
      reviewCount: ordered.length,
      seriesPresent,
    },
    tuning: {
      cloudSize,
      heatMapWords: TUNING.heatMapWords,
      minTotalCount: TUNING.minTotalCount,
    },
    reviews: ordered.map((r) => ({
      slug: r.slug,
      title: r.title,
      series: r.series,
      episode: r.episode,
      ...(r.episodeEnd ? { episodeEnd: r.episodeEnd } : {}),
    })),
    stats: {
      reviewsAnalysed: ordered.length,
      totalWords,
      uniqueMeaningfulWords,
      topWord: retained[0]?.word ?? null,
      topWordCount: retained[0]?.count ?? 0,
      topCharacter: characterList[0]?.word ?? null,
      topCharacterCount: characterList[0]?.count ?? 0,
    },
    words: retained,
    characters: characterList,
  };
}
