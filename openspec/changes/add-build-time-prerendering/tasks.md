## 1. Pre-flight audit

- [x] 1.1 Confirmed (via `npm view`): `react-snap` last published 2022-05-15 (~4 years stale); `vite-plugin-prerender` last published 2022-09-05 (~3.5 years stale); `@prerenderer/prerenderer` last published 2024-05-01 (~1 year stale, borderline); `puppeteer` itself actively maintained (released within days). **Decision: pivot D1 to a custom puppeteer script.** Design doc updated accordingly.
- [x] 1.2 Verified: `src/main.tsx` already wraps `<App />` in `<HelmetProvider>` (line 12). No change needed.
- [x] 1.3 Audited `src/lib/dates.ts`: both `formatAirDate` and `formatReviewDate` use ISO regex parsing on the fast path (timezone-safe), only falling back to `new Date()`-based formatting for non-ISO input. All real frontmatter dates use ISO format (`airDate: "1986-01-09"`, `reviewDate: "2026-05"`), so the timezone-safe path is always taken. No hydration-mismatch risk from dates. No other obvious non-determinism in the render path.
- [x] 1.4 Found `public/_redirects` containing `/* /index.html 200` (Netlify-style SPA fallback). **Caveat**: Amplify Hosting does not natively parse Netlify's `_redirects` file format — the rewrite rule is normally set in the Amplify Console under "Rewrites and redirects". If client-side routing currently works in production (e.g. refreshing `/about` does not 404), an equivalent rule must already be configured in the console. **Action item for the deploy**: verify the Amplify Console rewrite rule. If `_redirects` is the only source, plan to migrate the rule into the Amplify console or `amplify.yml` `customHeaders`/`redirects` config before relying on it for prerendering's fallback case.

## 2. Build the custom prerender script

- [x] 2.1 `npm install --save-dev puppeteer` succeeded after `sudo chown -R 501:20 ~/.npm`. Puppeteer 25.0.2 added to devDependencies; bundled Chromium downloaded.
- [x] 2.2 Hydration marker added in `src/main.tsx`: after the `hydrateRoot` / `createRoot` call, a `requestAnimationFrame` callback sets `window.__APP_HYDRATED__ = true`. (Implementation also added the conditional `hydrateRoot` vs `createRoot` branch from task 4.1.)
- [x] 2.3 `scripts/prerender.mjs` written (~155 lines including the embedded static-file server) implementing the full D1 contract: ephemeral-port static server, puppeteer launch with `--no-sandbox` flags, per-route navigate + `waitForFunction(window.__APP_HYDRATED__)` (30 s timeout), DOM capture, `<title>` sanity check, per-route error isolation, summary + non-zero exit on any failure, `finally`-block teardown of browser and server.
- [x] 2.4 Concurrency pool (`runPool`) implemented inline in `prerender.mjs`. Default concurrency `CONCURRENCY = 4` (module-level constant; trivially tunable).
- [x] 2.5 Verified end-to-end via `npm run build`. All 13 routes rendered successfully (0 failures). Output sizes: `/` 8.5 KB, `/lovejoy-overview` 13.8 KB, `/links` 14.3 KB, `/episodes/series-1-episode-1-the-firefly-cage` 10.4 KB, series pages ~4–5 KB. Total prerender phase added ~10 s to build time at current corpus size.

## 3. Centralise route enumeration

