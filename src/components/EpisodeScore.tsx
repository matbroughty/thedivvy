import { useState } from "react";

type Size = "sm" | "md" | "lg";

export default function EpisodeScore({
  score,
  size = "md",
  series,
}: {
  score: number;
  size?: Size;
  /**
   * When provided, render the score as N small round thumbnails of
   * `/images/score-icons/series-${series}-score-icon.jpg` followed by
   * "/ 10". If that file is missing, falls back to the numeric form.
   */
  series?: number;
}) {
  const [iconFailed, setIconFailed] = useState(false);
  const display = Number.isInteger(score) ? score.toString() : score.toFixed(1);

  const useIcons = series !== undefined && !iconFailed;

  if (!useIcons) {
    return (
      <span
        className={`score score--${size}`}
        aria-label={`Score ${display} out of 10`}
      >
        {display}
        <span className="score__denom"> / 10</span>
      </span>
    );
  }

  const count = Math.max(0, Math.min(10, Math.round(score)));
  const iconSrc = `/images/score-icons/series-${series}-score-icon.jpg`;

  return (
    <span
      className={`score score--${size} score--icons`}
      aria-label={`Score ${display} out of 10`}
    >
      <span className="score__num">{display}</span>
      <span className="score__icons" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <img
            key={i}
            src={iconSrc}
            alt=""
            className="score__icon"
            onError={() => setIconFailed(true)}
          />
        ))}
      </span>
      <span className="score__denom">/ 10</span>
    </span>
  );
}
