import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getAdjacentEpisodes,
  getEpisodeBySlug,
} from "../lib/episodes";
import EpisodeScore from "../components/EpisodeScore";
import EpisodeImage from "../components/EpisodeImage";
import Seo from "../components/Seo";
import { formatAirDate, formatReviewDate } from "../lib/dates";
import NotFoundPage from "./NotFoundPage";

export default function EpisodePage() {
  const { slug = "" } = useParams();
  const episode = getEpisodeBySlug(slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  if (!episode) return <NotFoundPage />;

  const { frontmatter, Component } = episode;
  const { prev, next } = getAdjacentEpisodes(slug);
  const aired = formatAirDate(frontmatter.airDate);
  const reviewed = formatReviewDate(frontmatter.reviewDate);

  const seoTitle = `${frontmatter.title} — Lovejoy S${frontmatter.series}E${frontmatter.episode} review`;
  const seoDescription = `${frontmatter.summary} Score: ${frontmatter.score}/10. Guest stars: ${frontmatter.guestStar}.`;

  return (
    <article className="article">
      <Seo
        title={seoTitle}
        description={seoDescription}
        image={frontmatter.image}
        type="article"
      />
      <header className="article__head">
        <div className="article__eyebrow">
          <Link to={`/series/${frontmatter.series}`}>
            Series {frontmatter.series}
          </Link>{" "}
          &middot; Episode {frontmatter.episode}
        </div>
        <h1 className="article__title">{frontmatter.title}</h1>
        {(aired || reviewed) && (
          <p className="article__dates">
            {aired && <>Aired {aired}</>}
            {aired && reviewed && <span aria-hidden> &middot; </span>}
            {reviewed && <>Reviewed {reviewed}</>}
          </p>
        )}
        <p className="article__summary">{frontmatter.summary}</p>
        <div className="article__score-row">
          <EpisodeScore
            score={frontmatter.score}
            series={frontmatter.series}
            size="lg"
          />
          <span className="article__score-label">— our score</span>
        </div>
      </header>

      <EpisodeImage frontmatter={frontmatter} />

      <div className="article__body">
        <Component />
      </div>

      <nav className="episode-nav" aria-label="Adjacent episodes">
        {prev ? (
          <Link
            to={`/episodes/${prev.frontmatter.slug}`}
            className="episode-nav__link"
          >
            <span className="episode-nav__direction">&larr; Previous</span>
            <span className="episode-nav__title">{prev.frontmatter.title}</span>
          </Link>
        ) : (
          <div className="episode-nav__placeholder">
            &larr; The very beginning
          </div>
        )}
        {next ? (
          <Link
            to={`/episodes/${next.frontmatter.slug}`}
            className="episode-nav__link episode-nav__link--next"
          >
            <span className="episode-nav__direction">Next &rarr;</span>
            <span className="episode-nav__title">{next.frontmatter.title}</span>
          </Link>
        ) : (
          <div className="episode-nav__placeholder episode-nav__placeholder--next">
            Next review still in the workshop &rarr;
          </div>
        )}
      </nav>

      <p style={{ textAlign: "center", marginTop: "2.4rem" }}>
        <Link to={`/series/${frontmatter.series}`}>
          Back to Series {frontmatter.series}
        </Link>
      </p>
    </article>
  );
}
