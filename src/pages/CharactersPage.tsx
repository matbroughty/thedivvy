import Seo from "../components/Seo";
import charactersData from "../data/lovejoy-characters.json";

interface CharacterEpisode {
  season: number;
  episode: number;
  title: string;
  tconst: string;
}

interface Character {
  character: string;
  actor: string;
  nconst: string;
  episodeCount: number;
  seriesAppearances: number[];
  episodes: CharacterEpisode[];
}

interface CharactersData {
  source: string;
  generatedAt: string;
  totalEpisodes: number;
  recurringCharacterCount: number;
  characters: Character[];
}

const data = charactersData as CharactersData;

function formatSeriesRange(series: number[]): string {
  if (series.length === 0) return "—";
  if (series.length === 6) return "all six series";
  if (series.length === 1) return `series ${series[0]}`;
  return `series ${series.join(", ")}`;
}

function formattedGeneratedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CharactersPage() {
  return (
    <article className="article">
      <Seo
        title="Lovejoy recurring characters and cast"
        description="Every recurring character in Lovejoy, ranked by episode count. Ian McShane, Dudley Sutton (Tinker), Chris Jury (Eric), Phyllis Logan (Lady Jane), Malcolm Tierney (Charlie Gimbert), and 25 more — with the actors who played them and the episodes they appeared in."
      />
      <header className="article__head">
        <div className="article__eyebrow">The cast</div>
        <h1 className="article__title">Recurring characters</h1>
        <p className="article__summary">
          Every character who turns up in two or more episodes of{" "}
          <em>Lovejoy</em>, ranked by appearance count. Click a row to see
          the specific episodes each one appears in.
        </p>
      </header>

      <div className="article__body">
        <ol className="character-list">
          {data.characters.map((c, i) => (
            <li key={`${c.nconst}-${c.character}`}>
              <details className="character">
                <summary className="character__summary">
                  <span className="character__rank" aria-hidden>
                    {i + 1}
                  </span>
                  <span className="character__main">
                    <span className="character__name">{c.character}</span>
                    <span className="character__actor">{c.actor}</span>
                  </span>
                  <span className="character__stats">
                    <span className="character__count">
                      {c.episodeCount} ep{c.episodeCount === 1 ? "" : "s"}
                    </span>
                    <span className="character__series">
                      {formatSeriesRange(c.seriesAppearances)}
                    </span>
                  </span>
                </summary>
                <ol className="character__episodes">
                  {c.episodes.map((ep) => (
                    <li key={ep.tconst}>
                      <span className="character__episode-id">
                        S{ep.season}E{String(ep.episode).padStart(2, "0")}
                      </span>
                      <span className="character__episode-title">
                        {ep.title}
                      </span>
                    </li>
                  ))}
                </ol>
              </details>
            </li>
          ))}
        </ol>

        <p className="character-list__note">
          <em>
            Cast and episode data extracted from IMDb's public non-commercial
            datasets ({data.totalEpisodes} episodes — IMDb counts a two-part
            special separately, so its total is one higher than the BBC's
            official 71). Generated {formattedGeneratedDate(data.generatedAt)}.
            Rebuild with <code>npm run build:characters</code>.
          </em>
        </p>
      </div>
    </article>
  );
}
