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
        </nav>
      </div>
      <p className="site-header__tagline">
        The Divvy is a weekly review of every episode of Lovejoy — the BBC's
        finest third wall breaking antiques-dealer
      </p>
    </header>
  );
}
