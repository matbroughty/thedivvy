// Display labels for episode numbers, aware of multi-part stories
// (frontmatter `episodeEnd`). Kept separate from lib/episodes.ts so pages
// that only need labels (e.g. SearchPage) don't pull in the eager MDX glob.

interface EpisodeRef {
  series: number;
  episode: number;
  episodeEnd?: number;
}

/** "9", or "9 & 10" for a two-parter. */
export function episodeNumberLabel(ep: Pick<EpisodeRef, "episode" | "episodeEnd">): string {
  return ep.episodeEnd ? `${ep.episode} & ${ep.episodeEnd}` : String(ep.episode);
}

/** "Episode 9", or "Episodes 9 & 10" for a two-parter. */
export function episodeHeading(ep: Pick<EpisodeRef, "episode" | "episodeEnd">): string {
  return `${ep.episodeEnd ? "Episodes" : "Episode"} ${episodeNumberLabel(ep)}`;
}

/** "S1E9" / "S1E9–10", or zero-padded "S1E09" / "S1E09–10" with pad. */
export function episodeCode(ep: EpisodeRef, opts?: { pad?: boolean }): string {
  const fmt = (n: number) => (opts?.pad ? String(n).padStart(2, "0") : String(n));
  const range = ep.episodeEnd ? `${fmt(ep.episode)}–${fmt(ep.episodeEnd)}` : fmt(ep.episode);
  return `S${ep.series}E${range}`;
}
