import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import type { EpisodeFrontmatter } from "../types";

const SITE_NAME = "The Divvy";
const AUTHOR_NAME = "Mat Broughton";
const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? "https://thedivvy.example.com"
).replace(/\/$/, "");

export default function EpisodeJsonLd({
  frontmatter,
}: {
  frontmatter: EpisodeFrontmatter;
}) {
  const { pathname } = useLocation();
  const url = `${SITE_URL}${pathname}`;
  const imgAbs = frontmatter.image
    ? frontmatter.image.startsWith("http")
      ? frontmatter.image
      : `${SITE_URL}${frontmatter.image}`
    : undefined;

  const reviewName = `${frontmatter.title} — Lovejoy S${frontmatter.series}E${frontmatter.episode} review`;

  const review = {
    "@context": "https://schema.org",
    "@type": "Review",
    "@id": `${url}#review`,
    url,
    name: reviewName,
    headline: reviewName,
    reviewBody: frontmatter.summary,
    ...(imgAbs && { image: imgAbs }),
    ...(frontmatter.reviewDate && { datePublished: frontmatter.reviewDate }),
    author: { "@type": "Person", name: AUTHOR_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    reviewRating: {
      "@type": "Rating",
      ratingValue: frontmatter.score,
      bestRating: 5,
      worstRating: 0,
    },
    itemReviewed: {
      "@type": "TVEpisode",
      name: frontmatter.title,
      episodeNumber: frontmatter.episode,
      ...(frontmatter.airDate && { datePublished: frontmatter.airDate }),
      ...(imgAbs && { image: imgAbs }),
      partOfSeason: {
        "@type": "TVSeason",
        seasonNumber: frontmatter.series,
        partOfSeries: { "@type": "TVSeries", name: "Lovejoy" },
      },
      partOfSeries: { "@type": "TVSeries", name: "Lovejoy" },
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: `Series ${frontmatter.series}`,
        item: `${SITE_URL}/series/${frontmatter.series}`,
      },
      { "@type": "ListItem", position: 3, name: frontmatter.title, item: url },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(review)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
    </Helmet>
  );
}
