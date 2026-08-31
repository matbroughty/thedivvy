import { Helmet } from "react-helmet-async";

/**
 * Site-level structured data. Rendered once, on the homepage only.
 *
 * Episode pages already emit Review + TVEpisode + BreadcrumbList, but nothing
 * told search engines what the *site* is about, or which Lovejoy it is about.
 * That second part matters: since 2021 the better-known Lovejoy is an indie
 * band, so the `sameAs` links to Wikipedia and IMDb are doing the real work
 * here — they tie the site to a specific entity rather than a name.
 *
 * Only facts that are safely checkable go in. Episode counts per series are
 * deliberately omitted; `numberOfSeasons` is the one aggregate worth stating.
 */

const SITE_NAME = "The Divvy";
const AUTHOR_NAME = "Mat Broughton";
const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? "https://thedivvy.example.com"
).replace(/\/$/, "");

const DESCRIPTION =
  "Episode-by-episode reviews of Lovejoy, the BBC antiques drama starring Ian McShane, first broadcast 1986 to 1994.";

export default function SiteJsonLd() {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: DESCRIPTION,
    inLanguage: "en-GB",
    author: { "@type": "Person", name: AUTHOR_NAME },
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: { "@id": `${SITE_URL}/#lovejoy` },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
  };

  const series = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "@id": `${SITE_URL}/#lovejoy`,
    name: "Lovejoy",
    description:
      "British comedy-drama about a roguish East Anglian antiques dealer with an eye for a fake, adapted from the novels of Jonathan Gash.",
    genre: ["Comedy-drama", "Mystery"],
    numberOfSeasons: 6,
    startDate: "1986",
    endDate: "1994",
    inLanguage: "en-GB",
    countryOfOrigin: { "@type": "Country", name: "United Kingdom" },
    productionCompany: { "@type": "Organization", name: "BBC" },
    actor: [
      { "@type": "Person", name: "Ian McShane" },
      { "@type": "Person", name: "Dudley Sutton" },
      { "@type": "Person", name: "Chris Jury" },
      { "@type": "Person", name: "Phyllis Logan" },
      { "@type": "Person", name: "Malcolm Tierney" },
    ],
    // Entity disambiguation. Without these, "Lovejoy" is ambiguous.
    sameAs: [
      "https://en.wikipedia.org/wiki/Lovejoy_(TV_series)",
      "https://www.imdb.com/title/tt0090477/",
    ],
    subjectOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(website)}</script>
      <script type="application/ld+json">{JSON.stringify(organization)}</script>
      <script type="application/ld+json">{JSON.stringify(series)}</script>
    </Helmet>
  );
}
