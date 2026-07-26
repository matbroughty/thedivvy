import type { ComponentType } from "react";

export interface Soundtrack {
  title: string;
  artist: string;
  /** Optional deep link to the track on Spotify. */
  spotifyUrl?: string;
}

export interface EpisodeFrontmatter {
  title: string;
  series: number;
  episode: number;
  /** Last episode number for multi-part stories (e.g. 10 for a 9–10 two-parter). */
  episodeEnd?: number;
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
  /** Additional episode images (only shown on full episode page, not previews). */
  image2?: string;
  imageAlt2?: string;
  imageSourceUrl2?: string;
  image3?: string;
  imageAlt3?: string;
  imageSourceUrl3?: string;
  /** Song heard somewhere in the episode. Optional. */
  soundtrack?: Soundtrack;
}

export interface Episode {
  frontmatter: EpisodeFrontmatter;
  Component: ComponentType;
  path: string;
}
