import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { episodeCode } from "../lib/episodeLabel";
import {
  entriesForSeries,
  getSeriesWithReviews,
  getWordStats,
  mentionSummary,
  scatterForCloud,
  weightTier,
  type WordEntry,
  type WordMode,
} from "../lib/wordStats";

/**
 * /word-map — word cloud, heat map and a few running totals over every
 * published review.
 *
 * The data arrives as an imported module (see src/lib/wordStats.ts), so the
 * whole page renders on first paint and prerenders into static HTML. The
 * filters and the detail panel are progressive enhancement: without
 * JavaScript the page still shows the all-reviews cloud, the heat map and the
 * stats, which is the substance of it.
 */
export default function WordMapPage() {
  const stats = getWordStats();
  const seriesWithReviews = getSeriesWithReviews();

  const [mode, setMode] = useState<WordMode>("words");
  const [series, setSeries] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const entries = useMemo(() => entriesForSeries(mode, series), [mode, series]);

  const cloudEntries = useMemo(() => {
    const top = entries.slice(
      0,
      mode === "characters" ? entries.length : stats.tuning.cloudSize,
    );
    return scatterForCloud(top);
  }, [entries, mode, stats.tuning.cloudSize]);

  const heatRows = useMemo(
    () => entries.slice(0, stats.tuning.heatMapWords),
    [entries, stats.tuning.heatMapWords],
  );

  const counts = cloudEntries.map((e) => e.count);
  const maxCount = counts.length ? Math.max(...counts) : 0;
  const minCount = counts.length ? Math.min(...counts) : 0;

  const selectedEntry = selected
    ? (entries.find((e) => e.word === selected) ?? null)
    : null;

  // Heat map columns: only series that have reviews, and when a single series
  // is filtered, only that one.
  const heatColumns =
    series === null ? seriesWithReviews : seriesWithReviews.filter((s) => s === series);

  const heatMax = Math.max(
    1,
    ...heatRows.flatMap((row) => heatColumns.map((s) => row.series[String(s)] ?? 0)),
  );

  const noun = mode === "characters" ? "name" : "word";

  return (
    <article className="article word-map">
      <Seo
        title="The Divvy Word Map — the language of the Lovejoy reviews"
        description="A word cloud and series heat map built from every Lovejoy episode review on The Divvy. Regenerated from the reviews themselves each time the site is built."
      />

      <header className="article__head">
        <div className="article__eyebrow">Counting the words</div>
        <h1 className="article__title">The Divvy Word Map</h1>
        <p className="article__summary">
          Every review on this site, tipped out and counted. What follows is
          the vocabulary the rewatch has accumulated so far — the words that
          keep turning up, and which series they turn up in.
        </p>
        <p className="article__note">
          Nothing here is maintained by hand. The counts are rebuilt from the
          reviews themselves whenever the site goes out, so the map grows a
          little every time another episode gets written up. Common English
          words are set aside, along with a handful that would otherwise win by
          default — <em>Lovejoy</em> among them, which is why the cast get a
          column of their own.
        </p>
      </header>

      <section className="word-stats" aria-label="Running totals">
        <div className="word-stats__cell">
          <span className="word-stats__label">Reviews analysed</span>
          <span className="word-stats__value">{stats.stats.reviewsAnalysed}</span>
        </div>
        <div className="word-stats__cell">
          <span className="word-stats__label">Words written</span>
          <span className="word-stats__value">
            {stats.stats.totalWords.toLocaleString("en-GB")}
          </span>
        </div>
        <div className="word-stats__cell">
          <span className="word-stats__label">Distinct words</span>
          <span className="word-stats__value">
            {stats.stats.uniqueMeaningfulWords.toLocaleString("en-GB")}
          </span>
        </div>
        <div className="word-stats__cell">
          <span className="word-stats__label">Most used</span>
          <span className="word-stats__value">
            {stats.stats.topWord ?? "—"}
            {stats.stats.topWord && (
              <span className="word-stats__aside"> ×{stats.stats.topWordCount}</span>
            )}
          </span>
        </div>
        <div className="word-stats__cell">
          <span className="word-stats__label">Most mentioned</span>
          <span className="word-stats__value">
            {stats.stats.topCharacter ?? "—"}
            {stats.stats.topCharacter && (
              <span className="word-stats__aside">
                {" "}
                ×{stats.stats.topCharacterCount}
              </span>
            )}
          </span>
        </div>
      </section>

      <div className="word-controls">
        <div className="word-controls__group" role="group" aria-label="View">
          <span className="word-controls__legend">View</span>
          <div className="word-controls__buttons">
            <button
              type="button"
              className="word-chip"
              aria-pressed={mode === "words"}
              onClick={() => {
                setMode("words");
                setSelected(null);
              }}
            >
              Words
            </button>
            <button
              type="button"
              className="word-chip"
              aria-pressed={mode === "characters"}
              onClick={() => {
                setMode("characters");
                setSelected(null);
              }}
            >
              Characters
            </button>
          </div>
        </div>

        <div className="word-controls__group" role="group" aria-label="Series">
          <span className="word-controls__legend">Series</span>
          <div className="word-controls__buttons">
            <button
              type="button"
              className="word-chip"
              aria-pressed={series === null}
              onClick={() => {
                setSeries(null);
                setSelected(null);
              }}
            >
              All reviews
            </button>
            {seriesWithReviews.map((s) => (
              <button
                key={s}
                type="button"
                className="word-chip"
                data-series={s}
                aria-pressed={series === s}
                onClick={() => {
                  setSeries(s);
                  setSelected(null);
                }}
              >
                Series {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {cloudEntries.length === 0 ? (
        <p className="empty-note">
          Nothing to count yet. The map fills in as reviews are published.
        </p>
      ) : (
        <>
          <div
            className="word-cloud"
            data-series={series ?? undefined}
            aria-label={`Most frequent ${noun}s${series ? ` in Series ${series}` : ""}`}
          >
            {cloudEntries.map((entry) => (
              <button
                key={entry.word}
                type="button"
                className="word-cloud__word"
                data-tier={weightTier(entry.count, maxCount, minCount)}
                aria-pressed={selected === entry.word}
                title={`${entry.word} — ${mentionSummary(entry)}`}
                onClick={() =>
                  setSelected(selected === entry.word ? null : entry.word)
                }
              >
                {entry.word}
              </button>
            ))}
          </div>

          <p className="word-cloud__hint">
            Size is frequency. Pick any {noun} to see which reviews it turns up in.
          </p>

          {selectedEntry && (
            <WordDetail
              entry={selectedEntry}
              reviews={stats.reviews}
              onClose={() => setSelected(null)}
            />
          )}

          <section className="word-heat" aria-labelledby="word-heat-heading">
            <h2 id="word-heat-heading">Across the series</h2>
            <p className="word-heat__intro">
              The same counts, laid out by series. Darker means the{" "}
              {noun} works harder in that run. Only series with reviews appear.
            </p>
            <div className="word-heat__scroll">
              <table className="word-heat__table">
                <caption className="sr-only">
                  Mentions of the most frequent {noun}s, by series
                </caption>
                <thead>
                  <tr>
                    <th scope="col">{mode === "characters" ? "Name" : "Word"}</th>
                    {heatColumns.map((s) => (
                      <th scope="col" key={s} data-series={s}>
                        S{s}
                      </th>
                    ))}
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {heatRows.map((row) => (
                    <tr key={row.word}>
                      <th scope="row">
                        <button
                          type="button"
                          className="word-heat__word"
                          onClick={() =>
                            setSelected(selected === row.word ? null : row.word)
                          }
                        >
                          {row.word}
                        </button>
                      </th>
                      {heatColumns.map((s) => {
                        const value = row.series[String(s)] ?? 0;
                        const intensity = value === 0 ? 0 : value / heatMax;
                        return (
                          <td
                            key={s}
                            data-series={s}
                            className="word-heat__cell"
                            style={
                              intensity > 0
                                ? {
                                    // Tinted with the series accent so each
                                    // column keeps its own hue. Floor of 12%
                                    // keeps a single mention visible.
                                    background: `color-mix(in srgb, var(--color-accent) ${(
                                      12 +
                                      intensity * 68
                                    ).toFixed(1)}%, transparent)`,
                                  }
                                : undefined
                            }
                          >
                            <span className="word-heat__value">
                              {value === 0 ? "—" : value}
                            </span>
                          </td>
                        );
                      })}
                      <td className="word-heat__total">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </article>
  );
}

function WordDetail({
  entry,
  reviews,
  onClose,
}: {
  entry: WordEntry;
  reviews: { slug: string; title: string; series: number; episode: number; episodeEnd?: number }[];
  onClose: () => void;
}) {
  // Busiest review first, so the panel opens on the most interesting line.
  const rows = [...entry.episodes].sort((a, b) =>
    b[1] === a[1] ? a[0] - b[0] : b[1] - a[1],
  );

  return (
    <aside className="word-detail" aria-live="polite">
      <div className="word-detail__head">
        <h3 className="word-detail__word">{entry.word}</h3>
        <button
          type="button"
          className="word-detail__close"
          onClick={onClose}
          aria-label={`Close details for ${entry.word}`}
        >
          ×
        </button>
      </div>
      <p className="word-detail__summary">{mentionSummary(entry)}</p>
      <ul className="word-detail__list">
        {rows.map(([index, count]) => {
          const review = reviews[index];
          if (!review) return null;
          return (
            <li key={review.slug}>
              <Link to={`/episodes/${review.slug}`}>
                <span className="word-detail__code">{episodeCode(review)}</span>{" "}
                {review.title}
              </Link>
              <span className="word-detail__count">{count}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
