import { Link } from "react-router-dom";
import type { Soundtrack } from "../types";

export default function SoundtrackLine({
  soundtrack,
  variant = "full",
}: {
  soundtrack: Soundtrack;
  variant?: "full" | "subtle";
}) {
  const { title, artist, spotifyUrl, substitute, substituteNote } = soundtrack;

  const titleEl = spotifyUrl ? (
    <a
      href={spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="soundtrack__title-link"
    >
      {title}
    </a>
  ) : (
    <span className="soundtrack__title">{title}</span>
  );

  if (variant === "subtle") {
    return (
      <p className="soundtrack soundtrack--subtle">
        <span aria-hidden>🎵</span> {titleEl} –{" "}
        <span className="soundtrack__artist">{artist}</span>
        {substitute && <span className="soundtrack__standin"> stand-in</span>}
      </p>
    );
  }

  return (
    <p className="soundtrack soundtrack--full">
      <span className="soundtrack__label">
        <span aria-hidden>🎵</span>{" "}
        <strong>
          {substitute ? "No song in this episode" : "Heard in the episode"}
        </strong>
      </span>
      <span className="soundtrack__track">
        {titleEl} – <span className="soundtrack__artist">{artist}</span>
      </span>
      {substitute && (
        <span className="soundtrack__aside">
          {substituteNote ?? (
            <>
              Nothing worth picking out plays in this one, so we borrow from Ian
              McShane's own album <em>From Both Sides Now</em> instead
            </>
          )}{" "}
          — <Link to="/soundtrack">the house rule</Link>.
        </span>
      )}
    </p>
  );
}
