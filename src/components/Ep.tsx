import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { getEpisodeBySlug } from "../lib/episodes";

interface EpProps {
  slug: string;
  children: ReactNode;
}

// Cross-reference to another episode review. If the target review is
// published, renders as a Link; if not, renders the children as plain text
// (no dead link, no 404). Lets reviews name-drop future episodes today and
// have those mentions auto-light-up the moment the target review is
// published.
export default function Ep({ slug, children }: EpProps) {
  const episode = getEpisodeBySlug(slug);
  if (!episode) return <>{children}</>;
  return <Link to={`/episodes/${slug}`}>{children}</Link>;
}
