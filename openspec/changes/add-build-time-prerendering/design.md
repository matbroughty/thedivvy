## Context

The Divvy is a Vite 5 + React 18 SPA using React Router v6. `index.html` is a minimal shell; per-page meta and content are produced at runtime by React via `react-helmet-async`. The build pipeline (`npm run build`) currently runs `tsc && vite build && node scripts/generate-sitemap.mjs`, producing a single `dist/index.html` plus hashed JS/CSS bundles and a `sitemap.xml`. Hosting is AWS Amplify (static-site mode), which serves files from `dist/` and applies an SPA-fallback rewrite for unknown paths.

Routes today (from `src/App.tsx` and MDX content):
- `/` — HomePage
- `/series` — SeriesIndexPage
- `/series/1` … `/series/6` — SeriesPage (six concrete routes)
- `/archive` — ArchivePage
- `/lovejoy-overview` — OverviewPage
- `/about` — AboutPage
- `/links` — ExternalLinksPage
- `/episodes/{slug}` — EpisodePage (one per MDX file in `src/content/reviews/**`; currently 1 episode, growing toward ~70+)

`scripts/generate-sitemap.mjs` already walks the MDX tree to extract slugs and emits a sitemap, so the dynamic-route enumeration problem is already solved once. We should reuse that pattern (or factor out a shared helper) rather than duplicate it.

The recent SEO work (`add-homepage-lovejoy-branding`, plus the title/OG/canonical-URL fixes that just landed) has set up correct per-route `<title>`, `<meta description>`, OG tags, canonical URLs, and a real `og-default.jpg` — but all of that is React-generated, so non-JS crawlers see none of it.

## Goals / Non-Goals

**Goals:**
- After `npm run build`, every known route is represented by a static HTML file under `dist/{route}/index.html` containing the full rendered React output (title, meta, OG, body, links).
- The first byte a crawler or social-card bot receives is a complete HTML document — no JS execution required to see correct titles, descriptions, OG images, or content.
- Visitors retain the SPA experience: prerendered HTML loads, React hydrates, client-side navigation works as today.
- Build remains deterministic, reasonably fast (target: full build under 3 min even with 70+ episodes), and Amplify-compatible without console-side rewrite-rule changes.
- The build fails loudly (non-zero exit) if any route fails to prerender, so we never quietly ship a regression.

**Non-Goals:**
- Server-side rendering at request time (SSR).
- Migrating off Vite to Next.js / Astro / Remix.
- Changing routing, page structure, components, styles, or content.
- Optimising image assets, JS bundle splitting, or CSS extraction.
- Adding service-worker / offline support.

## Decisions

### D1. Use a small custom puppeteer script (not `react-snap`, not `vite-plugin-prerender`)

