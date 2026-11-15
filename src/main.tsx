import React, { useEffect } from "react";
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

function PrerenderReady() {
  useEffect(() => {
    window.__APP_HYDRATED__ = true;
  }, []);
  return null;
}

const container = document.getElementById("root")!;
const tree = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <MDXProvider components={mdxComponents}>
          <App />
          <PrerenderReady />
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
