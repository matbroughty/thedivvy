import Seo from "../components/Seo";

interface ExternalLink {
  title: string;
  url: string;
  description: string;
}

interface LinkSection {
  title: string;
  links: ExternalLink[];
}

const linkSections: LinkSection[] = [
  {
    title: "Essential Lovejoy References",
    links: [
      {
        title: "IMDb – Lovejoy",
        url: "https://www.imdb.com/title/tt0090476/",
        description: "Episode guide and cast information",
      },
      {
        title: "Wikipedia – Lovejoy",
        url: "https://en.wikipedia.org/wiki/Lovejoy",
        description: "Series overview and background",
      },
      {
        title: "Jonathan Gash bibliography",
        url: "https://en.wikipedia.org/wiki/Jonathan_Gash",
        description: "The original Lovejoy novels",
      },
      {
        title: "Lovejoy Adventures blog",
        url: "https://lovejoyadventures530629135.wordpress.com/",
        description: "Fan-run Lovejoy blog and resources",
      },
      {
        title: "Lovejoy Actually podcast",
        url: "https://www.lovejoyactually.com",
        description: "Episode-by-episode podcast discussion",
      },
    ],
  },
  {
    title: "Watching Lovejoy",
    links: [
      {
        title: "JustWatch UK – Lovejoy",
        url: "https://www.justwatch.com/uk/tv-series/lovejoy",
        description: "Streaming availability checker",
      },
      {
        title: "Amazon UK – Lovejoy DVDs",
        url: "https://www.amazon.co.uk/s?k=lovejoy+dvd",
        description: "DVD box sets and series collections",
      },
    ],
  },
  {
    title: "Antiques and Auction Background",
    links: [
      {
        title: "Antiques Trade Gazette",
        url: "https://www.antiquestradegazette.com/",
        description: "Industry news and auction reports",
      },
      {
        title: "BBC Antiques Roadshow",
        url: "https://www.bbc.co.uk/programmes/b006mj2y",
        description: "The real-world antiques valuation programme",
      },
      {
        title: "The Saleroom",
        url: "https://www.the-saleroom.com/",
        description: "Live auction listings and catalogues",
      },
    ],
  },
  {
    title: "Cast and Creator Links",
    links: [
      {
        title: "Ian McShane",
        url: "https://www.imdb.com/name/nm0574534/",
        description: "Lovejoy himself",
      },
      {
        title: "Chris Jury",
        url: "https://www.imdb.com/name/nm0432939/",
        description: "Eric Catchpole",
      },
      {
        title: "Phyllis Logan",
        url: "https://www.imdb.com/name/nm0517643/",
        description: "Lady Jane Felsham",
      },
    ],
  },
  {
    title: "The Divvy Socials",
    links: [
      {
        title: "The InstaDivvy",
        url: "https://www.instagram.com/theinstadivvy/",
        description: "Follow along on Instagram",
      },
    ],
  },
];

export default function ExternalLinksPage() {
  return (
    <div className="page page--narrow">
      <Seo
        title="Lovejoy links — external resources"
        description="Curated Lovejoy links, episode references, cast information, watching guides, antiques resources, blogs and podcasts."
      />

      <h1>External Links</h1>
      <p className="hero__summary" style={{ marginBottom: "2.5rem" }}>
        A curated set of Lovejoy-related links: episode references, cast
        information, places to watch, antiques background reading, podcasts,
        blogs, and The Divvy's own social channels.
      </p>

      {linkSections.map((section) => (
        <section key={section.title} className="section">
          <div className="section__head">
            <h2>{section.title}</h2>
          </div>
          <div className="external-links">
            {section.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
              >
                <div className="external-link__header">
                  <span className="external-link__title">{link.title}</span>
                  <svg
                    className="external-link__icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </div>
                <p className="external-link__description">{link.description}</p>
              </a>
            ))}
          </div>
        </section>
      ))}

      <p className="overview-footnote">
        Have a suggestion for this page?{" "}
        <a href="mailto:mat@broughty.com">Drop us a line</a>.
      </p>
    </div>
  );
}
