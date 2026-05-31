import { Link } from "react-router-dom";
import { ALL_SERIES, getEpisodesBySeries } from "../lib/episodes";
import Seo from "../components/Seo";

export default function ArchivePage() {
  return (
    <div className="page page--narrow">
      <Seo
        title="Archive — every Lovejoy review"
        description="Every Lovejoy episode review on The Divvy, grouped by series. Browse all six series of the BBC's classic dodgy-antiques-dealer drama."
      />
      <h1>Archive</h1>
      <p>Every review, grouped by series.</p>

      {ALL_SERIES.map((s) => {
        const episodes = getEpisodesBySeries(s);
        return (
          <section className="archive-series" key={s}>
            <h2>
              <Link
                to={`/series/${s}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Series {s}
              </Link>
            </h2>
            {episodes.length === 0 ? (
              <p className="empty-note">No reviews yet.</p>
            ) : (
              <ul className="archive-list">
                {episodes.map((ep) => (
                  <li key={ep.frontmatter.slug}>
                    <span className="archive-list__num">
                      Ep {ep.frontmatter.episode}
                    </span>
                    <Link
                      to={`/episodes/${ep.frontmatter.slug}`}
                      className="archive-list__title"
                    >
                      {ep.frontmatter.title}
                    </Link>
                    <span className="archive-list__score">
                      {ep.frontmatter.score} / 5
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
