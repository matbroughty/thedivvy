import type { MDXComponents } from "mdx/types";

// Light overrides for elements that come out of MDX. Most styling lives in
// global.css and applies via the `.article__body` ancestor — we only override
// here when we want a tag to render as something different, or want a
// component to be available unprefixed inside MDX.

function SectionHeading({ children, ...props }: React.ComponentPropsWithoutRef<"h2">) {
  const text = typeof children === "string" ? children : "";

  // Determine icon based on heading text
  let icon: React.ReactNode = null;

  if (text.toLowerCase().includes("one wink plot")) {
    // Wink icon
    icon = (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <path d="M16 10c-.5-1-1.5-2-3-2"/>
      </svg>
    );
  } else if (text.toLowerCase().includes("review")) {
    // Magnifying glass icon
    icon = (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    );
  } else if (text.toLowerCase().includes("guest star") || text.toLowerCase().includes("divvy observation")) {
    // Star icon
    icon = (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    );
  }

  return (
    <h2 {...props} className="section-heading">
      {icon && <span className="section-heading__icon">{icon}</span>}
      {children}
    </h2>
  );
}

export const mdxComponents: MDXComponents = {
  h2: SectionHeading,
};
