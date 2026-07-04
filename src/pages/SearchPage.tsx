import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type MiniSearchType from "minisearch";
import type { SearchResult } from "minisearch";
import Seo from "../components/Seo";

interface Doc {
  slug: string;
  title: string;
  series: number;
  episode: number;
  summary: string;
  divvyMoment: string;
  guestStar: string;
  body: string;
}

type Hit = SearchResult & Doc;

type IndexState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; index: MiniSearchType<Doc>; docs: Map<string, Doc> }
  | { status: "error"; message: string };

const SEARCH_FIELDS = [
  "title",
  "body",
  "summary",
  "divvyMoment",
  "guestStar",
] as const;

const STORE_FIELDS = [
  "slug",
  "title",
  "series",
  "episode",
  "summary",
  "divvyMoment",
  "guestStar",
  "body",
] as const;

async function buildIndex(): Promise<{
  index: MiniSearchType<Doc>;
  docs: Map<string, Doc>;
}> {
  const [{ default: MiniSearch }, response] = await Promise.all([
    import("minisearch"),
    fetch("/search-index.json"),
  ]);
  if (!response.ok) {
    throw new Error(`Failed to load search index (${response.status})`);
  }
  const raw = (await response.json()) as Doc[];
  const index = new MiniSearch<Doc>({
    idField: "slug",
    fields: [...SEARCH_FIELDS],
    storeFields: [...STORE_FIELDS],
    searchOptions: {
      boost: { title: 4, divvyMoment: 3, summary: 2, guestStar: 2, body: 1 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: "AND",
    },
  });
  index.addAll(raw);
  const docs = new Map(raw.map((d) => [d.slug, d]));
  return { index, docs };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeSnippet(body: string, terms: string[]): { html: string } {
  if (!body) return { html: "" };
  const clean = terms.filter(Boolean).map(escapeRegex);
  if (clean.length === 0) {
    return { html: escapeHtml(body.slice(0, 220)) + (body.length > 220 ? "…" : "") };
  }
  const finder = new RegExp(`(${clean.join("|")})`, "i");
  const match = body.match(finder);
  const idx = match?.index ?? 0;
  const start = Math.max(0, idx - 100);
  const end = Math.min(body.length, idx + 180);
  let excerpt = body.slice(start, end);
  if (start > 0) excerpt = "…" + excerpt;
  if (end < body.length) excerpt = excerpt + "…";
  const highlighter = new RegExp(`(${clean.join("|")})`, "ig");
  const html = escapeHtml(excerpt).replace(
    highlighter,
    (m) => `<mark>${m}</mark>`,
  );
  return { html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [state, setState] = useState<IndexState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Kick off index load the first time the user has a non-empty query.
  useEffect(() => {
    if (query.trim().length === 0) return;
    if (state.status !== "idle") return;
    setState({ status: "loading" });
    buildIndex()
      .then(({ index, docs }) =>
        setState({ status: "ready", index, docs }),
      )
      .catch((err: unknown) =>
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Search unavailable",
        }),
      );
  }, [query, state.status]);

  // Reflect the query in the URL (?q=...) — replace, not push, so back button
  // still returns to wherever the user came from.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (current === query) return;
    const next = new URLSearchParams(params);
    if (query.trim()) next.set("q", query);
    else next.delete("q");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const results: Hit[] = useMemo(() => {
    if (state.status !== "ready") return [];
    if (query.trim().length === 0) return [];
    return state.index.search(query) as Hit[];
  }, [query, state]);

  const trimmed = query.trim();

  return (
    <article className="page page--narrow">
      <Seo
        title="Search The Divvy"
        description="Full-text search across every Lovejoy episode review on The Divvy."
      />
      <header className="article__head">
        <div className="article__eyebrow">Search</div>
        <h1 className="article__title">Search the reviews</h1>
        <p className="article__summary">
          Full-text across every review — episode titles, guest stars, quoted
          Divvy moments and the prose itself.
        </p>
      </header>

      <div className="search-box">
        <label htmlFor="search-input" className="sr-only">
          Search The Divvy
        </label>
        <input
          id="search-input"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “Tinker”, “Roman coins”, “Sgt Drabble”…"
          autoComplete="off"
          spellCheck={false}
          className="search-input"
        />
      </div>

      <div className="search-results">
        {state.status === "loading" && (
          <p className="empty-note">Loading the index…</p>
        )}
        {state.status === "error" && (
          <p className="empty-note">Search unavailable: {state.message}</p>
        )}
        {trimmed.length === 0 && state.status !== "loading" && (
          <p className="empty-note">
            Type a term above. Matches are ranked by title, then by the
            headline Divvy moment, then by the body of the review.
          </p>
        )}
        {state.status === "ready" && trimmed.length > 0 && results.length === 0 && (
          <p className="empty-note">
            No matches for <em>{trimmed}</em>.
          </p>
        )}
        {results.length > 0 && (
          <>
            <p className="search-results__count">
              {results.length} {results.length === 1 ? "match" : "matches"}
            </p>
            <ol className="search-results__list">
              {results.map((r) => {
                const snippet = makeSnippet(r.body, r.terms);
                return (
                  <li key={r.slug} className="search-result">
                    <Link
                      to={`/episodes/${r.slug}`}
                      className="search-result__link"
                    >
                      <div className="search-result__eyebrow">
                        S{r.series}E
                        {String(r.episode).padStart(2, "0")}
                      </div>
                      <h2 className="search-result__title">{r.title}</h2>
                      {snippet.html && (
                        <p
                          className="search-result__snippet"
                          dangerouslySetInnerHTML={{ __html: snippet.html }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </article>
  );
}
