## Context

The Divvy is a small Vite + React 18 site (TypeScript, React Router v6, MDX content). Every page is wrapped in `src/components/Layout.tsx`, which renders `src/components/Header.tsx` above `<main>`. The header today contains a text brand link (`<Link to="/" className="brand">The Divvy</Link>`), a primary nav (`<NavLink>`s plus an Instagram icon), and a centred tagline beneath. Styling lives in a single `src/styles/global.css` with hand-rolled BEM-ish class names; the relevant rules are `.site-header`, `.site-header__inner`, `.brand`, and `.nav`.

An earlier iteration of this change inserted a circular hero portrait on the homepage hero (`src/pages/HomePage.tsx`) and produced a favicon set (`favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`) wired into `index.html`. The favicon work is keepers; the hero portrait is being reverted in favour of a site-wide header badge.

Assets available:
- `public/images/core/lovejoy_main_circle.png` — a pre-circular PNG of Lovejoy (~2.1 MB). Too heavy to serve verbatim on every page, so it will be downscaled to a header-sized PNG.
- `public/images/core/lovejoy_main.jpg` — the original rectangular hero source used in the reverted iteration. Now unused; keep on disk for now.
- `public/images/core/plaque.webp` — already used as the basis for the favicon set; no change.

There are no tests around Header or HomePage rendering, and no existing specs in `openspec/specs/`. The change is purely presentational; no data, routing, or build pipeline changes.

## Goals / Non-Goals

**Goals:**
- Make it visually obvious on every page that The Divvy is a Lovejoy site, by placing a small circular Lovejoy badge in the site header beside the brand text.
- Keep the favicon set introduced in the prior iteration (no rework needed).
- Keep the change cheap: no new dependencies, no asset pipeline changes, no layout regressions in the header at any common breakpoint.
- Avoid shipping a multi-megabyte image on every page load — downscale the source PNG before referencing it.

**Non-Goals:**
- Full visual rebrand (colours, typography, nav structure).
- Re-introducing hero imagery on the homepage.
- Changing the OG/social share image (`Seo` keeps using episode imagery).
- Animation, lightboxes, or click-through behaviour for the badge beyond it being part of the home-link.

## Decisions

### D1. Place the circular image in the site header, not on individual pages

The badge lives inside `Header.tsx` (so it appears on every route via `Layout.tsx`), positioned to the left of the "The Divvy" brand text inside `.site-header__inner`. **Why:** branding is a site-wide concern, not a homepage concern; placing it in the header avoids duplicating it on every page and avoids fighting page-specific content (especially the homepage hero, which we just reverted). The header already has flex layout with `align-items: center`, so a small image slots in cleanly.

**Alternative considered:** keep it on the homepage hero only. Rejected — the earlier iteration tried this and the author preferred site-wide branding via the header.

### D2. The badge becomes part of the home-link

Wrap the `<img>` inside the existing `<Link to="/" className="brand">` so clicking the badge takes the user home — matching the convention used by most sites for logo placement. The brand text "The Divvy" remains visible beside the badge (not replaced). **Why:** zero new affordances to learn; matches user expectation that a logo is a home link; preserves the existing text brand for SEO/screen-reader context. As a structural change inside the `<Link>`, the existing `.brand` styles still apply — we add a child `<img className="brand__badge">` and style it independently.

**Alternative considered:** put the image *outside* the brand link as a sibling. Rejected — would require a second clickable affordance or an unclickable decorative element; either is more friction than reusing the brand link.

### D3. Use the pre-circular PNG, downscaled

Source the badge from `public/images/core/lovejoy_main_circle.png`. The source is already a circular crop on a transparent (or near-transparent) background, so no CSS clipping is needed. But the source is ~2.1 MB — too heavy for a header asset. We will downscale and re-export it to a small, header-sized PNG (target ~96×96 physical pixels, ≤ 30 KB) and commit the result to `public/images/core/` (e.g. `lovejoy_main_circle_96.png`). Apply a defensive `border-radius: 50%` in CSS anyway, in case the downscaled PNG is exported with any rectangular padding. **Why:** smallest possible bytes for an on-every-page asset; pre-circular source avoids the per-pixel cost of CSS clipping; defensive `border-radius` keeps the circle clean if the export has padding.

