import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { getAllEpisodes } from "../lib/episodes";
import type { Episode, Soundtrack } from "../types";

/**
 * Paste the Spotify playlist share link here once you've created the
 * playlist in your account. Leave as "" to hide the embedded player.
 * The share URL looks like:
 *   https://open.spotify.com/playlist/{id}
 * The embed automatically substitutes /embed/playlist/.
 */
const SPOTIFY_PLAYLIST_URL =
  "https://open.spotify.com/playlist/1Qznr0SmiyK3FsY0Kg9NEd";

interface Entry {
  episode: Episode;
  soundtrack: Soundtrack;
}

function embedUrl(shareUrl: string): string | null {
  const m = shareUrl.match(/open\.spotify\.com\/playlist\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/playlist/${m[1]}` : null;
}

export default function SoundtrackPage() {
  const entries: Entry[] = getAllEpisodes()
    .filter((ep): ep is Episode & { frontmatter: { soundtrack: Soundtrack } } =>
      Boolean(ep.frontmatter.soundtrack),
    )
    .map((ep) => ({ episode: ep, soundtrack: ep.frontmatter.soundtrack! }));

  const bySeries = new Map<number, Entry[]>();
  for (const e of entries) {
    const s = e.episode.frontmatter.series;
    if (!bySeries.has(s)) bySeries.set(s, []);
    bySeries.get(s)!.push(e);
  }
  const seriesNumbers = [...bySeries.keys()].sort((a, b) => a - b);

  const embed = SPOTIFY_PLAYLIST_URL ? embedUrl(SPOTIFY_PLAYLIST_URL) : null;

  return (
    <article className="article">
      <Seo
        title="The Divvy soundtrack — songs heard in every Lovejoy episode"
        description="A song from every episode of Lovejoy, curated as a Spotify playlist and cross-referenced back to each episode review on The Divvy."
      />
      <header className="article__head">
        <div className="article__eyebrow">Heard in the episode</div>
        <h1 className="article__title">The Divvy soundtrack</h1>
        <p className="article__summary">
          One song from every episode of <em>Lovejoy</em> we've reviewed so far.
          Each entry links back to the review it came from. If a Spotify link
          is set, the track name is clickable.
        </p>
      </header>

      {embed && (
        <div className="soundtrack-embed">
          <iframe
            src={embed}
            width="100%"
            height="360"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="The Divvy soundtrack playlist"
          />
        </div>
      )}

      <div className="article__body">
        {entries.length === 0 ? (
          <p className="empty-note">
            No tracks yet — as episode reviews go live, songs picked out of
            each one will land here.
          </p>
        ) : (
          seriesNumbers.map((s) => (
            <section key={s} className="soundtrack-series">
              <h2>Series {s}</h2>
              <ol className="soundtrack-list">
                {bySeries.get(s)!.map(({ episode, soundtrack }) => {
                  const { title, artist, spotifyUrl } = soundtrack;
                  const label = spotifyUrl ? (
                    <a
                      href={spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="soundtrack__title-link"
                    >
                      {title}
                    </a>
                  ) : (
                    <span>{title}</span>
                  );
                  return (
                    <li key={episode.frontmatter.slug}>
                      <div className="soundtrack-list__track">
                        {label} <span className="soundtrack__artist">– {artist}</span>
                      </div>
                      <div className="soundtrack-list__episode">
                        <Link to={`/episodes/${episode.frontmatter.slug}`}>
                          S{episode.frontmatter.series}E
                          {String(episode.frontmatter.episode).padStart(2, "0")}
                          {" · "}
                          {episode.frontmatter.title}
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))
        )}
      </div>
    </article>
  );
}
