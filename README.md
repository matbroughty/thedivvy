# The Divvy

A weekly Lovejoy episode review site. Static React + Vite + MDX. No backend, no CMS — just files.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

Output goes to `dist/`.

## Adding a new episode

1. Create a new `.mdx` file under `src/content/reviews/series-XX/` (e.g. `src/content/reviews/series-01/02-the-sting.mdx`).
2. Fill in the frontmatter:

   ```mdx
   ---
   title: "The Sting"
   series: 1
   episode: 2
   slug: "series-1-episode-2-the-sting"
   score: 7
   summary: "One sentence the homepage will quote."
   lovejoyUnits: 4
   divvyMoment: "Short description of the divvy beat"
   guestStar: "Name (or TBC)"
   # Optional but recommended:
   airDate: "1986-01-16"          # ISO date the episode first aired
   reviewDate: "2026-05"          # YYYY-MM (or full ISO) — formats as "May 2026"
   image: "/images/episodes/series-1-episode-2-the-sting.jpg"
   imageAlt: "A still from the episode"
   imageSourceUrl: "https://www.imdb.com/title/..../mediaviewer/...../"
   ---
   ```

   **About the image:** drop a JPG into `public/images/episodes/` and reference it
   with the leading `/`. We don't hot-link from IMDb directly — those URLs are
   HTML pages, not images, and IMDb's terms forbid hotlinking anyway. Use
   `imageSourceUrl` to point at the IMDb page and we'll show a small
   "Image via IMDb" credit underneath.

   **Multiple images:** You can add up to 3 images per episode. Only the main
   `image` appears in previews/cards. All images display on the full episode page:

   ```mdx
   image: "/images/episodes/series-1-episode-1-the-firefly-cage.jpg"
   imageAlt: "Ian McShane as Lovejoy"
   imageSourceUrl: "https://www.imdb.com/..."
   image2: "/images/episodes/series-1-episode-1-the-firefly-cage2.jpg"
   imageAlt2: "Description of second key moment"
   imageSourceUrl2: "https://www.imdb.com/..."
   image3: "/images/episodes/series-1-episode-1-the-firefly-cage3.jpg"
   imageAlt3: "Description of third key moment"
   imageSourceUrl3: "https://www.imdb.com/..."
   ```

3. Write the body using the three main sections (each displays with an icon):

   ```
   ## One Wink Plot
   A brief plot summary — what happens in the episode in one breath.

   ## Review
   The main review content — your thoughts, observations, and commentary.

   ## Guest Star Watch / Divvy Observation
   Notable guest stars and the key "divvy moment" from the episode.
   ```

4. Save. The new episode will appear automatically on the homepage, in its series, and in the archive.

## Per-series score icons (the "Lovejoy units" gimmick)

The score on the homepage hero and the episode page can render as a row of
small character thumbnails — one per score point — followed by a small
"/ 10". Drop a square portrait image at:

```
public/images/score-icons/series-1-score-icon.jpg
public/images/score-icons/series-2-score-icon.jpg
...
```

A square close-crop of the lead character for that series works best (the
image is rendered as a circle). The score will fall back to plain "8 / 10"
text if the file is missing, so it's safe to ship the site before all the
icons are in.

## Deploying to AWS Amplify

- **Build command:** `npm run build`
- **Output directory:** `dist`

`amplify.yml` is included with the same settings, and `public/_redirects` rewrites all paths to `index.html` so client-side routing survives a refresh.

## Project layout

```
src/
  components/   Layout, Header, EpisodeCard, EpisodeScore, MetricsBlock
  pages/        Home, Episode, Series, Archive, Overview, NotFound
  content/
    reviews/
      series-01/
        01-the-firefly-cage.mdx
  lib/
    episodes.ts MDX glob loader, sorting, lookups, series stats
  styles/
    global.css  Theme + layout
```

## Constraints kept

No auth, no comments, no search, no CMS, no DB, no analytics. Lean on purpose.
