import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MDXProvider } from "@mdx-js/react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { mdxComponents } from "./components/mdxComponents";
import "./styles/global.css";

declare global {
  interface Window {
    __APP_HYDRATED__?: boolean;
  }
}

const container = document.getElementById("root")!;
const tree = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <MDXProvider components={mdxComponents}>
          <App />
        </MDXProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// Hydrate if the build-time prerender produced existing markup; otherwise
// fall back to a fresh client render (dev server, first-load of an
// unprerendered route).
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, tree);
} else {
  ReactDOM.createRoot(container).render(tree);
}

// Signal to the prerender script (scripts/prerender.mjs) that React has
// finished its initial render, so puppeteer can capture stable HTML.
requestAnimationFrame(() => {
  window.__APP_HYDRATED__ = true;
});
