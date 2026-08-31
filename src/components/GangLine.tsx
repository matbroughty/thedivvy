import { getGang, isFullBand } from "../lib/gang";
import type { EpisodeFrontmatter } from "../types";

/**
 * "The Gang" — the five regulars, with absentees struck through.
 *
 * Renders nothing when the episode has no `gang` block, so a review that
 * predates the field degrades quietly rather than claiming an empty cast.
 */
export default function GangLine({
  frontmatter,
}: {
  frontmatter: EpisodeFrontmatter;
}) {
  const gang = getGang(frontmatter);
  if (!gang) return null;

  const fullBand = isFullBand(frontmatter);

  return (
    <div className="gang">
      <span className="gang__label">The Gang</span>
      <ul className="gang__list">
        {gang.map(({ key, name, present }) => (
          <li
            key={key}
            className="gang__member"
            data-present={present ? "yes" : "no"}
          >
            {present ? (
              name
            ) : (
              <>
                <s>{name}</s>
                {/* The strikethrough is the whole point visually, but it does
                    not survive being read aloud, so say it. */}
                <span className="sr-only"> (does not appear)</span>
              </>
            )}
          </li>
        ))}
      </ul>
      {fullBand && (
        <span className="gang__fullband">
          <span aria-hidden>🎸</span> Full band
        </span>
      )}
    </div>
  );
}
