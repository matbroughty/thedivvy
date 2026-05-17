import { useState } from "react";
import type { EpisodeFrontmatter } from "../types";

export default function EpisodeImage({
  frontmatter,
}: {
  frontmatter: EpisodeFrontmatter;
}) {
  const { image, imageAlt, imageSourceUrl, title } = frontmatter;
  const [failed, setFailed] = useState(false);

  if (!image || failed) return null;

  return (
    <figure className="episode-image">
      <img
        src={image}
        alt={imageAlt ?? `Still from ${title}`}
        loading="lazy"
        onError={() => {
          // File is missing or failed to load — hide the figure entirely so
          // the page doesn't show a broken-image icon. Helpful when an
          // episode declares an image path before the file has been added.
          if (import.meta.env.DEV) {
            console.warn(
              `[EpisodeImage] could not load "${image}" — drop a file at "public${image}".`,
            );
          }
          setFailed(true);
        }}
      />
      {imageSourceUrl && (
        <figcaption className="episode-image__credit">
          Image via{" "}
          <a href={imageSourceUrl} target="_blank" rel="noopener noreferrer">
            IMDb
          </a>
        </figcaption>
      )}
    </figure>
  );
}
