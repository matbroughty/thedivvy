## ADDED Requirements

### Requirement: Site header SHALL display a circular Lovejoy badge on every page

The site header (rendered by `src/components/Header.tsx` and present on every route via `src/components/Layout.tsx`) SHALL render a visually circular image sourced from a downscaled export of `public/images/core/lovejoy_main_circle.png`. The badge SHALL be positioned to the left of the existing "The Divvy" brand text and SHALL act as part of the home-link (clicking it navigates to `/`). The badge SHALL NOT push the primary nav onto an additional row at common desktop widths (≥ 1024 px) and SHALL NOT expand the header height beyond its current dimensions.

#### Scenario: Badge is present and circular on the homepage

- **WHEN** a user loads the homepage on a viewport ≥ 768 px wide
- **THEN** an image element resolving to the downscaled Lovejoy circle asset is visible inside the site header, to the left of the "The Divvy" text
- **AND** the rendered element is visually circular
- **AND** clicking the badge navigates to `/`

#### Scenario: Badge is present and circular on every other route

- **WHEN** a user loads any non-homepage route (e.g. `/archive`, `/series/1`, `/episodes/...`, `/about`, `/links`, `/lovejoy-overview`)
- **THEN** the same Lovejoy badge is visible in the site header in the same position
- **AND** clicking the badge navigates to `/`

#### Scenario: Badge scales on mobile without breaking the header

- **WHEN** a user loads any page on a viewport ~375 px wide
- **THEN** the badge is visible and proportionally smaller than on desktop
- **AND** the primary nav and brand text remain visible (allowing for the header's existing `flex-wrap` behaviour)
- **AND** the badge does not introduce a horizontal scrollbar

#### Scenario: Badge is treated as decorative for assistive tech

- **WHEN** a screen reader traverses the site header
- **THEN** the Lovejoy badge is announced as decorative (empty `alt`) or skipped, and is not read out with a redundant label such as "Lovejoy image"
- **AND** the surrounding brand link is announced as "The Divvy, link" (or equivalent)

#### Scenario: Header badge asset is small enough to ship on every page

- **WHEN** the production build is produced (`npm run build`)
- **THEN** the asset referenced by the badge `<img src>` is a downscaled PNG (not the ~2.1 MB source `lovejoy_main_circle.png`)
- **AND** the asset is ≤ 30 KB on disk

### Requirement: Homepage SHALL NOT display the previously added hero badge

The homepage (`/`) SHALL NOT render the circular Lovejoy hero `<img className="hero__badge">` that was added by the earlier iteration of this change. The `.hero__badge` CSS rules SHALL be removed from `src/styles/global.css`. The existing latest-review hero (title, summary, score, "Read in full" CTA, and `EpisodeThumbnail`) remains unchanged.

#### Scenario: Homepage hero no longer contains the badge image

- **WHEN** a user loads the homepage
- **THEN** no `<img>` element with class `hero__badge` is present anywhere on the page
- **AND** the latest-review title, summary, score, and "Read in full" link remain visible and functional

#### Scenario: Fallback hero (no latest review) no longer contains the badge image

- **WHEN** the homepage renders its fallback hero (no episode reviews exist)
- **THEN** no `<img>` element with class `hero__badge` is present
- **AND** the fallback "No reviews yet" message renders without errors

#### Scenario: `.hero__badge` CSS rules are removed

- **WHEN** `src/styles/global.css` is searched for `.hero__badge`
- **THEN** no rule or media-query override referencing `.hero__badge` is found

### Requirement: Browser tab icon SHALL use a Lovejoy-themed favicon derived from the plaque image

The site SHALL serve a favicon set derived from `public/images/core/plaque.webp` and reference those assets from `index.html`. The favicon set SHALL include at least a 32×32 PNG for browser tabs and a 180×180 PNG for the iOS home-screen / Apple touch icon. (This requirement carries over unchanged from the earlier iteration of this change — the pivot does not affect favicons.)

#### Scenario: Favicon files exist in the public folder

- **WHEN** the production build is produced (`npm run build`) or the dev server is running
- **THEN** the files `/favicon-32.png` and `/apple-touch-icon.png` are reachable at the site root
- **AND** each file is a non-empty image of the correct pixel dimensions (32×32 and 180×180 respectively)

#### Scenario: `index.html` references the new favicon assets

- **WHEN** a browser fetches `index.html`
- **THEN** the document `<head>` contains a `<link rel="icon">` pointing to a PNG favicon (e.g. `/favicon-32.png`)
- **AND** the document `<head>` contains a `<link rel="apple-touch-icon">` pointing to `/apple-touch-icon.png`
- **AND** no `<link rel="icon">` references the previous generic `/favicon.svg` placeholder

#### Scenario: Tab icon renders in a modern browser

- **WHEN** a user opens the site in a current desktop browser (Chrome, Firefox, Safari, or Edge)
- **THEN** the browser tab shows the Lovejoy-plaque-derived favicon and not the previous "D" tile (allowing for browser favicon caching on revisit)
