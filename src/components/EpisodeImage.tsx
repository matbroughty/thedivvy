import { useState } from "react";
import type { EpisodeFrontmatter } from "../types";

interface ImageData {
  src: string;
  alt: string;
  sourceUrl?: string;
}

export default function EpisodeImage({
  frontmatter,
}: {
  frontmatter: EpisodeFrontmatter;
}) {
  const { image, imageAlt, imageSourceUrl, image2, imageAlt2, imageSourceUrl2, image3, imageAlt3, imageSourceUrl3, title } = frontmatter;
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Collect all available images
  const images: ImageData[] = [];
  if (image) {
    images.push({ src: image, alt: imageAlt ?? `Still from ${title}`, sourceUrl: imageSourceUrl });
  }
  if (image2) {
    images.push({ src: image2, alt: imageAlt2 ?? `Still from ${title}`, sourceUrl: imageSourceUrl2 });
  }
  if (image3) {
    images.push({ src: image3, alt: imageAlt3 ?? `Still from ${title}`, sourceUrl: imageSourceUrl3 });
  }

  // Filter out failed images
  const validImages = images.filter(img => !failedImages.has(img.src));

  if (validImages.length === 0) return null;

  const handleImageError = (src: string) => {
    if (import.meta.env.DEV) {
      console.warn(
        `[EpisodeImage] could not load "${src}" — drop a file at "public${src}".`,
      );
    }
    setFailedImages(prev => new Set(prev).add(src));
  };

  return (
    <div className="episode-images">
      {validImages.map((img) => (
        <figure key={img.src} className="episode-image">
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            onError={() => handleImageError(img.src)}
          />
          {img.sourceUrl && (
            <figcaption className="episode-image__credit">
              Image via{" "}
              <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer">
                IMDb
              </a>
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
