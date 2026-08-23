# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (no prerender; renders client-side only). A `predev` hook regenerates `public/search-index.json` on startup so `/search` works locally.
- `npm run build` — sequential chain, all steps must pass:
  1. `tsc` — type-check (strict, `noUnusedLocals`/`noUnusedParameters` on).
  2. `node scripts/generate-search-index.mjs` — emits `public/search-index.json` (must run **before** `vite build` so it gets copied into `dist/`).
  3. `vite build` — bundle to `dist/`.
  4. `node scripts/prerender.mjs` — boots a static server on `dist/`, drives headless Chromium over every route, writes `dist/{route}/index.html`. Non-zero exit on any route failure or empty `<title>`.
  5. `node scripts/generate-sitemap.mjs` — emits `dist/sitemap.xml`.
  6. `node scripts/generate-feed.mjs` — emits `dist/feed.xml` (RSS 2.0).
- `npm run preview` — serve the built `dist/` locally.
- `npm run routes` — print the canonical route list (useful for verifying a new episode shows up before a full build).
- `npm run generate:search` — regenerate `public/search-index.json` on demand (e.g. after adding a review mid dev-session without restarting).
- `npm run build:characters` — regenerate `src/data/lovejoy-characters.json` from IMDb non-commercial datasets (cached in `.imdb-cache/`, gitignored, ~1 GB on first run).

There is no test suite, no linter, and no formatter configured. Type-checking via `tsc` (run as part of `npm run build`) is the only static check.

## Architecture

### Content pipeline
Episodes are MDX files at `src/content/reviews/series-XX/NN-slug.mdx`. They are loaded at module-init time by `src/lib/episodes.ts` via `import.meta.glob("/src/content/reviews/**/*.mdx", { eager: true })`. The loader validates frontmatter against a required-keys list (see `EpisodeFrontmatter` in `src/types.ts`) — **episodes missing any required field are dropped with a `console.warn` and never appear on the site**. When adding fields, update both `EpisodeFrontmatter` in `src/types.ts` and (if required) the `required` array in `episodes.ts`.

Frontmatter parsing uses `remark-frontmatter` + `remark-mdx-frontmatter` (configured in `vite.config.ts`) which exposes the YAML block as a named `frontmatter` export from the MDX module.

### Required frontmatter fields
`title`, `series`, `episode`, `slug`, `score`, `summary`, `lovejoyUnits`, `divvyMoment`, `guestStar`. Missing any of these drops the episode from the site.

Optional but conventional: `airDate` (ISO `"YYYY-MM-DD"`), `reviewDate` (`"YYYY-MM"` or `"YYYY-MM-DD"`), `image`/`imageAlt`/`image2`/`imageAlt2`/`image3`/`imageAlt3`, `imageSourceUrl` (+ `…2`, `…3`), `soundtrack: { title, artist, spotifyUrl? }`.

Slug convention: `series-{S}-episode-{N}-{kebab-title}` (e.g. `series-1-episode-4-friends-romans-and-enemies`). Air-date cadence is weekly (Friday nights in the UK — S01E01 aired 1986-01-09, so E09 = 1986-03-07 and so on).

### Research sources (do this first, every episode)
Before drafting or scaffolding a review, gather the episode's facts from these three, in this order:
1. **IMDb** — episode page for cast, character names and trivia. Note that `imdb.com` returns HTTP 403 to WebFetch; use WebSearch to surface the page and pull details from the snippets, or fetch a mirror.
2. **TVmaze** — `https://www.tvmaze.com/shows/2168/lovejoy/episodes` → the episode page. Reliable for original transmission date/time, runtime and guest cast (actor → character). This is the source of truth for `airDate`.
3. **subslikescript** — full episode transcript at `https://subslikescript.com/series/Lovejoy-90477/season-{S}/episode-{N}-{Title_With_Underscores}` (e.g. season-2/episode-1-Just_Desserts). Read this for background: exact quotes for `divvyMoment` and the "Good Quote" section, plot beats, running gags and any detail worth a joke. Never paste large stretches of transcript into the review — quote sparingly, in the style of a newspaper column.

**Filming locations are a known gap.** The production kept locations out of the episode credits, so no online source maps them episode by episode. Don't assert a location for a specific episode without evidence, and don't repeat the "Lovejoy's workshop at Belchamp Hall" detail for anything before Series 5 — that applies to the last two series only. Safe series-wide facts: South Suffolk / North Essex around Long Melford, Belchamp Hall as Felsham Hall, with Lavenham, Finchingfield, Halstead, Coggeshall, Kersey and Walberswick recurring.

