import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <Header />
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <p>
          The Divvy &middot; weekly Lovejoy reviews &middot; no antiques were
          harmed in the making of this site
        </p>
        <p className="site-footer__by">
          Written by <Link to="/about">Mat</Link> &middot;{" "}
          <a href="mailto:mat@broughty.com">mat@broughty.com</a> &middot;{" "}
          <a
            href="https://www.instagram.com/theinstadivvy"
            target="_blank"
            rel="noopener noreferrer"
          >
            @theinstadivvy
          </a>{" "}
          &middot; <Link to="/links">Links</Link>
        </p>
      </footer>
    </div>
  );
}
