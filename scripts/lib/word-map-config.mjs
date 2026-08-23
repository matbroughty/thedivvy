// ─────────────────────────────────────────────────────────────────────────────
//  THE DIVVY WORD MAP — CONFIGURATION
//
//  This is the file to edit. Everything the /word-map page shows is driven
//  from here: which words get ignored, which characters get tracked, and how
//  many words make the cut.
//
//  After editing, run:   npm run generate:words
//  (or just `npm run build`, which does it for you)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Words specific to this site that would dominate the cloud without telling
 * us anything. Add freely — one word per entry, lowercase.
 *
 * Note that "lovejoy" is excluded from the general cloud but is still counted
 * in Character mode below, which is the whole point of having two views.
 */
export const PROJECT_EXCLUSIONS = [
  "lovejoy",
  "episode",
  "episodes",
  "series",
  "review",
  "reviews",
  "bbc",
  "divvy",
  "week",
  "watch",
  "watching",
  "watched",
  "scene",
  "scenes",
  // Almost always the first half of "Lady Jane", so it rides along behind a
  // name that Character mode already counts. Not a theme on its own.
  "lady",
];

/**
 * Should recurring character names be kept out of the general word cloud?
 *
 * `true` (the default) keeps the cloud about the *language* of the reviews —
 * antiques, forgery, Suffolk, curses — and leaves the names to Character mode,
 * which exists to count them properly. With this off, Eric, Jane, Tinker and
 * Gimbert take roughly a third of the top twenty and the two views largely
 * duplicate each other.
 *
 * Set to `false` if you would rather see names in the main cloud. Lovejoy
 * himself is excluded either way, via PROJECT_EXCLUSIONS above.
 */
export const EXCLUDE_CHARACTERS_FROM_CLOUD = true;

/**
 * Recurring characters worth tracking in Character mode.
 *
 * `aliases` roll up into the canonical `name`, so "Janey" and "Lady Jane"
 * both count toward Jane. Aliases are matched against single lowercase
 * tokens, so multi-word aliases need their distinctive word only.
 *
 * Add a character here and it appears in Character mode automatically —
 * nothing else needs changing.
 */
export const CHARACTERS = [
  { name: "Lovejoy", aliases: ["lovejoy"] },
  { name: "Tinker", aliases: ["tinker", "tink"] },
  { name: "Eric", aliases: ["eric"] },
  { name: "Lady Jane", aliases: ["jane", "janey"] },
  { name: "Charlie Gimbert", aliases: ["gimbert"] },
  { name: "Lord Felsham", aliases: ["alexander", "felsham"] },
  { name: "Dandy Jack", aliases: ["dandy"] },
  { name: "Beth", aliases: ["beth"] },
];

/**
 * Tuning. These are deliberately generous rather than clever — there are only
 * ever going to be about seventy reviews on this site.
 */
export const TUNING = {
  /** Tokens shorter than this are dropped as noise. */
  minWordLength: 3,

  /** A word needs at least this many total mentions to be kept at all. */
  minTotalCount: 3,

  /**
   * How many words the cloud shows. Scales with the number of reviews so the
   * cloud fills out as the rewatch progresses, clamped to keep it readable.
   */
  cloudWords: {
    perReview: 6,
    min: 40,
    max: 160,
  },

  /** Rows in the heat map, taken from the top of the overall frequency list. */
  heatMapWords: 20,

  /**
   * Words kept in the generated JSON. Larger than cloudWords so the per-series
   * filters have something to draw on, but bounded so the bundle stays small.
   */
  retainWords: 250,

  /**
   * Pure numbers are dropped, except four-digit years in this range — 1986 and
   * 1991 are genuinely meaningful on a site about a programme from the eighties.
   */
  yearRange: [1000, 2100],
};

/**
 * A standard English stop-word list. Kept inline rather than pulled from a
 * package: it is a static list of common words, it never needs updating, and
 * it is not worth a dependency.
 */