One offline source may close the gap: *The Lovejoy Trail: Locations from the Lovejoy TV Series* by Paul Atkinson (Upfront Publishing, 2012, 166pp), covering Suffolk, Norfolk, Hertfordshire and Essex. **Not yet consulted.** Reviews are mixed — useful to fans visiting the sites, but several report poor editing and factual errors, so anything taken from it needs a second check before it goes on the site.

### Publishing a new episode review (standard workflow)
1. Confirm the four decision fields with the user *before* writing files: `score` (0–5, halves allowed), `divvyMoment` (usually the review's headline pull-quote), `guestStar` (an actor name — if there's no natural one, a witty in-character stand-in is fine, e.g. `"None — Dandy Jack still convalescing"` for S01E05), and whether the hero images and Instagram folder are already staged.
2. Create the MDX at `src/content/reviews/series-XX/NN-slug.mdx`. See **Review headings** below for the required structure. Some episodes use an opening pull-quote as a `>` blockquote directly under `## Review`.
3. Mirror the same review body into the vault at `vault/thedivvy/Lovejoy Reviews/Reviews/Series{NN}/SXEXX - {Title}.md`. Vault has its own template frontmatter (see `Templates/ReviewTemplate.md`); vault prose can drift slightly from the published MDX if the user's edits accumulate there first.
4. Create the empty Instagram staging folder `public/images/insta/se{S}ep{N}/` for later Canva carousel work.
5. Verify with `npm run routes` — the new `/episodes/series-1-episode-N-slug` line should appear.
6. **Search / RSS**: nothing manual to do. `npm run build` regenerates `public/search-index.json` (before `vite build`) and `dist/feed.xml` (after prerender). If the dev server is already running, run `npm run generate:search` to make the new episode findable in `/search` without restarting; the feed is a build-only artifact.
7. **Do NOT commit until the user says so** — they preview the rendered page first (dev server on port 5173 or 5174) and often edit the MDX before asking to commit.

### Manual character overrides
`src/data/manual-characters.json` supplements the IMDb-generated cast list at `src/data/lovejoy-characters.json`. Add hand-curated entries here for recurring faces IMDb has as uncredited (currently: John Scholes as Sgt Drabble across S01E01, E06, E08, E09). `CharactersPage` merges the two, deduped by lowercase `actor::character`.

### JSON-LD and likes
Every episode page renders `Review` + `BreadcrumbList` JSON-LD via `src/components/EpisodeJsonLd.tsx` (author `"Mat Broughton"`, publisher `"The Divvy"`, `bestRating: 5`, `worstRating: 0`). Every episode page also renders a `LikeButton` backed by the third-party Abacus counter (`src/lib/likes.ts`) — `localStorage` dedupes per device; graceful fallback if the service is unreachable.

### Review headings
Every review body opens with two `##` headings, in this order and with these exact words:

```mdx
## One Wink Plot
## Review
```

Inside `## Review`, new reviews carry these four `###` subsections, in this order, spelled exactly like this:

```mdx
### Favourite Moment
### Good Quote
### Guest Focus — {Actor Name}
### The Divvy Verdict
```

Notes:
- **Order is fixed.** Verdict always last. `Guest Focus` always sits between `Good Quote` and `The Divvy Verdict`.
- **`Guest Focus` takes an em-dash and the actor's name**, matching the `guestStar` frontmatter field — e.g. `### Guest Focus — Warren Clarke`. If the review has no Guest Focus section, `guestStar` is promising a guest the prose never delivers, so add one or change the field.
- **Optional extras are allowed** where an episode earns one. Established so far: `### Antique Lesson` (S01E06) and `### Trivia & Observations` (S01E09-10). Place an extra before `### The Divvy Verdict`. Reuse an existing name rather than inventing a synonym.
- **Do not retrofit the early reviews.** S01E01–E05 and E08 are deliberately continuous prose with no subsections, which is a decision, not an oversight. Leave them alone.
- Watch for near-miss headings — a stray `### Gold Quote` has slipped in before. The four names above are the only spellings.

