import { Link } from "react-router-dom";
import { ALL_SERIES, getSeriesStats } from "../lib/episodes";
import Seo from "../components/Seo";

export default function SeriesIndexPage() {
  return (
    <div className="page page--narrow">
      <Seo
        title="Lovejoy series guide"
        description="Lovejoy ran for six series between 1986 and 1994. Browse our reviews of every series, from the Firefly Cage onwards."
      />
      <h1>The series</h1>
      <p>
        Lovejoy ran for six series between 1986 and 1994 — a respectable
        amount of dodgy antiques, raised eyebrows and dwindling divinations.
        Pick a series to see what we've reviewed so far.
      </p>

      <div className="card-grid" style={{ marginTop: "2rem" }}>
        {ALL_SERIES.map((s) => {
          const stats = getSeriesStats(s);
          return (
            <Link
              key={s}
              to={`/series/${s}`}
              className={`series-card ${stats.count === 0 ? "series-card--empty" : ""}`}
            >
              <div className="series-card__title">Series {s}</div>
              <div className="series-card__meta">
                {stats.count === 0
                  ? "No reviews yet"
                  : `${stats.count} review${stats.count === 1 ? "" : "s"} · avg ${stats.averageScore!.toFixed(1)} / 5`}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
