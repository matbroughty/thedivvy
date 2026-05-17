## 1. Favicon assets (carried over — already complete)

- [x] 1.1 Inspect `public/images/core/plaque.webp` and decide on the square crop (centre on the most recognisable part of the plaque).
- [x] 1.2 Generate `public/favicon-32.png` (32×32) from the cropped plaque image.
- [x] 1.3 Generate `public/favicon-192.png` (192×192) from the cropped plaque image.
- [x] 1.4 Generate `public/apple-touch-icon.png` (180×180) from the cropped plaque image.
- [ ] 1.5 Eyeball each output at its native size and confirm the 32×32 is still recognisable; if not, re-crop tighter and regenerate. *(Needs human eyes.)*

## 2. Favicon wiring in `index.html` (carried over — already complete)

- [x] 2.1 Remove the existing `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`.
- [x] 2.2 Add `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />`.
- [x] 2.3 Add `<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />`.
- [x] 2.4 Add `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`.
- [x] 2.5 Delete `public/favicon.svg`.

## 3. Revert the homepage hero badge

- [x] 3.1 In `src/pages/HomePage.tsx` (the `latest ? (...)` branch), delete the `<img src="/images/core/lovejoy_main.jpg" … className="hero__badge" />` element from inside `.hero__text`.
- [x] 3.2 In `src/pages/HomePage.tsx` (the fallback `else` branch — the `<section className="hero">` with "No reviews yet"), delete the matching `<img … className="hero__badge" />` element.
- [x] 3.3 In `src/styles/global.css`, delete the `.hero__badge { … }` rule.
- [x] 3.4 In `src/styles/global.css`, delete the `.hero__badge { width: 110px; }` override inside the `@media (max-width: 720px)` block. The mobile block retains its `.hero__layout` override, so the block is not empty.
- [x] 3.5 Decision: keep `public/images/core/lovejoy_main.jpg` in the repo (default per task). No references remain after §3.1–3.2.

## 4. Prepare the downscaled header badge asset

- [x] 4.1 Inspected `public/images/core/lovejoy_main_circle.png`: 1254×1254 RGB PNG, no alpha (circular subject on solid background). `border-radius: 50%` in CSS handles the circular clip regardless.
- [x] 4.2 Produced `public/images/core/lovejoy_main_circle_96.png` via `sips -Z 96 …`.
- [x] 4.3 Verified: 96×96 PNG, 18 579 bytes (~18.5 KB), well under the 30 KB target.
- [x] 4.4 Decision: keep the 2.1 MB source PNG in the repo (default per task) for future re-export. Not referenced from any page.

## 5. Wire the badge into the site header

- [x] 5.1 Inserted `<img src="/images/core/lovejoy_main_circle_96.png" …>` inside `<Link to="/" className="brand">`, before the brand text.
- [x] 5.2 Image has `alt=""`, `width={48}`, `height={48}`, `className="brand__badge"`.
- [x] 5.3 `<Link to="/">` is unchanged; the image is a child element, so clicks anywhere inside the link route to `/` via React Router (no separate handler).

## 6. Style the header badge

- [x] 6.1 Added `.brand__badge` rule (`display: inline-block`, `width: 48px`, `height: 48px`, `border-radius: 50%`, `object-fit: cover`, `vertical-align: middle`, `margin-right: 0.6rem`).
- [x] 6.2 Updated `.brand` to `display: inline-flex; align-items: center;`. The `.brand .brand__the` rule is more specific and unchanged, so the italic accent still applies.
- [x] 6.3 Added `@media (max-width: 720px)` override reducing `.brand__badge` to `36px × 36px`. Matches the existing breakpoint convention used throughout `global.css`.
- [ ] 6.4 Verify the `.site-header` height visually does not increase versus pre-change at desktop widths (≥ 1024 px). *(Needs human — visual check. Note: a 48 px badge is taller than the previous text-only header content, so the header row will likely grow slightly. If undesirable, reduce the badge size in 6.1/6.3.)*

## 7. Verify visually and accessibly

- [ ] 7.1 Run `npm run dev` and load the homepage; confirm the badge appears in the header, left of "The Divvy", at the intended size, and that it is a clean circle. *(Needs human — visual check.)*
- [ ] 7.2 Navigate to at least three other routes (`/archive`, `/series/1`, an episode page, `/about`, `/links`) and confirm the badge appears in the same position on each. *(Needs human — visual check.)*
- [ ] 7.3 Confirm the homepage hero no longer contains the circular badge (reverted) and the latest-review content still renders correctly. *(Needs human — visual check.)*
- [ ] 7.4 In dev tools, resize to ~375 px width; confirm the header badge is smaller, the nav still fits the header without unexpected wrapping issues, and no horizontal scrollbar appears. *(Needs human — visual check.)*
- [ ] 7.5 Click the badge and confirm it navigates to `/`. *(Needs human — visual check.)*
- [x] 7.6 Verified from source: `Header.tsx` line 10 renders `alt=""` on the badge `<img>`.
- [ ] 7.7 Confirm the network panel shows the downscaled PNG being fetched (not the 2.1 MB source) and its transfer size is ≤ 30 KB. *(Needs human — visual check.)*
- [x] 7.8 `npm run build` completed cleanly: TypeScript OK, Vite built `dist/index.html` (1.13 kB), `dist/assets/index-*.css` (14.20 kB), `dist/assets/index-*.js` (219.65 kB); sitemap generated; no warnings or asset errors.
