import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand">
          <span className="brand__the">The</span>Divvy
        </Link>
        <nav className="nav" aria-label="Primary">
          <NavLink to="/series" end>
            Series
          </NavLink>
          <NavLink to="/archive">Archive</NavLink>
          <NavLink to="/lovejoy-overview">Overview</NavLink>
          <NavLink to="/about">About</NavLink>
          <a
            href="https://www.instagram.com/theinstadivvy"
            target="_blank"
            rel="noopener noreferrer"
            className="nav__instagram"
            aria-label="Follow The Divvy on Instagram"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </nav>
      </div>
      <p className="site-header__tagline">
        The Divvy is a weekly review of every episode of Lovejoy — the BBC's
        finest third wall breaking antiques-dealer
      </p>
    </header>
  );
}
