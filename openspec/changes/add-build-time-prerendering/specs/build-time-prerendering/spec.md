## ADDED Requirements

### Requirement: Production build SHALL produce a prerendered HTML file for every known route

After `npm run build` completes successfully, the `dist/` output directory SHALL contain one fully-rendered HTML file per known route. Each file SHALL include the route's resolved `<title>`, `<meta name="description">`, all Open Graph and Twitter card meta tags, `<link rel="canonical">`, and the page's rendered body content (headings, paragraphs, links, image references) — all present in the static HTML, requiring no JavaScript execution to read.

#### Scenario: Static route is prerendered

- **WHEN** `npm run build` completes
- **THEN** `dist/lovejoy-overview/index.html` exists
- **AND** the file's `<title>` element contains the string `What is Lovejoy?`
- **AND** the file's `<body>` contains the rendered article text (e.g. the string "What on earth is Lovejoy?")
- **AND** the file's `<head>` contains an Open Graph `og:title` meta tag with the same title content

#### Scenario: Series index and per-series routes are prerendered

- **WHEN** `npm run build` completes
- **THEN** `dist/series/index.html` exists with the series-index page's content
- **AND** `dist/series/1/index.html` through `dist/series/6/index.html` each exist with the corresponding per-series content

#### Scenario: Each MDX episode gets a prerendered route

- **WHEN** `npm run build` completes
- **THEN** for every `.mdx` file under `src/content/reviews/**` with a `slug` frontmatter field, the file `dist/episodes/{slug}/index.html` exists
- **AND** the file's `<title>` contains the episode's title and the substring `Lovejoy`
- **AND** the file's `<body>` contains the episode's review content

#### Scenario: Crawler-visible content does not depend on JavaScript

- **WHEN** any prerendered route's HTML is fetched with JavaScript disabled (e.g. `curl https://thedivvy.co.uk/lovejoy-overview`)
- **THEN** the response body contains the route's full rendered title, description, and primary body content
- **AND** no `<noscript>` fallback or "JavaScript required" message is necessary to read the page

### Requirement: Route enumeration SHALL share a single source of truth with sitemap generation

The build SHALL derive the list of routes to prerender from the same enumeration logic used by `scripts/generate-sitemap.mjs`, so that the set of URLs in `dist/sitemap.xml` and the set of prerendered HTML files stay in lockstep.

#### Scenario: Sitemap and prerendered output cover the same routes

- **WHEN** `npm run build` completes
- **THEN** every `<loc>` URL in `dist/sitemap.xml` (excluding the bare site root duplicate, if any) corresponds to a prerendered HTML file under `dist/`
- **AND** there are no prerendered HTML files under `dist/` for routes not listed in the sitemap

#### Scenario: Adding a new episode review automatically extends prerendering

- **WHEN** a new MDX file is added under `src/content/reviews/` with a valid `slug` frontmatter field
- **AND** `npm run build` is run
- **THEN** a new file `dist/episodes/{slug}/index.html` is produced without any further configuration changes
- **AND** that route also appears in `dist/sitemap.xml`

### Requirement: Build SHALL fail on any prerender error

The build process SHALL exit with a non-zero status code if any route fails to prerender for any reason — including network errors, JavaScript exceptions, missing route handlers, timeouts, or empty/missing `<title>` output. Silent partial success SHALL NOT be permitted.

#### Scenario: A broken route causes the build to fail

- **WHEN** a route is configured for prerendering but the React app throws an unhandled error when rendering it
- **AND** `npm run build` is run
- **THEN** the build exits with a non-zero status code
- **AND** the build log contains a message identifying the failing route and the error

#### Scenario: An empty `<title>` causes the build to fail

- **WHEN** a route prerenders successfully but produces an HTML document with no `<title>` content (or a `<title>` containing only the static `index.html` fallback)
- **AND** `npm run build` is run
- **THEN** the build exits with a non-zero status code

### Requirement: SPA hydration SHALL preserve prerendered DOM on first paint

When a prerendered HTML document is loaded in a browser, the React bundle SHALL hydrate the existing DOM (using `hydrateRoot`) rather than discarding and re-rendering it (using `createRoot`). The user SHALL NOT observe a flash of empty content or a re-paint of the prerendered markup during the initial load.

#### Scenario: Hydration does not blank the page

- **WHEN** a user loads any prerendered route in a current desktop browser with normal network conditions
- **THEN** the page's body content is visible from first paint
- **AND** no observable flash of empty `<div id="root">` occurs between HTML parse and React hydration

#### Scenario: Client-side navigation still works after hydration

- **WHEN** a user loads any prerendered route and then clicks an in-app `<Link>` to another route
- **THEN** the destination route is rendered client-side (no full page reload)
- **AND** the destination route's `<title>` and meta tags update correctly via `react-helmet-async`

### Requirement: Build SHALL run on AWS Amplify without console-side rewrite-rule changes

The prerendering step SHALL complete successfully on Amplify's default build container (`linux2023` image or equivalent) using only changes inside the repository (`package.json`, `amplify.yml`, build scripts). No changes to Amplify Hosting's "Rewrites and Redirects" rules in the AWS console SHALL be required for prerendered routes to serve correctly.

#### Scenario: Amplify build succeeds without manual environment setup

- **WHEN** a push to `main` triggers an Amplify build
- **THEN** the build phase completes successfully
- **AND** the build log contains evidence of the prerender step running for the expected number of routes

#### Scenario: Prerendered routes serve from disk; unknown routes fall back to SPA

- **WHEN** a user requests `https://thedivvy.co.uk/lovejoy-overview` (a prerendered route)
- **THEN** the response is the prerendered `dist/lovejoy-overview/index.html`
- **WHEN** a user requests `https://thedivvy.co.uk/episodes/this-slug-does-not-exist` (no prerendered file)
- **THEN** the response falls back via Amplify's existing SPA rewrite to `dist/index.html`
- **AND** React Router renders the 404 page client-side

### Requirement: `npm run dev` SHALL be unaffected

The Vite development server (`npm run dev`) SHALL continue to serve the unprerendered `index.html` shell exactly as it does today. The prerender step SHALL NOT run in dev mode and SHALL NOT slow or alter the dev-server feedback loop.

#### Scenario: Dev server starts unchanged

- **WHEN** a developer runs `npm run dev`
- **THEN** the Vite dev server starts in the same time as before this change (within normal variance)
- **AND** the served `/` route is the unprerendered SPA shell
- **AND** no headless browser is invoked
