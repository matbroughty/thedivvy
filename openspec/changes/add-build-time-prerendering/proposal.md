## Why

The Divvy is a client-rendered Vite + React SPA: `index.html` is an empty `<div id="root">` shell, and all per-route content (titles, meta descriptions, OG tags, and body copy) is produced by React in the browser via `react-helmet-async`. Crawlers that don't execute JavaScript — Bing, DuckDuckGo, social-card preview bots (Twitter/X, Facebook, Discord, iMessage), and the new generation of AI search engines (Perplexity, ChatGPT-search, Brave) — therefore see the same generic shell on every URL: identical title, identical description, no body content. This is the single largest drag on the site's SEO and on link-sharing behaviour, and it currently negates the per-page title/description/OG work that has just landed. Even Google, which does render JS, defers SPA pages to a second-pass crawl, slowing indexing.

## What Changes

- Add a build-time prerender step that, after `vite build`, walks every known route, renders the SPA against the built bundle in a headless browser, and snapshots the resulting HTML to a per-route file under `dist/` (e.g. `dist/lovejoy-overview/index.html`, `dist/episodes/{slug}/index.html`).
- Enumerate routes from a single source of truth: static routes (homepage, `/series`, `/series/{1..6}`, `/archive`, `/lovejoy-overview`, `/about`, `/links`) plus dynamic episode routes derived from MDX frontmatter slugs under `src/content/reviews/` — mirroring how `scripts/generate-sitemap.mjs` already works.
- Wire the prerender step into `package.json`'s `build` script so `npm run build` (and therefore the Amplify build pipeline) produces prerendered output by default. No new manual step.
- Update `amplify.yml` if any system-level setup is needed for headless Chromium (e.g. `--no-sandbox` flag, additional deps); keep the change minimal and prefer tools that work out-of-the-box on Amplify's default build image.
- Preserve client-side navigation: prerendered HTML is the *first paint*; React hydrates the bundle as today and takes over for in-app navigation. Visitors see no regression.
- Verify the SPA fallback rewrite rule still works: routes with prerendered files are served from disk; unknown routes (e.g. typos, deleted episodes) still fall back to `index.html` and let React render the 404 page.

Non-goals: switching to SSR at request time (overkill for a static-content site), migrating to Next.js or Astro (out of scope), changing routing, content, styles, or component code.

## Capabilities

### New Capabilities
- `build-time-prerendering`: Per-route static HTML output produced at build time so non-JS crawlers and social-preview bots see complete document content, while end users continue to receive an SPA experience.

### Modified Capabilities
<!-- None — there are no existing specs in openspec/specs/. -->

## Impact

- **Code**: New `scripts/prerender.mjs` (or equivalent — concrete tool choice deferred to design.md). New shared route-enumeration helper, or a duplicated walker similar to `generate-sitemap.mjs`. Possible edit to `package.json` `scripts.build` to chain the prerender step.
- **Dependencies**: One new dev-dependency, `puppeteer`, used directly by a small custom prerender script (no third-party wrapper). The bundled Chromium adds ~200 MB to `node_modules` on first install; the runtime cost is build-time only.
- **Build pipeline**: `npm run build` will take ~30–60 seconds longer at current site size (12 routes), scaling roughly linearly with episode count. Still well under any Amplify timeout.
- **Amplify**: `amplify.yml` may need to add system-deps install or a `--no-sandbox` flag for headless Chromium; the static-hosting behaviour (file lookup before SPA rewrite) means no console-side rewrite-rule changes are expected. The existing SPA fallback rule continues to handle 404s.
- **Deploy size**: `dist/` grows by one small HTML file per route (~2–5 KB each post-gzip). Negligible.
- **Hosting headers / caching**: No change required; Amplify's default static-asset caching policy applies to the new HTML files unchanged.
- **SEO / sharing**: Significant improvement. Non-Google crawlers and social bots will, from the next deploy, see complete `<title>`, meta description, OG tags, and body content per route. Google's two-pass crawl collapses to a single pass.
- **DX / local dev**: `npm run dev` is untouched (Vite dev server stays as-is). Only `npm run build` runs the prerender step.
- **Risk**: Headless Chromium can be flaky in CI; tool choice and a small retry / log-on-failure strategy are addressed in design.md.
