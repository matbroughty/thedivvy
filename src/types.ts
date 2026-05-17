import type { ComponentType } from "react";

export interface EpisodeFrontmatter {
  title: string;
  series: number;
  episode: number;
  slug: string;
  score: number;
  summary: string;
  lovejoyUnits: number;
  divvyMoment: string;
  guestStar: string;
  /** ISO date the episode first aired, e.g. "1986-01-09". */
  airDate?: string;
  /** Month or full date the review was written, e.g. "2026-05" or "2026-05-04". */
  reviewDate?: string;
  /** Path under /public, e.g. "/images/episodes/firefly-cage.jpg". */
  image?: string;
  imageAlt?: string;
  /** Link used for image attribution, e.g. an IMDb mediaviewer page. */
  imageSourceUrl?: string;
}

export interface Episode {
  frontmatter: EpisodeFrontmatter;
  Component: ComponentType;
  path: string;
}
