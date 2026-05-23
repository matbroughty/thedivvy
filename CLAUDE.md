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

There is no test suite, no linter, and no formatter configured. Type-checking via `tsc` (run as part of `npm run build`) is the only static check.

## Architecture

### Content pipeline
Episodes are MDX files at `src/content/reviews/series-XX/NN-slug.mdx`. They are loaded at module-init time by `src/lib/episodes.ts` via `import.meta.glob("/src/content/reviews/**/*.mdx", { eager: true })`. The loader validates frontmatter against a required-keys list (see `EpisodeFrontmatter` in `src/types.ts`) — **episodes missing any required field are dropped with a `console.warn` and never appear on the site**. When adding fields, update both `EpisodeFrontmatter` in `src/types.ts` and (if required) the `required` array in `episodes.ts`.

Frontmatter parsing uses `remark-frontmatter` + `remark-mdx-frontmatter` (configured in `vite.config.ts`) which exposes the YAML block as a named `frontmatter` export from the MDX module.

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
