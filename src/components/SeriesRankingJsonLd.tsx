import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import type { RankingEntry } from "../lib/seriesOverviews";

const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? "https://thedivvy.example.com"
).replace(/\/$/, "");

/**
 * ItemList structured data for a series ranking. Position 1 is the best
 * episode, so the list is ordered descending by merit.
 *
 * Renders nothing when the overview has no `ranking` in its frontmatter —
 * an overview essay without a ranked list is perfectly valid.
 */
export default function SeriesRankingJsonLd({
  series,
  name,
  ranking,
}: {
  series: number;
  name: string;
  ranking: RankingEntry[];
}) {
  const { pathname } = useLocation();
  if (ranking.length === 0) return null;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}${pathname}#ranking`,
    name,
    description: `Every episode of Lovejoy Series ${series}, ranked best to worst by The Divvy.`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: ranking.length,
    itemListElement: ranking.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      url: `${SITE_URL}/episodes/${entry.slug}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(itemList)}</script>
    </Helmet>
  );
}
