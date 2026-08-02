import { Link, useParams } from "react-router-dom";
import {
  ALL_SERIES,
  getEpisodesBySeries,
  getSeriesStats,
} from "../lib/episodes";
import EpisodeCard from "../components/EpisodeCard";
import { getSeriesOverview } from "../lib/seriesOverviews";
import Seo from "../components/Seo";
import { useSeriesTheme } from "../lib/useSeriesTheme";
import NotFoundPage from "./NotFoundPage";

export default function SeriesPage() {
  const { id } = useParams();
  const seriesNum = Number(id);
  const valid =
    !!id &&
    Number.isFinite(seriesNum) &&
    (ALL_SERIES as readonly number[]).includes(seriesNum);

  useSeriesTheme(valid ? seriesNum : undefined);

  if (!valid) {
    return <NotFoundPage />;
  }

  const episodes = getEpisodesBySeries(seriesNum);
  const stats = getSeriesStats(seriesNum);
  const overview = getSeriesOverview(seriesNum);

  return (
    <div className="page page--narrow" data-series={seriesNum}>
      <Seo
        title={`Lovejoy Series ${seriesNum} reviews`}
        description={
          stats.count === 0
            ? `Lovejoy Series ${seriesNum} — episode reviews coming soon to The Divvy.`
            : `${stats.count} review${stats.count === 1 ? "" : "s"} of Lovejoy Series ${seriesNum}, with an average score of ${stats.averageScore!.toFixed(1)}/5. Read every review on The Divvy.`
        }
      />
      <p>
        <Link to="/series">&larr; All series</Link>
      </p>
      <h1>Series {seriesNum}</h1>

      {stats.count === 0 ? (
        <p className="empty-note">
          No reviews for Series {seriesNum} yet — but rest assured Lovejoy is
          out there in a Morris Minor somewhere, getting in trouble.
        </p>
      ) : (
        <p className="hero__summary" style={{ marginBottom: "2rem" }}>
          {stats.count} review{stats.count === 1 ? "" : "s"} &middot; average
          score{" "}
          <strong>{stats.averageScore!.toFixed(1)} / 5</strong> &middot; total
          Lovejoy Units{" "}
          <strong>{stats.totalLovejoyUnits}</strong>
        </p>
      )}

      {overview && (
        <p className="series-overview-link">
          <Link to={`/series/${seriesNum}/overview`}>
            <strong>{overview.title}</strong>
          </Link>{" "}
          <span className="series-overview-link__blurb">{overview.summary}</span>
        </p>
      )}

      {episodes.length > 0 && (
        <div className="card-grid">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.frontmatter.slug} episode={ep} />
          ))}
        </div>
      )}
    </div>
  );
}
