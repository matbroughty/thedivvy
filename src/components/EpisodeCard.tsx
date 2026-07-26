import { Link } from "react-router-dom";
import type { Episode } from "../types";
import EpisodeScore from "./EpisodeScore";
import SoundtrackLine from "./SoundtrackLine";
import { episodeHeading } from "../lib/episodeLabel";

export default function EpisodeCard({ episode }: { episode: Episode }) {
  const { title, series, slug, summary, score, soundtrack } =
    episode.frontmatter;
  return (
    <Link to={`/episodes/${slug}`} className="episode-card">
      <div className="episode-card__eyebrow">
        Series {series} &middot; {episodeHeading(episode.frontmatter)}
      </div>
      <h3 className="episode-card__title">{title}</h3>
      {soundtrack && (
        <SoundtrackLine soundtrack={soundtrack} variant="subtle" />
      )}
      <p className="episode-card__summary">{summary}</p>
      <div className="episode-card__foot">
        <EpisodeScore score={score} size="sm" />
        <span>Read review &rarr;</span>
      </div>
    </Link>
  );
}
