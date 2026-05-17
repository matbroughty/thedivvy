## Why

The Divvy is a Lovejoy-review site, but a first-time visitor gets no immediate visual cue that this is *about* Lovejoy — there is no show-specific imagery in the header and the favicon was a generic stylised "D". An earlier iteration of this change placed a hero portrait on the homepage only; on review that location demoted the latest-review content and only branded the homepage. Moving the portrait into the site header gives every page a clear Lovejoy identity at first glance, while the favicon work keeps the browser tab on-brand. We have `public/images/core/lovejoy_main_circle.png` (already a circular crop) and `public/images/core/plaque.webp` available, so this is a cheap presentational change with no new dependencies.

## What Changes

- Add a small circular Lovejoy badge to the **site header** (`src/components/Header.tsx`) on the left, beside the existing "The Divvy" brand link, so it appears on every page.
- Source the badge from `public/images/core/lovejoy_main_circle.png` (a pre-circular PNG). Downscale and re-export it as a header-sized asset (~96×96, ideally < 30 KB) before shipping, since the source file is ~2.1 MB and would be served on every page load otherwise.
- **Revert** the previous hero-image addition on the homepage: remove the `<img className="hero__badge">` from both branches of `src/pages/HomePage.tsx` and remove the `.hero__badge` rules from `src/styles/global.css`. The `lovejoy_main.jpg` asset can stay in the repo (no longer referenced) or be removed if cleanup is desired.
- Keep the favicon work delivered by the earlier iteration: `public/favicon-32.png`, `public/favicon-192.png`, `public/apple-touch-icon.png`, and the matching `<link>` tags in `index.html`. No re-work needed here.
- Style the header badge with a fixed pixel size that fits inside the existing header row, with a smaller size on narrow viewports. The image must not increase header height meaningfully or wrap the nav onto an extra row at common breakpoints.
- Treat the header badge as decorative (`alt=""`) because the adjacent "The Divvy" brand text already names the site for assistive tech.

Non-goals: rebranding the rest of the site, changing the colour palette, restructuring the nav, or re-introducing any hero imagery on the homepage.

## Capabilities

### New Capabilities
- `site-branding`: Lovejoy-themed visual identity in the site header (present on every page) and in the browser favicon/touch-icon set.

### Modified Capabilities
<!-- None — there are no existing specs in openspec/specs/. -->

## Impact

- **Code**: `src/components/Header.tsx` (new `<img>` beside the brand link), `src/styles/global.css` (new header-badge styles; remove old `.hero__badge` rules), `src/pages/HomePage.tsx` (revert the previously added hero `<img>` in both branches). `index.html` favicon links are unchanged from the prior iteration.
- **Assets**: A new downscaled PNG (e.g. `public/images/core/lovejoy_main_circle_96.png`) derived from `lovejoy_main_circle.png`. The 2.1 MB source PNG should not be referenced directly. Existing favicon files (`favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`) remain. `public/images/core/lovejoy_main.jpg` becomes unused — keep or remove at author's discretion.
- **Build/deploy**: No new dependencies. Vite serves `public/` verbatim; the new PNG just needs to live there. `amplify.yml` is unchanged.
- **SEO / sharing**: No change to OG image (`Seo` still uses the latest episode image). Header badge is purely visual.
- **Accessibility**: New header `<img>` is decorative (`alt=""`), since the adjacent "The Divvy" link names the site. Header semantics (`<header>` → `<nav aria-label="Primary">`) are unchanged.
- **Performance**: Header renders on every route, so the badge asset MUST be optimised. Target ≤ 30 KB.
