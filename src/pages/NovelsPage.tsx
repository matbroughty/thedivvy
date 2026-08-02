import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { getEpisodeBySlug } from "../lib/episodes";
import { episodeCode } from "../lib/episodeLabel";
import novelData from "../data/gash-novels.json";

type Status = "adapted" | "probable" | "none";

interface Novel {
  order: number;
  title: string;
  altTitle?: string;
  year: number;
  status: string;
  episodeSlug?: string;
  note?: string;
  source?: string;
}

const STATUS_LABEL: Record<Status, string> = {
  adapted: "Adapted",
  probable: "Probable",
  none: "No known adaptation",
};

const novels = novelData.novels as Novel[];

export default function NovelsPage() {
  const mapped = novels.filter((n) => n.status !== "none");
  const adaptedCount = novels.filter((n) => n.status === "adapted").length;
  const probableCount = novels.filter((n) => n.status === "probable").length;

  return (
    <article className="article">
      <Seo
        title="Jonathan Gash's Lovejoy novels — which ones the BBC actually adapted"
        description="All 24 Jonathan Gash Lovejoy novels in publication order, mapped to the television episodes that adapted them — with an honest note on how little of that mapping is actually documented."
      />
      <header className="article__head">
        <div className="article__eyebrow">The books</div>
        <h1 className="article__title">Gash on screen</h1>
        <p className="article__summary">
          Jonathan Gash wrote twenty-four Lovejoy novels between 1977 and 2008.
          The BBC made seventy-one episodes. Working out which of the second
          came from the first is harder than it sounds.
        </p>
        <p className="article__note">
          <strong>A warning about this page.</strong> The bibliography below is
          solid. The mapping is not. The BBC never credited source novels on
          screen, and neither IMDb nor TMDB records a "novel" writing credit for
          a single episode — every writing credit goes to the screenwriters,
          with Gash acknowledged only for the characters. So attributions here
          are marked <em>Adapted</em> when a published source says so and{" "}
          <em>Probable</em> when the correspondence is strong but nobody has
          written it down. Corrections very welcome.
        </p>
      </header>

      <div className="article__body">
        <p>
          As it stands: <strong>{adaptedCount} adapted</strong>,{" "}
          <strong>{probableCount} probable</strong>, and{" "}
          <strong>{novels.length - mapped.length}</strong> with no known
          television version at all. Every one of those mappings falls in Series
          One. From Series Two onwards the show ran on original scripts, which
          is why the television Lovejoy is so much jollier than the one on the
          page — the books stopped being the source and became the seed.
        </p>

        <h2>The mapping</h2>
        <div className="table-scroll">
          <table className="novels-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Novel</th>
                <th>Published</th>
                <th>Episode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {novels.map((novel) => {
                const status = novel.status as Status;
                const episode = novel.episodeSlug
                  ? getEpisodeBySlug(novel.episodeSlug)
                  : undefined;
                return (
                  <tr key={novel.order} data-status={status}>
                    <td className="novels-table__num">{novel.order}</td>
                    <td>
                      <em>{novel.title}</em>
                      {novel.altTitle && (
                        <span className="novels-table__alt">
                          {" "}
                          (US: <em>{novel.altTitle}</em>)
                        </span>
                      )}
                      {novel.note && (
                        <div className="novels-table__note">{novel.note}</div>
                      )}
                    </td>
                    <td>{novel.year}</td>
                    <td>
                      {episode ? (
                        <Link to={`/episodes/${episode.frontmatter.slug}`}>
                          {episodeCode(episode.frontmatter, { pad: true })}
                          {" · "}
                          {episode.frontmatter.title}
                        </Link>
                      ) : (
                        <span className="novels-table__dash">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`novels-status novels-status--${status}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2>Why the gaps are the interesting part</h2>
        <p>
          Twenty of these novels never reached the screen — including{" "}
          <em>The Grail Tree</em>, which completes the opening trio, and{" "}
          <em>The Vatican Rip</em>, whose premise is exactly the sort of thing
          the series would have relished. The reason is chronology as much as
          choice: by the time the show hit its stride in the nineties, Gash was
          still publishing, and the production had long since found it easier to
          invent than adapt.
        </p>
        <p>
          If you have a citable source for any attribution here — a DVD sleeve,
          a Radio Times listing, a contemporary review — it would improve this
          page considerably.
        </p>
      </div>
    </article>
  );
}
