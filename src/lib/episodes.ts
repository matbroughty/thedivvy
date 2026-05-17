import type { ComponentType } from "react";
import type { Episode, EpisodeFrontmatter } from "../types";

type MDXModule = {
  default: ComponentType;
  frontmatter?: Partial<EpisodeFrontmatter>;
};

const modules = import.meta.glob<MDXModule>(
  "/src/content/reviews/**/*.mdx",
  { eager: true },
);

function isCompleteFrontmatter(
  fm: Partial<EpisodeFrontmatter> | undefined,
  filePath: string,
): fm is EpisodeFrontmatter {
  if (!fm) {
    console.warn(`[episodes] ${filePath}: missing frontmatter`);
    return false;
  }
  const required: (keyof EpisodeFrontmatter)[] = [
    "title",
    "series",
    "episode",
    "slug",
    "score",
    "summary",
    "lovejoyUnits",
    "divvyMoment",
    "guestStar",
  ];
  for (const key of required) {
    if (fm[key] === undefined || fm[key] === null || fm[key] === "") {
      console.warn(`[episodes] ${filePath}: missing required field "${key}"`);
      return false;
    }
  }
  return true;
}

const episodes: Episode[] = Object.entries(modules)
  .map(([path, mod]) => {
    if (!isCompleteFrontmatter(mod.frontmatter, path)) return null;
    return {
      frontmatter: mod.frontmatter,
      Component: mod.default,
      path,
    } satisfies Episode;
  })
  .filter((e): e is Episode => e !== null)
  .sort((a, b) => {
    if (a.frontmatter.series !== b.frontmatter.series) {
      return a.frontmatter.series - b.frontmatter.series;
    }
    return a.frontmatter.episode - b.frontmatter.episode;
  });

export function getAllEpisodes(): Episode[] {
  return episodes;
}

export function getEpisodeBySlug(slug: string): Episode | undefined {
  return episodes.find((e) => e.frontmatter.slug === slug);
}

export function getEpisodesBySeries(series: number): Episode[] {
  return episodes.filter((e) => e.frontmatter.series === series);
}

export function getAllSeries(): number[] {
  const set = new Set(episodes.map((e) => e.frontmatter.series));
  return [...set].sort((a, b) => a - b);
}

export function getLatestEpisode(): Episode | undefined {
  return episodes[episodes.length - 1];
}

export function getAdjacentEpisodes(slug: string): {
  prev: Episode | undefined;
  next: Episode | undefined;
} {
  const idx = episodes.findIndex((e) => e.frontmatter.slug === slug);
  if (idx === -1) return { prev: undefined, next: undefined };
  return {
    prev: idx > 0 ? episodes[idx - 1] : undefined,
    next: idx < episodes.length - 1 ? episodes[idx + 1] : undefined,
  };
}

export function getSeriesStats(series: number): {
  count: number;
  averageScore: number | null;
  totalLovejoyUnits: number;
} {
  const list = getEpisodesBySeries(series);
  if (list.length === 0) {
    return { count: 0, averageScore: null, totalLovejoyUnits: 0 };
  }
  const totalScore = list.reduce((sum, e) => sum + e.frontmatter.score, 0);
  const totalLovejoyUnits = list.reduce(
    (sum, e) => sum + e.frontmatter.lovejoyUnits,
    0,
  );
  return {
    count: list.length,
    averageScore: totalScore / list.length,
    totalLovejoyUnits,
  };
}

// Lovejoy ran for 6 series (1986–1994). We always show the full set, even if
// some series have no reviews yet.
export const ALL_SERIES = [1, 2, 3, 4, 5, 6] as const;