**Alternative considered:** keep using `lovejoy_main.jpg` (the rectangular hero source) with a CSS circular clip. Rejected — the author explicitly preferred the new pre-circular asset.

**Alternative considered:** reference the 2.1 MB source PNG directly. Rejected — it would cost a multi-MB transfer on every page load.

### D4. Sizing in the header

Target the rendered badge at ~40–48 px diameter on desktop and ~32–36 px on narrow viewports. The current header `.site-header__inner` has `padding: 1.4rem 1.5rem 0.6rem` and uses `align-items: center`, so a 48 px badge fits inside the existing row without expanding header height. Source PNG should be exported at 2× target size (so ~96×96) to look crisp on high-DPI screens. **Why:** small enough not to dominate; big enough to be recognisable; uses the existing header rhythm without changes to surrounding padding.

### D5. Treat the badge as decorative (empty `alt`)

Use `alt=""`. The badge is wrapped in `<Link to="/" className="brand">` and immediately followed by the text "The Divvy" — assistive tech will read "The Divvy, link" which already names the site. Adding `alt="Lovejoy"` would produce a redundant double-announcement.

### D6. Favicon work stays as-is from the previous iteration

`public/favicon-32.png`, `public/favicon-192.png`, `public/apple-touch-icon.png` and their `<link>` tags in `index.html` (replacing the old `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` and the deleted `public/favicon.svg`) are unchanged by this pivot. The tasks for the favicon set are already complete; we do not re-do them.

### D7. Revert the homepage hero badge

Remove the two `<img className="hero__badge">` elements (in the `latest ? (...) : (...)` branches of `HomePage.tsx`) and delete the `.hero__badge` rules from `global.css`. **Why:** the author rejected this placement; leaving the rules in place is dead code. The unused asset `public/images/core/lovejoy_main.jpg` can stay or be deleted — leaving it is harmless.

## Risks / Trade-offs

- **[Header height regression]** → A badge that is too tall could expand the header row at certain breakpoints (the header uses `flex-wrap: wrap`, so it would push the nav onto a second row before it changes height — but the badge itself adds a fixed-height element). Mitigation: cap badge height at ~48 px desktop / ~36 px mobile, verify at common widths (375, 768, 1024, 1280) in dev server.
- **[Image weight on every page]** → A naive reference to the 2.1 MB source would cost on every page load and likely block paint on slow connections. Mitigation: downscale to ≤ 30 KB before shipping (covered in tasks).
- **[Brand-link click target inflation]** → Adding the image inside the brand link expands the click target horizontally, which is fine on desktop but worth checking on touch. Mitigation: the badge has a fixed small width and the brand text stays inline; no expected regression.
- **[Existing CSS rules `.hero__badge` left in place]** → If we forget to delete them, no functional bug (the class isn't referenced) but the stylesheet carries dead code. Mitigation: explicit task to remove the rule and its mobile override.
- **[Decorative `alt=""` is wrong if the brand text is ever removed]** → If a future change replaces "The Divvy" text with the image alone, the badge would become the only site name above the fold and would need a meaningful `alt`. Mitigation: documented in D5.

## Migration Plan

This is a purely additive/presentational change with no migration needed. To roll back: revert the commit. The favicon set from the previous iteration is unaffected. Browsers caching the old favicon may continue to show it briefly; nothing else regresses.

## Open Questions

- **Exact pixel size of the badge** — 40, 44, or 48 px on desktop. Will be tuned visually during implementation; the spec only requires it appear in the header and not expand header height.
- **Whether to delete `public/images/core/lovejoy_main.jpg`** — it becomes unused once the hero revert lands. Default: leave it; it is small and may be useful later.
