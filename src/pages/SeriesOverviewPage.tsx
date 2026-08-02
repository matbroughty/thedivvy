import { Link, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { ALL_SERIES, getSeriesStats } from "../lib/episodes";
import { getSeriesOverview } from "../lib/seriesOverviews";
import { useSeriesTheme } from "../lib/useSeriesTheme";
import NotFoundPage from "./NotFoundPage";

export default function SeriesOverviewPage() {
  const { id } = useParams();
  const seriesNum = Number(id);
  const valid =
    !!id &&
    Number.isFinite(seriesNum) &&
    (ALL_SERIES as readonly number[]).includes(seriesNum);

  const overview = valid ? getSeriesOverview(seriesNum) : undefined;

  useSeriesTheme(overview ? seriesNum : undefined);

  // A series with no overview essay written yet is a 404, not an empty page.
  if (!overview) {
    return <NotFoundPage />;
  }

  const stats = getSeriesStats(seriesNum);
  const { title, summary, Component } = overview;

  return (
    <article className="article" data-series={seriesNum}>
      <Seo
        title={`${title} — Lovejoy Series ${seriesNum} on The Divvy`}
        description={summary}
      />
      <p>
        <Link to={`/series/${seriesNum}`}>
          &larr; Series {seriesNum} episodes
        </Link>
      </p>
      <header className="article__head">
        <div className="article__eyebrow">Series {seriesNum}</div>
        <h1 className="article__title">{title}</h1>
        <p className="article__summary">{summary}</p>
        {stats.count > 0 && (
          <p className="article__dates">
            {stats.count} review{stats.count === 1 ? "" : "s"} &middot; average
            score {stats.averageScore!.toFixed(1)} / 5
          </p>
        )}
      </header>
      <div className="article__body">
        <Component />
      </div>
    </article>
  );
}