export const STOP_WORDS = [
  // articles, conjunctions, prepositions
  "a", "an", "and", "the", "but", "or", "nor", "for", "yet", "so", "as",
  "at", "by", "from", "in", "into", "of", "off", "on", "onto", "out", "over",
  "to", "up", "upon", "with", "without", "within", "about", "above", "across",
  "after", "against", "along", "among", "around", "before", "behind", "below",
  "beneath", "beside", "between", "beyond", "during", "except", "inside",
  "near", "since", "through", "throughout", "under", "until", "via", "while",
  // pronouns
  "i", "me", "my", "mine", "myself", "we", "us", "our", "ours", "ourselves",
  "you", "your", "yours", "yourself", "yourselves", "he", "him", "his",
  "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they",
  "them", "their", "theirs", "themselves", "who", "whom", "whose", "which",
  "what", "that", "this", "these", "those", "one", "ones", "someone",
  "somebody", "something", "anyone", "anybody", "anything", "everyone",
  "everybody", "everything", "nobody", "nothing", "none", "both", "each",
  "either", "neither", "other", "others", "another", "such", "same",
  // verbs / auxiliaries
  "am", "are", "is", "was", "were", "be", "been", "being", "do", "does",
  "did", "doing", "done", "have", "has", "had", "having", "can", "could",
  "shall", "should", "will", "would", "may", "might", "must", "ought",
  "get", "gets", "got", "getting", "go", "goes", "going", "gone", "went",
  "come", "comes", "coming", "came", "make", "makes", "made", "making",
  "take", "takes", "taking", "took", "taken", "put", "puts", "let", "lets",
  "say", "says", "said", "saying", "see", "sees", "seen", "saw", "seem",
  "seems", "seemed", "know", "knows", "known", "knew", "think", "thinks",
  "thought", "want", "wants", "wanted", "give", "gives", "given", "gave",
  "find", "finds", "found", "look", "looks", "looked", "looking", "use",
  "uses", "used", "using", "turn", "turns", "turned", "keep", "keeps",
  "kept", "leave", "leaves", "left", "feel", "feels", "felt", "seeming",
  "become", "becomes", "became", "bring", "brings", "brought",
  // adverbs, quantifiers, filler
  "not", "no", "yes", "very", "too", "also", "just", "only", "even", "still",
  "already", "always", "never", "ever", "often", "sometimes", "again",
  "once", "twice", "then", "than", "now", "here", "there", "where", "when",
  "why", "how", "all", "any", "some", "few", "many", "much", "more", "most",
  "less", "least", "lot", "lots", "quite", "rather", "really", "almost",
  "enough", "perhaps", "maybe", "instead", "however", "though", "although",
  "because", "if", "unless", "whether", "well", "back", "away", "down",
  "out", "off", "over", "further", "next", "last", "first", "second",
  "own", "new", "old", "good", "better", "best", "bad", "worse", "worst",
  "long", "little", "big", "great", "whole", "half", "thing", "things",
  "way", "ways", "time", "times", "part", "parts", "bit", "bits", "sort",
  "kind", "point", "case", "fact", "end", "ends", "man", "men", "woman",
  "women", "people", "day", "days", "year", "years", "night", "nights",
  "course", "sure", "yet", "actually", "entirely", "simply", "probably",
  "certainly", "possibly", "anyway", "meanwhile", "indeed", "somewhere",
  "anywhere", "everywhere", "nowhere", "everything", "least", "around",
  "whatever", "whenever", "wherever", "whoever", "anymore", "ok", "okay",
  "etc", "per", "cent",
  // number words — "two of the three" is not a theme
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "twenty", "thirty", "forty", "fifty", "hundred",
  "thousand", "million", "dozen", "single", "couple", "several",
  // high-frequency filler this particular column leans on
  "like", "likes", "liked", "exactly", "appear", "appears", "appeared",
  "minute", "minutes", "hour", "hours", "moment", "moments", "line", "lines",
  "reason", "reasons", "given", "worth",
];
