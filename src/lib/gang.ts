// The Gang — which of the five recurring regulars appear in an episode.
//
// Frontmatter carries a `gang` block per review (see EpisodeFrontmatter).
// Everything about who the regulars are, and what they are called on screen,
// lives here so the display names are defined once.
//
// Deliberately structured for reuse: `GANG` is an ordered array rather than a
// bare object, and the helpers below take frontmatter rather than an episode,
// so later features — appearance totals, full-band percentage, filtering
// episodes by character, scores against cast combinations — can be built on
// top without touching the component.

import type { EpisodeFrontmatter, Gang } from "../types";

export interface GangCharacter {
  /** Frontmatter key. */
  key: keyof Gang;
  /** How the name is written on the site. */
  name: string;
}

/**
 * The five regulars, in the order they are displayed. Order is the show's
 * own pecking order rather than anything alphabetical.
 */
export const GANG: readonly GangCharacter[] = [
  { key: "lovejoy", name: "Lovejoy" },
  { key: "eric", name: "Eric" },
  { key: "tinker", name: "Tinker" },
  { key: "jane", name: "Lady Jane" },
  { key: "gimbert", name: "Charlie Gimbert" },
] as const;

/** One entry per regular, with whether they turn up. */
export interface GangAppearance extends GangCharacter {
  present: boolean;
}

/**
 * Resolve an episode's gang block into a display-ready list.
 *
 * A missing `gang` block returns null rather than a row of five absences —
 * "we have not recorded this yet" and "nobody was in it" are different
 * things, and only the first should hide the component.
 */
export function getGang(fm: EpisodeFrontmatter): GangAppearance[] | null {
  if (!fm.gang) return null;
  return GANG.map((character) => ({
    ...character,
    present: fm.gang?.[character.key] === true,
  }));
}

/** True when all five regulars appear — the "Full band" case. */
export function isFullBand(fm: EpisodeFrontmatter): boolean {
  const gang = getGang(fm);
  return gang !== null && gang.every((character) => character.present);
}

/** Just the ones who show up. Useful for counting later. */
export function presentMembers(fm: EpisodeFrontmatter): GangAppearance[] {
  return getGang(fm)?.filter((character) => character.present) ?? [];
}
