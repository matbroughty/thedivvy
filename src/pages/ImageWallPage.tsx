import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { getAllEpisodes } from "../lib/episodes";
import { episodeCode } from "../lib/episodeLabel";
import type { Episode } from "../types";

/**
 * /image-wall — every still used across every review, in one grid.
 *
 * Built from the same frontmatter the episode pages read (image / image2 /
 * image3), so publishing a review with its three stills puts them on the wall
 * with no further wiring. Nothing to maintain here per episode.
 */

interface Tile {
  src: string;
  alt: string;
  slug: string;
  title: string;
  code: string;
  series: number;
}

function tilesFor(episode: Episode): Tile[] {
  const fm = episode.frontmatter;
  const code = episodeCode(fm);
  const base = { slug: fm.slug, title: fm.title, code, series: fm.series };

  return (
    [
      [fm.image, fm.imageAlt],
      [fm.image2, fm.imageAlt2],
      [fm.image3, fm.imageAlt3],
    ] as const
  )
    .filter((pair): pair is readonly [string, string | undefined] =>
      Boolean(pair[0]),
    )
    .map(([src, alt]) => ({
      ...base,
      src,
      alt: alt ?? `Still from ${fm.title}`,
    }));
}

export default function ImageWallPage() {
  const episodes = getAllEpisodes();

  // An image that 404s would otherwise leave a broken-image glyph in the grid.
  // Same approach as EpisodeImage: drop it on error rather than show a hole.
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const markFailed = (src: string) => {
    if (import.meta.env.DEV) {
      console.warn(
        `[ImageWall] could not load "${src}" — drop a file at "public${src}".`,
      );
    }
    setFailed((prev) => new Set(prev).add(src));
  };

  const allTiles = episodes.flatMap(tilesFor).filter((t) => !failed.has(t.src));

  const bySeries = new Map<number, Tile[]>();
  for (const tile of allTiles) {
    if (!bySeries.has(tile.series)) bySeries.set(tile.series, []);
    bySeries.get(tile.series)!.push(tile);
  }
  const seriesNumbers = [...bySeries.keys()].sort((a, b) => a - b);

  // The first row loads eagerly; everything below the fold waits.
  let rendered = 0;

  return (
    <article className="article image-wall">
      <Seo
        title="The Divvy image wall — every Lovejoy still on the site"
        description="Every still used across the Lovejoy episode reviews on The Divvy, gathered into one wall. Each image links back to the review it came from."
      />

      <header className="article__head">
        <div className="article__eyebrow">Everything at once</div>
        <h1 className="article__title">The Divvy image wall</h1>
        <p className="article__summary">
          Every still we have used, in one place and in order. Three per
          episode, give or take, and each one takes you back to the review it
          came from.
        </p>
        <p className="article__note">
          Like the <Link to="/word-map">Word Map</Link>, this builds itself —
          the wall simply takes whatever images each review is carrying, so it
          grows by three every time another episode gets written up.
        </p>
      </header>

      {allTiles.length === 0 ? (
        <p className="empty-note">
          No images yet. The wall fills in as reviews are published.
        </p>
      ) : (
        seriesNumbers.map((s) => (
          <section key={s} className="image-wall__series" data-series={s}>
            <h2 className="image-wall__heading">
              Series {s}
              <span className="image-wall__count">
                {bySeries.get(s)!.length} images
              </span>
            </h2>
            <ul className="image-wall__grid">
              {bySeries.get(s)!.map((tile) => {
                rendered += 1;
                return (
                  <li key={tile.src} className="image-wall__item">
                    <Link
                      to={`/episodes/${tile.slug}`}
                      className="image-wall__link"
                    >
                      <img
                        src={tile.src}
                        alt={tile.alt}
                        loading={rendered <= 4 ? "eager" : "lazy"}
                        decoding="async"
                        onError={() => markFailed(tile.src)}
                        className="image-wall__img"
                      />
                      <span className="image-wall__caption">
                        <span className="image-wall__code">{tile.code}</span>
                        <span className="image-wall__title">{tile.title}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </article>
  );
}
