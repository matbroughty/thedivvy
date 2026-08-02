import type { ComponentType } from "react";

// Per-series overview essays. One MDX per series at
// /src/content/series/{NN}-overview.mdx — drop a new file in and it
// registers itself; the route and the link from /series/{N} follow.
//
// These live OUTSIDE /src/content/reviews so the episode loader's
// required-frontmatter check never sees them.

export interface RankingEntry {
  name: string;
  slug: string;
}

type OverviewModule = {
  default: ComponentType;
  frontmatter?: {
    title?: string;
    heading?: string;
    seoTitle?: string;
    series?: number;
    summary?: string;
    ranking?: RankingEntry[];
  };
};

const modules = import.meta.glob<OverviewModule>(
  "/src/content/series/*.mdx",
  { eager: true },
);

export interface SeriesOverview {
  series: number;
  /** Editorial title, e.g. "Series One — The Divvy Verdict". Used as the eyebrow. */
  title: string;
  /** Descriptive <h1>. Falls back to `title`. */
  heading: string;
  /** <title> tag. Falls back to `heading`. Keep it under ~48 chars — Seo appends " · The Divvy". */
  seoTitle: string;
  summary: string;
  /** Best-first ranking, if the overview contains one. Drives ItemList JSON-LD. */
  ranking: RankingEntry[];
  Component: ComponentType;
}

const overviews = new Map<number, SeriesOverview>();

for (const [filePath, mod] of Object.entries(modules)) {
  const match = filePath.match(/\/(\d+)-overview\.mdx$/);
  if (!match) {
    console.warn(
      `[seriesOverviews] ${filePath}: expected a {NN}-overview.mdx filename`,
    );
    continue;
  }
  const series = Number(match[1]);
  const fm = mod.frontmatter;
  if (!fm?.title || !fm?.summary) {
    console.warn(
      `[seriesOverviews] ${filePath}: needs both title and summary in frontmatter`,
    );
    continue;
  }
  overviews.set(series, {
    series,
    title: fm.title,
    heading: fm.heading ?? fm.title,
    seoTitle: fm.seoTitle ?? fm.heading ?? fm.title,
    summary: fm.summary,
    ranking: fm.ranking ?? [],
    Component: mod.default,
  });
}

export function getSeriesOverview(series: number): SeriesOverview | undefined {
  return overviews.get(series);
}

export function hasSeriesOverview(series: number): boolean {
  return overviews.has(series);
}

export function getOverviewSeriesNumbers(): number[] {
  return [...overviews.keys()].sort((a, b) => a - b);
}
