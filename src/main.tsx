import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MDXProvider } from "@mdx-js/react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { mdxComponents } from "./components/mdxComponents";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <MDXProvider components={mdxComponents}>
          <App />
        </MDXProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
