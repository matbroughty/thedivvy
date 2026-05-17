import { Link } from "react-router-dom";
import type { Episode } from "../types";
import EpisodeScore from "./EpisodeScore";

export default function EpisodeCard({ episode }: { episode: Episode }) {
  const { title, series, episode: ep, slug, summary, score } = episode.frontmatter;
  return (
    <Link to={`/episodes/${slug}`} className="episode-card">
      <div className="episode-card__eyebrow">
        Series {series} &middot; Episode {ep}
      </div>
      <h3 className="episode-card__title">{title}</h3>
      <p className="episode-card__summary">{summary}</p>
      <div className="episode-card__foot">
        <EpisodeScore score={score} size="sm" />
        <span>Read review &rarr;</span>
      </div>
    </Link>
  );
}
