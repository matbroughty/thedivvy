import type { EpisodeFrontmatter } from "../types";

export default function MetricsBlock({
  frontmatter,
}: {
  frontmatter: EpisodeFrontmatter;
}) {
  return (
    <aside className="metrics" aria-label="Episode metrics">
      <div className="metrics__cell">
        <span className="metrics__label">Lovejoy Units</span>
        <span className="metrics__value">{frontmatter.lovejoyUnits} / 10</span>
      </div>
      <div className="metrics__cell">
        <span className="metrics__label">Divvy Moment</span>
        <span className="metrics__value">{frontmatter.divvyMoment}</span>
      </div>
      <div className="metrics__cell">
        <span className="metrics__label">Guest Star</span>
        <span className="metrics__value">{frontmatter.guestStar}</span>
      </div>
    </aside>
  );
}
