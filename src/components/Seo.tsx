import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_NAME = "The Divvy";
const DEFAULT_DESCRIPTION =
  "Weekly reviews of every episode of Lovejoy — the BBC's finest dodgy-antiques-dealer drama. Ian McShane, Tinker, Eric, Lady Jane, and a respectable amount of dodgy provenance.";
const DEFAULT_OG_IMAGE = "/og-default.jpg";

// Configure your production hostname in `.env.production` as
// `VITE_SITE_URL=https://yourdomain.com`. Falls back to a placeholder so
// the site still renders in dev without one set.
const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? "https://thedivvy.example.com"
).replace(/\/$/, "");

interface SeoProps {
  /** Page-specific title — appended as "{title} · The Divvy". Omit for the homepage. */
  title?: string;
  /** Plain-text description (1–2 sentences). Used for meta description and og:description. */
  description?: string;
  /** Path under /public, e.g. "/images/episodes/firefly-cage.jpg". Made absolute automatically. */
  image?: string;
  /** OG type — "article" for episode reviews, "website" for everything else. */
  type?: "website" | "article";
  /** Set to true on 404 / non-canonical pages. */
  noindex?: boolean;
}

export default function Seo({
  title,
  description,
  image,
  type = "website",
  noindex = false,
}: SeoProps) {
  const { pathname } = useLocation();
  const url = `${SITE_URL}${pathname}`;
  const fullTitle = title
    ? `${title} · ${SITE_NAME}`
    : `${SITE_NAME} — weekly Lovejoy episode reviews`;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const imgPath = image ?? DEFAULT_OG_IMAGE;
  const imgAbs = imgPath.startsWith("http") ? imgPath : `${SITE_URL}${imgPath}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imgAbs} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imgAbs} />
    </Helmet>
  );
}