### Image assets
Two image folder patterns are established under `public/images/`:
- **Site hero / gallery images** for an episode review live flat under `public/images/episodes/`, named `series-{S}-episode-{N}-{slug}.jpg` (plus `…2.jpg` and `…3.jpg` siblings). Up to three are referenced via the `image` / `image2` / `image3` frontmatter fields and rendered as a gallery by `src/components/EpisodeImage.tsx`.
- **Instagram post images** live under `public/images/insta/se{S}ep{N}/` (one subfolder per episode, arbitrary filenames inside). These are not referenced by the site — they're staging for Canva carousels.

### Scoring
Episode scores are out of 5 — see `src/components/EpisodeScore.tsx` (renders an icon row up to length 5 plus a `/ 5` denominator). Both `score` and `lovejoyUnits` frontmatter fields use the same scale. Half-star scores (e.g. `4.5`) are supported: the row renders `Math.floor(score)` full icons plus a D-shape half icon (left semicircle, clipped via CSS `overflow: hidden`).

### Per-series accent theming
`EpisodePage` and `SeriesPage` set `data-series={N}` on their root element. `src/styles/global.css` then overrides `--color-accent`, `--color-accent-soft` and `--color-accent-ink` per series (Mahogany / Walnut / Aged brass / Burgundy / Verdigris / Pewter). Other routes (home, archive, characters, curios) inherit the default mahogany.

### Cross-episode references (`<Ep>` shortcode)
Reviews often name-drop other episodes. Wrap the mention in the `<Ep>` MDX shortcode with the target's slug:

```mdx
Referenced later in the fantastic <Ep slug="series-2-episode-3-bin-diving">Bin Diving</Ep> episode.
```

- If the target review is published, `<Ep>` renders as a `<Link>` to `/episodes/{slug}`.
- If the target isn't published yet, it renders the children as plain text — no dead link, no 404. The moment the target review lands, every existing mention auto-lights-up.
- The component (`src/components/Ep.tsx`) is registered globally via `mdxComponents.tsx`, so `<Ep>` is available in every MDX file without an import.
- The shortcode is a pure wrapper — it does not italicise. If you want italics on an episode title, add `*asterisks*` inside the tag as normal: `<Ep slug="…">*Bin Diving*</Ep>`.

### Soundtrack ("Heard in the episode")
Episodes can carry an optional `soundtrack` block in their frontmatter (`title`, `artist`, optional `spotifyUrl`).

**House rule — episodes with no song.** Some episodes have no usable song in them at all. When that happens, substitute a track from Ian McShane's own album *From Both Sides Now* so the playlist stays one-song-per-episode. Established so far: S01E09-10 *Death in Venice* → "I'd Really Love to See You Tonight"; S02E01 *Just Desserts* → "Avalon". Don't reuse a track already spent on an earlier episode.

**You must set `substitute: true` on the soundtrack block when you do this.** Without it the episode page announces the track as "Heard in the episode", which is the one thing a substitute demonstrably wasn't:

```yaml
soundtrack:
  title: Avalon
  artist: Ian McShane
  spotifyUrl: "https://open.spotify.com/track/3nSo9ZfNNunFJLhL7Hb5bB"
  substitute: true
```

With the flag set, `SoundtrackLine` renders "No song in this episode" plus an aside explaining the borrow and linking to `/soundtrack`; `/soundtrack` rows and `EpisodeCard` both gain a small STAND-IN pill. Nothing keys off the artist or album name, so a substitute from elsewhere would only need the aside sentence in `SoundtrackLine.tsx` revisiting. The rule is also explained to readers in the note under the `/soundtrack` page header (`article__note` in `SoundtrackPage.tsx`).

Strip the `?si=…` tracking parameter from Spotify share links before pasting them into `spotifyUrl`. Rendered by `src/components/SoundtrackLine.tsx` in two variants: `full` (used in the episode-page metadata) and `subtle` (used on `EpisodeCard` for series listings). If the field is absent, nothing renders — existing episodes without a track work unchanged.

The aggregated `/soundtrack` page (`src/pages/SoundtrackPage.tsx`) walks every episode's frontmatter at render time and lists all tracks grouped by series, each linking back to its episode review. It also embeds a Spotify playlist when `SPOTIFY_PLAYLIST_URL` at the top of that file is set to a share URL like `https://open.spotify.com/playlist/{id}` (the component derives the `/embed/playlist/…` URL automatically). Leave it as `""` to hide the embedded player. Route is registered in `scripts/lib/routes.mjs` (`/soundtrack`), so it prerenders and appears in the sitemap.

