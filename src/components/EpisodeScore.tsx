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
   * "/ 5". If that file is missing, falls back to the numeric form.
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
        aria-label={`Score ${display} out of 5`}
      >
        {display}
        <span className="score__denom"> / 5</span>
      </span>
    );
  }

  const bounded = Math.max(0, Math.min(5, score));
  const halved = Math.round(bounded * 2) / 2;
  const full = Math.floor(halved);
  const hasHalf = halved % 1 === 0.5;
  const iconSrc = `/images/score-icons/series-${series}-score-icon.jpg`;

  return (
    <span
      className={`score score--${size} score--icons`}
      aria-label={`Score ${display} out of 5`}
    >
      <span className="score__num">{display}</span>
      <span className="score__icons" aria-hidden="true">
        {Array.from({ length: full }).map((_, i) => (
          <img
            key={`f-${i}`}
            src={iconSrc}
            alt=""
            className="score__icon"
            onError={() => setIconFailed(true)}
          />
        ))}
        {hasHalf && (
          <span className="score__icon-half">
            <img
              src={iconSrc}
              alt=""
              className="score__icon"
              onError={() => setIconFailed(true)}
            />
          </span>
        )}
      </span>
      <span className="score__denom">/ 5</span>
    </span>
  );
}