Implement prerendering as a hand-rolled Node script (`scripts/prerender.mjs`, ~80 lines) that depends only on the actively-maintained `puppeteer` package plus a tiny static-file server (Node's built-in `http` + `fs` modules are sufficient — no extra dep needed). The script is invoked as a `node scripts/prerender.mjs` step in `package.json`'s `build` script, after `vite build` and before `generate-sitemap.mjs`. **Why:**

- The community wrappers we'd otherwise reach for are dormant: `react-snap` last published **2022-05-15** (~4 years ago); `vite-plugin-prerender` last published 2022-09-05. The middle option, `@prerenderer/prerenderer`, is at ~1 year since last release — borderline. The npm registry was checked during task 1.1 implementation; results recorded in the change PR description.
- A ~80-line script depends only on `puppeteer` (actively maintained, freshly released) and avoids any abstraction layer that can rot independently.
- We retain full control over: route enumeration (driven from our own MDX walker), hydration-wait strategy, per-route error handling, exit codes, and concurrency.
- The implementation effort is roughly the same as the time we'd otherwise spend reverse-engineering and pinning the conventions of a third-party wrapper that may itself fail on the next Puppeteer major.

**Alternative considered:** `react-snap`. Rejected — ~4 years stale; `engines: >= 8.6.0` means no modern-Node testing; the project's open-issues backlog has not been triaged in years.

**Alternative considered:** `vite-plugin-prerender`. Rejected — also stagnant (last release 2022-09), tightly coupled to a Vite major version that has since moved on.

**Alternative considered:** `@prerenderer/prerenderer` + `@prerenderer/renderer-puppeteer`. Borderline. Rejected for now to avoid the abstraction layer; if the custom script grows unwieldy or our needs expand (incremental rendering, multi-renderer support), this is the natural fallback.

The script's responsibilities:
1. Start a static-file server bound to `127.0.0.1:<ephemeral-port>` serving `dist/`.
2. Launch puppeteer with `args: ["--no-sandbox", "--disable-setuid-sandbox"]`.
3. For each route returned by `scripts/lib/routes.mjs`, open `http://localhost:<port>{route}`, wait for the React app to signal hydration (via a known `window.__APP_HYDRATED__` flag set after `hydrateRoot`), capture `document.documentElement.outerHTML`, prepend `<!doctype html>\n`, and write to `dist/{route}/index.html` (creating parent directories as needed). The root route maps to `dist/index.html`, overwriting Vite's shell.
4. Sanity-check each captured HTML contains a non-empty `<title>`; record a failure if not.
5. On any per-route exception, log the error with the route URL and continue with remaining routes. After the loop, exit non-zero if any failures occurred.
6. Always tear down browser and HTTP server in a `finally` block.

Concurrency: process N routes in parallel using a small Promise-pool (default `N = 4`, tunable). Bounds build time without exhausting memory.

### D2. Drive the route list from the same MDX walker as the sitemap

Factor out a small helper (`scripts/lib/routes.mjs`) that returns the full canonical list of routes — static + dynamic — and call it from both `generate-sitemap.mjs` and the new prerender entry point. **Why:**
- Single source of truth means a new episode review automatically becomes both a sitemap entry and a prerendered page; no risk of one drifting from the other.
- Keeps the duplication that already exists in `generate-sitemap.mjs` from doubling.

**Alternative considered:** Let the prerender script discover routes by following `<a>` tags from `/`. Rejected — episode pages are only reachable via card grids, and a build-time crawler missing an episode would silently ship a non-prerendered page. Explicit enumeration is safer.

### D3. Hydration uses React 18's `hydrateRoot`, not `createRoot`

When the prerendered HTML loads, React must call `hydrateRoot(container, <App />)` instead of `createRoot(container).render(<App />)`. The current `src/main.tsx` uses `createRoot`. **Why:**
- `createRoot` discards the prerendered DOM and re-renders from scratch — visible flash, wasted work, and the prerendering buys nothing for end users (still helps crawlers, but defeats half the point).
- `hydrateRoot` attaches React to the existing DOM, preserving paint and only re-binding event handlers.

`react-helmet-async` and React Router both support hydration without changes.

**Alternative considered:** Conditionally call `hydrateRoot` only if the root element has children. Useful if you want `npm run dev` (un-prerendered) to keep working. We'll use this pattern to be safe.

### D4. Add Chromium flags for Amplify CI

The puppeteer launch options include `args: ["--no-sandbox", "--disable-setuid-sandbox"]`. On Amplify's build container (root user, no sandbox), Chromium needs these flags. Add them unconditionally; they're safe locally too. **Why:** without them, Chromium aborts on Amplify with "Running as root without --no-sandbox is not supported". This is the single most common Amplify-Puppeteer footgun.

**Alternative considered:** detect CI and conditionally pass the flag. Rejected — pointless complexity; the flag is harmless locally.

### D5. Fail the build on any prerender error

The custom prerender script SHALL collect any per-route failure (exception, navigation timeout, hydration timeout, or empty/missing `<title>`) and exit non-zero at the end with a summary. Per-route failures do not short-circuit the loop — we want a full report rather than first-error-wins. **Why:** silent regressions (e.g. a refactor breaks a page) would re-introduce the SPA-shell problem we just fixed. A loud build failure is the right default.

### D6. Keep Amplify config minimal: no console rewrite changes

Amplify's static hosting checks for a literal file first, then folder/index.html, then falls back to the SPA rewrite rule. With prerendered output:
- `/lovejoy-overview` → finds `dist/lovejoy-overview/index.html` → served. ✓
- `/episodes/firefly-cage` → finds `dist/episodes/firefly-cage/index.html` → served. ✓
- `/episodes/typo` → no file → SPA rewrite catches it → `/index.html` → React renders 404 page. ✓

**Decision:** make no changes to Amplify console rewrite rules. The only Amplify-side touch is in `amplify.yml`, and only if a system-dep install is required for headless Chromium (anticipated: none, since `puppeteer`'s bundled Chromium is self-contained on `linux2023`).

### D7. Keep `npm run dev` unchanged

The Vite dev server (`npm run dev`) does not prerender. It continues to serve `index.html` as today and rely on client-side rendering. **Why:** dev-loop speed > prerender authenticity. Engineers iterate on JSX changes; prerendering is a deploy-time concern. Local verification of prerendered output happens via `npm run build && npx serve dist`.

## Risks / Trade-offs

- **[Build flakiness from headless Chromium]** → Pin `puppeteer` to a specific version; log Chromium stdout/stderr on failure. Use a per-route navigation+hydration timeout of 30s. Mitigation if this ever becomes chronic: pre-cache the Puppeteer-bundled Chromium binary in Amplify's `cache.paths` (e.g. `~/.cache/puppeteer/**`).
- **[Build time grows with episode count]** → At ~1–2 s per route, 70 episodes + static = ~90 s of prerendering. Acceptable. If the corpus ever pushes build time past Amplify's default ~30-minute build timeout (unlikely until thousands of routes), parallelise by splitting the route list across worker processes.
- **[Hydration mismatch warnings]** → Anything non-deterministic in render (e.g. `Date.now()`, `Math.random()`, locale-sensitive `Intl` formatting) can produce mismatch warnings in the browser console. Mitigation: audit React render code for non-determinism before first deploy; the existing pages look clean on a skim, but the `formatAirDate` / `formatReviewDate` utilities should be checked to ensure they produce deterministic output independent of timezone.
- **[Stale `node_modules` cache breaks Chromium download]** → Amplify caches `node_modules/**`; if Puppeteer's post-install Chromium download is cached, it may go stale when the package upgrades. Mitigation: rely on `npm ci` to reinstall deterministically when `package-lock.json` changes; explicitly do NOT cache the Chromium binary across builds.
- **[`og-default.jpg` and other assets at prerender time]** → The prerender script's static file server serves directly from `dist/`, so any asset Vite emits is reachable. `public/og-default.jpg` is shipped to `dist/og-default.jpg` by Vite, so the captured HTML's absolute references resolve correctly. Verify in tasks.
- **[Lost SPA loading-state UI]** → Today, the empty `<div id="root">` very briefly shows whatever `index.html` body styles render. With prerendering, the user sees the *content* of the previous-resolved route during the JS-bundle download window before hydration. This is strictly an improvement — no mitigation needed; flagged for awareness.
- **[Helmet leakage across pages]** → `react-helmet-async` requires a `<HelmetProvider>` at the app root. Confirm `App.tsx` or `main.tsx` wraps the tree in `<HelmetProvider>` (the build is currently producing per-page titles client-side, so it almost certainly does, but we'll verify in tasks).

## Migration Plan

This is an additive build-pipeline change. Deploy plan:

1. Land prerendering on `main`; the next Amplify build produces `dist/{route}/index.html` files alongside the existing `dist/index.html`.
2. After first prerendered deploy: spot-check production by `curl https://thedivvy.co.uk/lovejoy-overview` (no JS execution) and confirm the response body contains the page's `<title>` and body content.
3. Validate social sharing: paste the production URL into Twitter/X composer, Facebook debugger, and Discord; confirm the correct OG image and description render.
4. Re-submit `sitemap.xml` to Google Search Console (`https://thedivvy.co.uk/sitemap.xml`) and request re-indexing of representative URLs.

Rollback: revert the commit. `dist/` reverts to single-`index.html` SPA on the next build. No persistent state, no data migration, no DNS changes.

## Open Questions

<!-- Original open question resolved during task 1.1: react-snap is ~4 years stale; vite-plugin-prerender is ~3.5 years stale; pivoted to a custom puppeteer script (see D1). -->

- **Should we also generate per-route `og:image` files** (auto-derived per episode) as part of this change, or leave the per-episode `frontmatter.image` mechanism alone? Default: leave alone — out of scope for prerendering.
- **Do we want a `--dry-run` mode** for the prerender script that emits the route list without invoking Chromium? Useful for debugging route enumeration. Low priority; deferred unless implementation surfaces the need.
