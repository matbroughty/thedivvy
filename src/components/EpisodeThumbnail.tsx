import { useState } from "react";
import { Link } from "react-router-dom";
import type { EpisodeFrontmatter } from "../types";

// A small clickable thumbnail used in lists/heroes. No image attribution
// (that belongs on the article page). Hides itself if the file fails to
// load so the card layout stays clean.
export default function EpisodeThumbnail({
  frontmatter,
  className,
}: {
  frontmatter: EpisodeFrontmatter;
  className?: string;
}) {
  const { image, imageAlt, title, slug } = frontmatter;
  const [failed, setFailed] = useState(false);

  if (!image || failed) return null;

  return (
    <Link
      to={`/episodes/${slug}`}
      className={`episode-thumb${className ? " " + className : ""}`}
      aria-label={`Read review of ${title}`}
    >
      <img
        src={image}
        alt={imageAlt ?? `Still from ${title}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </Link>
  );
}