- [x] 3.1 Created `scripts/lib/routes.mjs` exporting `getAllRoutes()` and `getEpisodeEntries()`. Static routes hard-coded (12: `/`, `/series`, `/series/{1..6}`, `/archive`, `/lovejoy-overview`, `/about`, `/links`); episode routes derived from MDX frontmatter via the walker/frontmatter parser extracted from `generate-sitemap.mjs`. Sorted output for determinism.
- [x] 3.2 Refactored `scripts/generate-sitemap.mjs` to delegate route enumeration to `getEpisodeEntries()`. Sitemap output now also includes `/links` (was previously omitted — minor pre-existing oversight that prerendering's matching-set requirement surfaces). Other URLs unchanged.
- [x] 3.3 Created `scripts/print-routes.mjs` and wired up `npm run routes`. Verified output: 13 routes (12 static + 1 episode).

## 4. Switch to React 18 hydration

- [x] 4.1 Implemented in `src/main.tsx`: conditional `container.hasChildNodes() ? hydrateRoot(...) : createRoot(...).render(...)`. (Done in the same edit as task 2.2 — the hydration marker and the conditional belong together.)
- [ ] 4.2 Run `npm run dev` and confirm the dev experience is unchanged. *(Needs human — visual check in browser.)*

## 5. Wire prerendering into the build pipeline

- [x] 5.1 Updated `package.json` `scripts.build` to `tsc && vite build && node scripts/prerender.mjs && node scripts/generate-sitemap.mjs`. Also added `npm run routes` alias.
- [x] 5.2 `npm run build` verified locally:
  - Exit 0. ✓
  - All 13 expected `dist/{route}/index.html` files produced. ✓
  - `dist/lovejoy-overview/index.html`: `<title>What is Lovejoy? — an introduction · The Divvy</title>`, `og:title` populated, `<h1 class="article__title">What on earth is Lovejoy?</h1>` present in static HTML. ✓
  - `dist/episodes/series-1-episode-1-the-firefly-cage/index.html`: `<title>The Firefly Cage — Lovejoy S1E1 review · The Divvy</title>` present in static HTML. ✓

## 6. Hydration validation

- [ ] 6.1 Run `npm run build && npx serve dist -p 4173`. Load `http://localhost:4173/lovejoy-overview` in a browser with the network throttled to "Slow 3G". Confirm the article content is visible *before* the JS bundle finishes loading.
- [ ] 6.2 In dev tools console, watch for React hydration mismatch warnings on the same load. If any appear, identify the source (likely non-deterministic render code from task 1.3) and fix.
- [ ] 6.3 Click an in-app `<Link>` from the prerendered page to another route. Confirm client-side navigation works and the `<title>` updates in the browser tab.
- [ ] 6.4 Open `view-source:` on a prerendered route in the browser. Confirm the page's `<title>`, `<meta description>`, `og:title`, `og:image`, and `<link rel="canonical">` are all present in the raw HTML response.

## 7. Amplify integration

- [ ] 7.1 Review `amplify.yml`. If `puppeteer`'s bundled Chromium needs system-level deps on `linux2023` (libnss3, libgbm1, etc.), add a `preBuild` install step. (Anticipated: not required — `puppeteer` ships a self-contained Chromium. Verify empirically on the first Amplify build.)
- [ ] 7.2 Push to a branch that triggers an Amplify preview build (or trigger a build on `main` and watch). Confirm:
  - Build succeeds.
  - Build log shows `scripts/prerender.mjs` processing each expected route.
  - Build duration is within an acceptable range (< 3 min total for current corpus).
- [ ] 7.3 After deploy, `curl -s https://thedivvy.co.uk/lovejoy-overview | grep -i lovejoy` and confirm the response contains the article content without any JS execution.
- [ ] 7.4 `curl -s https://thedivvy.co.uk/episodes/this-slug-does-not-exist` and confirm the response is the SPA fallback `index.html` (Amplify rewrite still works for unknown routes).

## 8. Social and search-engine validation

- [ ] 8.1 Use the Facebook Sharing Debugger (`https://developers.facebook.com/tools/debug/`) on `https://thedivvy.co.uk/lovejoy-overview`. Confirm the scraped `og:title`, `og:description`, and `og:image` match the React-rendered values.
- [ ] 8.2 Use Twitter's Card Validator or post the URL to a draft thread in X. Confirm the `summary_large_image` card renders with the correct title, description, and image.
- [ ] 8.3 Post the URL to a private Discord channel. Confirm the embed shows the correct title, description, and OG image.
- [ ] 8.4 Resubmit `https://thedivvy.co.uk/sitemap.xml` in Google Search Console. Request re-indexing of `/`, `/lovejoy-overview`, and one episode URL.
- [ ] 8.5 (Optional, after a few days) Spot-check Bing Webmaster Tools or `https://www.bing.com/search?q=site:thedivvy.co.uk` to confirm Bing has discovered and indexed the prerendered pages.

## 9. Documentation and clean-up

- [x] 9.1 README updated with: (a) expanded "Build" section explaining the three-stage pipeline and the `window.__APP_HYDRATED__` marker; (b) expanded "Deploying to AWS Amplify" section covering the `--no-sandbox` flags, the `_redirects` / console SPA fallback caveat, and the single-source `VITE_SITE_URL` env var.
- [x] 9.2 Verified `.gitignore` excludes `dist/`, `node_modules`, and `dist-ssr`. No commit risk.
- [x] 9.3 `node_modules/puppeteer` covered by the standard `node_modules` rule in `.gitignore`. Verified.
- [x] 9.4 `rm -rf dist && npm run build` succeeded: vite build (2.46s), prerender 13/13 routes OK, sitemap 13 URLs. Build pipeline is deterministic from a clean dist.
