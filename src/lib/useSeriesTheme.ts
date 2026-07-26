import { useEffect } from "react";

/**
 * Mirrors data-series onto <html> so the per-series CSS variables — including
 * the subtle page-background tint — apply to the whole viewport (header and
 * footer included), not just the article body. Prerender captures the
 * attribute in the static HTML, so themed pages load with no colour flash.
 */
export function useSeriesTheme(series: number | undefined): void {
  useEffect(() => {
    if (!series) return;
    document.documentElement.dataset.series = String(series);
    return () => {
      delete document.documentElement.dataset.series;
    };
  }, [series]);
}
