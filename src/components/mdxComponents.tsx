import type { MDXComponents } from "mdx/types";

// Light overrides for elements that come out of MDX. Most styling lives in
// global.css and applies via the `.article__body` ancestor — we only override
// here when we want a tag to render as something different, or want a
// component to be available unprefixed inside MDX.
export const mdxComponents: MDXComponents = {};