### Gash novels (`/novels`)
`src/data/gash-novels.json` holds all 24 Jonathan Gash Lovejoy novels in publication order; `src/pages/NovelsPage.tsx` renders them against the episodes that adapted them. Episode links resolve through `getEpisodeBySlug`, so they only light up once the target review is published (same behaviour as `<Ep>`).

The mapping **cannot be derived mechanically** — the BBC never credited source novels on screen, and neither IMDb nor TMDB records a "novel" writing credit for any episode (*The Judas Pair* is credited simply "Written by Ian La Frenais"). So every row carries an explicit `status`:

- `adapted` — a published source, or Mat having read the book, confirms it.
- `probable` — strong title/plot correspondence, nothing citable.
- `none` — no known TV adaptation.

Only promote `probable` → `adapted` on actual evidence; the page's value rests on those labels meaning something. Currently 3 adapted, 1 probable, 20 unadapted — all the mappings fall in Series One, since the show ran on original scripts from Series Two onwards.

### Search (`/search`)
Full-text search runs client-side via [MiniSearch](https://lucaong.github.io/minisearch/) against a build-time JSON index.

- **Generator**: `scripts/generate-search-index.mjs` walks `src/content/reviews/**/*.mdx`, parses frontmatter with the same tolerant reader used elsewhere, strips the MDX body to plain text (headings, blockquotes, links, bold/italic markers stripped; fenced code blocks dropped), and emits `public/search-index.json` — one doc per episode with `slug`, `title`, `series`, `episode`, `summary`, `divvyMoment`, `guestStar`, `body`.
- **Where it runs**: `predev` (dev startup), `build` (chained after `tsc` and *before* `vite build` so the JSON is copied into `dist/`), and manually via `npm run generate:search`.
- **UI**: `src/pages/SearchPage.tsx`. The index and MiniSearch library are lazy-loaded on first keystroke (so the empty search page is cheap). Boosts are `title 4 · divvyMoment 3 · summary 2 · guestStar 2 · body 1`, with prefix + fuzzy 0.2 matching. The `?q=` param syncs both ways (URL → input on mount, input → URL on change, `replace` semantics so the back button doesn't fill with history).
- **Adding a new review**: no manual step. The build regenerates the index; `predev` catches the case where dev is restarted after adding an MDX. If the dev server is already running when you add an episode, run `npm run generate:search` to see it in local search without restarting.

### RSS feed (`/feed.xml`)
`scripts/generate-feed.mjs` emits `dist/feed.xml` (RSS 2.0) at build time. Items are episode reviews sorted newest-first by `reviewDate` (falling back to series/episode order for undated reviews), pulled via `getEpisodeEntries` from `scripts/lib/routes.mjs` so the feed shares its source of truth with the sitemap and prerender.

Discovery is via `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` in `index.html`, so feed readers auto-detect it from any page. Public URL: <https://thedivvy.co.uk/feed.xml>.

### Routes — single source of truth
`scripts/lib/routes.mjs` is the canonical route list. It is consumed by `prerender.mjs`, `generate-sitemap.mjs`, and `generate-feed.mjs` (all three share `getEpisodeEntries` + `getSiteUrl`). Static routes are hard-coded; episode routes are derived by walking `src/content/reviews/**/*.mdx` and parsing frontmatter slugs with a tolerant regex-based YAML reader (independent of the Vite/MDX pipeline, because this script runs in plain Node).

If you add a new top-level page in `src/App.tsx`, you must also add it to `STATIC_ROUTES` in `scripts/lib/routes.mjs` or it will not be prerendered or appear in the sitemap.

### Build-time prerendering
`scripts/prerender.mjs` runs after `vite build`. It serves `dist/` over a local HTTP server (with SPA fallback to `dist/index.html`), then for each route runs Puppeteer with `--no-sandbox` flags (required because Amplify's build container runs as root). It waits for `window.__APP_HYDRATED__ === true` — set in `src/main.tsx` inside a `requestAnimationFrame` after the React root mounts — then captures `document.documentElement.outerHTML`.

`src/main.tsx` decides between `hydrateRoot` (prerendered HTML present) and `createRoot` (dev server or unprerendered route). This dual-mode mount is load-bearing — do not replace it with one or the other.

### SPA fallback
`public/_redirects` declares `/* /index.html 200` (Netlify-style). Amplify Hosting does not parse this file; the equivalent rule must be set manually in the Amplify console (**App settings → Rewrites and redirects**). After a successful prerender, Amplify serves `dist/{route}/index.html` directly for known routes; the fallback only fires for unknown paths (where `NotFoundPage` then renders client-side).

### Env vars
Production site URL lives in `.env.production` (`VITE_SITE_URL`). Both the React app (via Vite) and the Node build scripts read this file — `getSiteUrl` in `scripts/lib/routes.mjs` resolves `SITE_URL` env var → `.env.production` → placeholder, and is shared by the sitemap and feed generators so no extra Amplify console env var is required.

### Vault (Obsidian, not part of the build)
`vault/thedivvy/` is an Obsidian vault used for drafting reviews. **Vite does not load it, prerender does not see it, and the sitemap does not list it.** Per-episode `.md` drafts live in `vault/thedivvy/Lovejoy Reviews/Reviews/Series{NN}/SXEXX - {Title}.md`; templates (`ReviewTemplate.md`, `CanvaPromptTemplate.md`) live in `Templates/`. The vault prose is the working copy — when ready to publish, port it into the matching `src/content/reviews/series-XX/NN-slug.mdx` and apply typography normalisation (single spaces between sentences, em-dashes with spaces around them, straight quotes, italicise titles with `*…*`).

`.gitignore` filters per-device Obsidian state (`workspace.json`, `cache/`, `plugins/`) while keeping markdown content and shared config.

## Commit conventions
- Only commit when the user explicitly asks (`commit`, `commit and push`, etc.). They preview first and often edit MDX after review-generation.
- Episode publishes follow the pattern `Publish {Title} review (SXXEYY)`; other commits use a concise summary of what changed.
- Every commit message ends with a `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>` trailer. Use whichever model actually did the work — history before August 2026 is attributed to Opus 4.7.
- Never skip hooks (`--no-verify`) or push without explicit `and push` in the instruction.

## Review writing style

The reviews should read like a weekly newspaper column rather than a traditional TV recap. The structure is flexible, not rigid, but each review should broadly follow these beats:

### 1. Cold Open (150–250 words)

Start with a topical, nostalgic or personal observation from the week the review is being written. It doesn't have to be about *Lovejoy* at all. It could be a holiday, football, the weather, current events, old television, antiques or everyday life.

End this section with a natural bridge into the episode.

### 2. First Impressions

Give an overall reaction before diving into the plot.

Explain what sort of episode this is:

- Return to form
- Ambitious experiment
- Classic Lovejoy
- Slight disappointment
- Better (or worse) than remembered

This sets the tone for the review.

### 3. The Divvy Walkthrough

Retell the story in broad strokes rather than scene-by-scene.

Focus on the beginning, middle and end, stopping frequently for:

- humour
- observations
- comparisons
- nostalgia
- modern-day commentary

Aim for roughly 30% plot recap and 70% commentary.

### 4. What Worked (and What Didn't)

Discuss the things that stood out:

- main characters
- guest stars
- music
- locations
- antiques
- pacing
- memorable scenes
- production quirks

Avoid turning this into a list; weave it naturally into the review.

### 5. Where It Fits

Place the episode in context.

Compare it with:

- earlier or later Lovejoy episodes
- the books where relevant
- other television of the era
- recurring themes in the series

Readers enjoy understanding where an episode sits within the wider journey.

### 6. Final Verdict

Explain why the episode succeeds (or doesn't) and what it is really about beneath the plot.

The conclusion should zoom out to a bigger idea or theme.

Finally, bring the review full circle by referencing the opening anecdote or observation. This callback should feel natural and give the piece a satisfying ending.

### House style

- Write with warmth, wit and gentle sarcasm.
- Assume the reader already knows the episode; don't over-explain the plot.
- Prefer observations over descriptions.
- Include at least one amusing, unnecessary detail (period prices, old brands, dated technology, cultural references, etc.).
- Mix nostalgia with modern comparisons.
- Don't be afraid to wander briefly if it produces a good joke or observation.
- Every review should feel like spending ten minutes in the pub with someone who loves television and notices odd little details.
- Above all, the review should feel like a column that happens to be about *Lovejoy*, not just a review of an episode.
