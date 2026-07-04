# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (no prerender; renders client-side only).
- `npm run build` — three sequential steps, all must pass:
  1. `tsc && vite build` — type-check (strict, `noUnusedLocals`/`noUnusedParameters` on) and bundle to `dist/`.
  2. `node scripts/prerender.mjs` — boots a static server on `dist/`, drives headless Chromium over every route, writes `dist/{route}/index.html`. Non-zero exit on any route failure or empty `<title>`.
  3. `node scripts/generate-sitemap.mjs` — emits `dist/sitemap.xml`.
- `npm run preview` — serve the built `dist/` locally.
- `npm run routes` — print the canonical route list (useful for verifying a new episode shows up before a full build).
- `npm run build:characters` — regenerate `src/data/lovejoy-characters.json` from IMDb non-commercial datasets (cached in `.imdb-cache/`, gitignored, ~1 GB on first run).

There is no test suite, no linter, and no formatter configured. Type-checking via `tsc` (run as part of `npm run build`) is the only static check.

## Architecture

### Content pipeline
Episodes are MDX files at `src/content/reviews/series-XX/NN-slug.mdx`. They are loaded at module-init time by `src/lib/episodes.ts` via `import.meta.glob("/src/content/reviews/**/*.mdx", { eager: true })`. The loader validates frontmatter against a required-keys list (see `EpisodeFrontmatter` in `src/types.ts`) — **episodes missing any required field are dropped with a `console.warn` and never appear on the site**. When adding fields, update both `EpisodeFrontmatter` in `src/types.ts` and (if required) the `required` array in `episodes.ts`.

Frontmatter parsing uses `remark-frontmatter` + `remark-mdx-frontmatter` (configured in `vite.config.ts`) which exposes the YAML block as a named `frontmatter` export from the MDX module.

### Image assets
Two image folder patterns are established under `public/images/`:
- **Site hero / gallery images** for an episode review live flat under `public/images/episodes/`, named `series-{S}-episode-{N}-{slug}.jpg` (plus `…2.jpg` and `…3.jpg` siblings). Up to three are referenced via the `image` / `image2` / `image3` frontmatter fields and rendered as a gallery by `src/components/EpisodeImage.tsx`.
- **Instagram post images** live under `public/images/insta/se{S}ep{N}/` (one subfolder per episode, arbitrary filenames inside). These are not referenced by the site — they're staging for Canva carousels.

### Scoring
Episode scores are out of 5 — see `src/components/EpisodeScore.tsx` (renders an icon row up to length 5 plus a `/ 5` denominator). Both `score` and `lovejoyUnits` frontmatter fields use the same scale. Half-star scores (e.g. `4.5`) are supported: the row renders `Math.floor(score)` full icons plus a D-shape half icon (left semicircle, clipped via CSS `overflow: hidden`).

### Per-series accent theming
`EpisodePage` and `SeriesPage` set `data-series={N}` on their root element. `src/styles/global.css` then overrides `--color-accent`, `--color-accent-soft` and `--color-accent-ink` per series (Mahogany / Walnut / Aged brass / Burgundy / Verdigris / Pewter). Other routes (home, archive, characters, curios) inherit the default mahogany.

### Soundtrack ("Heard in the episode")
Episodes can carry an optional `soundtrack` block in their frontmatter (`title`, `artist`, optional `spotifyUrl`). Rendered by `src/components/SoundtrackLine.tsx` in two variants: `full` (used in the episode-page metadata) and `subtle` (used on `EpisodeCard` for series listings). If the field is absent, nothing renders — existing episodes without a track work unchanged.

The aggregated `/soundtrack` page (`src/pages/SoundtrackPage.tsx`) walks every episode's frontmatter at render time and lists all tracks grouped by series, each linking back to its episode review. It also embeds a Spotify playlist when `SPOTIFY_PLAYLIST_URL` at the top of that file is set to a share URL like `https://open.spotify.com/playlist/{id}` (the component derives the `/embed/playlist/…` URL automatically). Leave it as `""` to hide the embedded player. Route is registered in `scripts/lib/routes.mjs` (`/soundtrack`), so it prerenders and appears in the sitemap.

### Routes — single source of truth
`scripts/lib/routes.mjs` is the canonical route list. It is consumed by **both** `prerender.mjs` and `generate-sitemap.mjs`. Static routes are hard-coded; episode routes are derived by walking `src/content/reviews/**/*.mdx` and parsing frontmatter slugs with a tolerant regex-based YAML reader (independent of the Vite/MDX pipeline, because this script runs in plain Node).

If you add a new top-level page in `src/App.tsx`, you must also add it to `STATIC_ROUTES` in `scripts/lib/routes.mjs` or it will not be prerendered or appear in the sitemap.

### Build-time prerendering
`scripts/prerender.mjs` runs after `vite build`. It serves `dist/` over a local HTTP server (with SPA fallback to `dist/index.html`), then for each route runs Puppeteer with `--no-sandbox` flags (required because Amplify's build container runs as root). It waits for `window.__APP_HYDRATED__ === true` — set in `src/main.tsx` inside a `requestAnimationFrame` after the React root mounts — then captures `document.documentElement.outerHTML`.

`src/main.tsx` decides between `hydrateRoot` (prerendered HTML present) and `createRoot` (dev server or unprerendered route). This dual-mode mount is load-bearing — do not replace it with one or the other.

### SPA fallback
`public/_redirects` declares `/* /index.html 200` (Netlify-style). Amplify Hosting does not parse this file; the equivalent rule must be set manually in the Amplify console (**App settings → Rewrites and redirects**). After a successful prerender, Amplify serves `dist/{route}/index.html` directly for known routes; the fallback only fires for unknown paths (where `NotFoundPage` then renders client-side).

### Env vars
Production site URL lives in `.env.production` (`VITE_SITE_URL`). Both the React app (via Vite) and `generate-sitemap.mjs` read this file — the sitemap script parses it directly so no extra Amplify console env var is required.

### Vault (Obsidian, not part of the build)
`vault/thedivvy/` is an Obsidian vault used for drafting reviews. **Vite does not load it, prerender does not see it, and the sitemap does not list it.** Per-episode `.md` drafts live in `vault/thedivvy/Lovejoy Reviews/Reviews/Series{NN}/SXEXX - {Title}.md`; templates (`ReviewTemplate.md`, `CanvaPromptTemplate.md`) live in `Templates/`. The vault prose is the working copy — when ready to publish, port it into the matching `src/content/reviews/series-XX/NN-slug.mdx` and apply typography normalisation (single spaces between sentences, em-dashes with spaces around them, straight quotes, italicise titles with `*…*`).

`.gitignore` filters per-device Obsidian state (`workspace.json`, `cache/`, `plugins/`) while keeping markdown content and shared config.

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
