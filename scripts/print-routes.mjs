// Debug helper: print the canonical site route list to stdout.
// Useful for sanity-checking that the prerender script will cover every route.
//
// Usage: `npm run routes`  (or `node scripts/print-routes.mjs`)

import { getAllRoutes } from "./lib/routes.mjs";

const routes = await getAllRoutes();
for (const route of routes) {
  console.log(route);
}
console.error(`[print-routes] ${routes.length} routes`);
