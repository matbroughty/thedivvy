import { Link } from "react-router-dom";
import {
  ALL_SERIES,
  getAllEpisodes,
  getEpisodesBySeries,
  getLatestEpisode,
} from "../lib/episodes";
import EpisodeCard from "../components/EpisodeCard";
import EpisodeScore from "../components/EpisodeScore";
import EpisodeThumbnail from "../components/EpisodeThumbnail";
import Seo from "../components/Seo";
import { formatAirDate, formatReviewDate } from "../lib/dates";

export default function HomePage() {
  const latest = getLatestEpisode();
  const all = getAllEpisodes();
  const recent = all.slice(-6).reverse();

  return (
    <div className="page">
      <Seo
        description="Weekly reviews of every episode of Lovejoy — the BBC's finest dodgy-antiques-dealer drama, starring Ian McShane. Antiques, Eric, Tinker, Lady Jane, and the occasional murder."
        image={latest?.frontmatter.image}
      />
      {latest ? (
        <section className="hero" aria-labelledby="latest-title">
          <div className="hero__layout">
            <div className="hero__text">
              <div className="hero__eyebrow">
                Latest review &middot; Series {latest.frontmatter.series},
                Episode {latest.frontmatter.episode}
              </div>
              <h1 className="hero__title" id="latest-title">
                {latest.frontmatter.title}
              </h1>
              {(() => {
                const aired = formatAirDate(latest.frontmatter.airDate);
                const reviewed = formatReviewDate(latest.frontmatter.reviewDate);
                if (!aired && !reviewed) return null;
                return (
                  <p className="hero__meta">
                    {aired && <>Aired {aired}</>}
                    {aired && reviewed && <span aria-hidden> &middot; </span>}
                    {reviewed && <>Reviewed {reviewed}</>}
                  </p>
                );
              })()}
              <p className="hero__summary">{latest.frontmatter.summary}</p>
              <div className="hero__row">
                <div>
                  <EpisodeScore
                    score={latest.frontmatter.score}
                    series={latest.frontmatter.series}
                    size="lg"
                  />
                </div>
                <Link
                  to={`/episodes/${latest.frontmatter.slug}`}
                  className="start-here__item"
                  style={{ maxWidth: 220 }}
                >
                  <span>Read in full</span>
                  {latest.frontmatter.title} &rarr;
                </Link>
              </div>
            </div>
            <EpisodeThumbnail
              frontmatter={latest.frontmatter}
              className="episode-thumb--hero"
            />
          </div>
        </section>
      ) : (
        <section className="hero">
          <div className="hero__eyebrow">No reviews yet</div>
          <h1 className="hero__title">Drop an MDX file in to begin</h1>
          <p className="hero__summary">
            Add a file under <code>src/content/reviews/</code> and it'll appear
            here.
          </p>
        </section>
      )}

      <section className="section">
        <div className="section__head">
          <h2>Start here</h2>
        </div>
        <div className="start-here">
          <Link to="/lovejoy-overview" className="start-here__item">
            <span>If you've never seen the show</span>
            What on earth is Lovejoy? &rarr;
          </Link>
          <Link to="/series/1" className="start-here__item">
            <span>The very beginning</span>
            Series 1 &rarr;
          </Link>
          <Link to="/archive" className="start-here__item">
            <span>The full set</span>
            Every review, by series &rarr;
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Browse by series</h2>
          <Link to="/series" className="section__link">
            All series &rarr;
          </Link>
        </div>
        <div className="card-grid">
          {ALL_SERIES.map((s) => {
            const count = getEpisodesBySeries(s).length;
            return (
              <Link
                key={s}
                to={`/series/${s}`}
                className={`series-card ${count === 0 ? "series-card--empty" : ""}`}
              >
                <div className="series-card__title">Series {s}</div>
                <div className="series-card__meta">
                  {count === 0
                    ? "No reviews yet"
                    : `${count} review${count === 1 ? "" : "s"}`}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="section">
          <div className="section__head">
            <h2>Recent reviews</h2>
            <Link to="/archive" className="section__link">
              See all &rarr;
            </Link>
          </div>
          <div className="card-grid">
            {recent.map((ep) => (
              <EpisodeCard key={ep.frontmatter.slug} episode={ep} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
