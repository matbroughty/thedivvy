import type { ComponentType } from "react";

// Per-series overview essays. One MDX per series at
// /src/content/series/{NN}-overview.mdx — drop a new file in and it
// registers itself; the route and the link from /series/{N} follow.
//
// These live OUTSIDE /src/content/reviews so the episode loader's
// required-frontmatter check never sees them.

type OverviewModule = {
  default: ComponentType;
  frontmatter?: { title?: string; series?: number; summary?: string };
};

const modules = import.meta.glob<OverviewModule>(
  "/src/content/series/*.mdx",
  { eager: true },
);

export interface SeriesOverview {
  series: number;
  title: string;
  summary: string;
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
    summary: fm.summary,
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
