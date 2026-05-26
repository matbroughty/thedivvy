// Build src/data/lovejoy-characters.json from IMDb's public datasets.
//
// One-off (re-runnable) data pipeline. Downloads four free IMDb dataset
// files, streams them, joins on tconst/nconst, and writes a sorted list
// of recurring characters with: actor name, character name, episode count,
// series numbers, and the full per-episode appearance list (with episode
// titles).
//
// Usage:
//   node scripts/build-characters-from-imdb.mjs
//
// On first run this downloads ~1 GB of compressed TSVs into .imdb-cache/.
// Subsequent runs reuse the cache for 7 days, then refetch.
//
// IMDb dataset reference: https://developer.imdb.com/non-commercial-datasets/
//   - title.episode.tsv.gz   season/episode numbers per episode tconst
//   - title.basics.tsv.gz    titles for every tconst (we filter to our episodes)
//   - title.principals.tsv.gz  cast/crew per episode (the big one, ~400 MB gz)
//   - name.basics.tsv.gz     actor names per nconst
//
// IMDb's terms permit personal / non-commercial use of these datasets.

import {
  createReadStream,
  createWriteStream,
  existsSync,
  statSync,
} from "node:fs";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import readline from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(ROOT, ".imdb-cache");
const OUTPUT = path.join(ROOT, "src", "data", "lovejoy-characters.json");
const LOVEJOY_TCONST = "tt0090477";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MIN_EPISODES_FOR_RECURRING = 2; // characters with 1 episode are guests

const DATASETS = {
  episode: "https://datasets.imdbws.com/title.episode.tsv.gz",
  basics: "https://datasets.imdbws.com/title.basics.tsv.gz",
  principals: "https://datasets.imdbws.com/title.principals.tsv.gz",
  names: "https://datasets.imdbws.com/name.basics.tsv.gz",
};

// ---------------------------------------------------------------- downloads

async function ensureCached(url, dest) {
  if (existsSync(dest)) {
    const age = Date.now() - statSync(dest).mtimeMs;
    if (age < CACHE_TTL_MS) {
      const mb = (statSync(dest).size / 1e6).toFixed(0);
      console.log(`[imdb] cache hit  ${path.basename(dest)} (${mb} MB)`);
      return;
    }
    console.log(`[imdb] cache stale ${path.basename(dest)} — refetching`);
  }
  console.log(`[imdb] download    ${url}`);
  const t0 = Date.now();
  const tmp = `${dest}.partial`;
  // Clean any stale partial from a prior failed run.
  try { await unlink(tmp); } catch {}
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    await pipeline(res.body, createWriteStream(tmp));
    await rename(tmp, dest); // atomic: cache file only exists on full success
  } catch (err) {
    try { await unlink(tmp); } catch {}
    throw err;
  }
  const mb = (statSync(dest).size / 1e6).toFixed(0);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[imdb]   -> ${path.basename(dest)} (${mb} MB in ${secs}s)`);
}

// ---------------------------------------------------------------- tsv streaming

async function* readTsvRows(file, label) {
  const rl = readline.createInterface({
    input: createReadStream(file).pipe(createGunzip()),
    crlfDelay: Infinity,
  });
  let n = 0;
  let lastLog = Date.now();
  let isFirst = true;
  for await (const line of rl) {
    if (isFirst) {
      isFirst = false;
      continue;
    }
    n++;
    if (Date.now() - lastLog > 5000) {
      console.log(`[imdb]   ${label}: ${n.toLocaleString()} rows scanned`);
      lastLog = Date.now();
    }
    yield line.split("\t");
  }
  console.log(`[imdb]   ${label}: ${n.toLocaleString()} rows total`);
}

// ---------------------------------------------------------------- main

async function main() {
  await mkdir(CACHE_DIR, { recursive: true });
  await mkdir(path.dirname(OUTPUT), { recursive: true });

  // 0. Download all four datasets (cached)
  const files = {};
  for (const [key, url] of Object.entries(DATASETS)) {
    const file = path.join(CACHE_DIR, path.basename(url));
    await ensureCached(url, file);
    files[key] = file;
  }

  // 1. Episodes for tt0090477 (season + episode numbers)
  console.log("[imdb] step 1/4 — episodes for", LOVEJOY_TCONST);
  /** @type {Map<string, {season:number, episode:number, title?:string}>} */
  const episodes = new Map();
  for await (const [tconst, parentTconst, seasonStr, episodeStr] of readTsvRows(
    files.episode,
    "title.episode",
  )) {
    if (parentTconst !== LOVEJOY_TCONST) continue;
    const season = Number.parseInt(seasonStr, 10);
    const episode = Number.parseInt(episodeStr, 10);
    if (!Number.isFinite(season) || !Number.isFinite(episode)) continue;
    episodes.set(tconst, { season, episode });
  }
  console.log(`[imdb]   matched ${episodes.size} Lovejoy episodes`);

  // 2. Episode titles from title.basics
  console.log("[imdb] step 2/4 — episode titles");
  let titleHits = 0;
  for await (const fields of readTsvRows(files.basics, "title.basics")) {
    const tconst = fields[0];
    const ep = episodes.get(tconst);
    if (!ep) continue;
    ep.title = fields[2]; // primaryTitle
    titleHits++;
  }
  console.log(`[imdb]   resolved ${titleHits} episode titles`);

  // 3. Cast per episode from title.principals
  console.log(
    "[imdb] step 3/4 — cast per episode (this is the big file, ~5 min)",
  );
  /** @type {Map<string, {nconst:string, character:string, episodeTconsts:Set<string>}>} */
  const characters = new Map();
  for await (const fields of readTsvRows(files.principals, "title.principals")) {
    // tconst, ordering, nconst, category, job, characters
    const [tconst, , nconst, category, , charactersStr] = fields;
    if (!episodes.has(tconst)) continue;
    if (category !== "actor" && category !== "actress" && category !== "self") {
      continue;
    }
    if (!charactersStr || charactersStr === "\\N") continue;
    let charList;
    try {
      charList = JSON.parse(charactersStr);
    } catch {
      continue;
    }
    if (!Array.isArray(charList) || charList.length === 0) continue;
    for (const character of charList) {
      const key = `${nconst}::${character}`;
      let entry = characters.get(key);
      if (!entry) {
        entry = { nconst, character, episodeTconsts: new Set() };
        characters.set(key, entry);
      }
      entry.episodeTconsts.add(tconst);
    }
  }
  console.log(
    `[imdb]   matched ${characters.size} (actor, character) pairs across Lovejoy`,
  );

  // 4. Actor names from name.basics
  console.log("[imdb] step 4/4 — actor names");
  const wantedNconsts = new Set();
  for (const c of characters.values()) wantedNconsts.add(c.nconst);
  /** @type {Map<string, string>} */
  const actorNames = new Map();
  for await (const fields of readTsvRows(files.names, "name.basics")) {
    const nconst = fields[0];
    if (!wantedNconsts.has(nconst)) continue;
    actorNames.set(nconst, fields[1]); // primaryName
    if (actorNames.size === wantedNconsts.size) break;
  }
  console.log(`[imdb]   resolved ${actorNames.size}/${wantedNconsts.size} actor names`);

  // ----- assemble + filter to recurring -----
  const all = [];
  for (const { nconst, character, episodeTconsts } of characters.values()) {
    const eps = [...episodeTconsts]
      .map((t) => ({ tconst: t, ...episodes.get(t) }))
      .sort((a, b) => a.season - b.season || a.episode - b.episode);
    const seriesAppearances = [...new Set(eps.map((e) => e.season))].sort(
      (a, b) => a - b,
    );
    all.push({
      character,
      actor: actorNames.get(nconst) ?? "(unknown)",
      nconst,
      episodeCount: eps.length,
      seriesAppearances,
      episodes: eps.map((e) => ({
        season: e.season,
        episode: e.episode,
        title: e.title ?? "(unknown)",
        tconst: e.tconst,
      })),
    });
  }

  const recurring = all
    .filter((r) => r.episodeCount >= MIN_EPISODES_FOR_RECURRING)
    .sort(
      (a, b) =>
        b.episodeCount - a.episodeCount ||
        a.character.localeCompare(b.character),
    );

  // ----- write output -----
  const output = {
    source: "IMDb non-commercial datasets",
    seriesTconst: LOVEJOY_TCONST,
    generatedAt: new Date().toISOString(),
    totalEpisodes: episodes.size,
    recurringCharacterCount: recurring.length,
    characters: recurring,
  };
  await writeFile(OUTPUT, JSON.stringify(output, null, 2), "utf-8");
  console.log(
    `[imdb] wrote ${recurring.length} recurring characters → ${path.relative(ROOT, OUTPUT)}`,
  );

  // ----- top-10 preview to stdout -----
  console.log("\n[imdb] top 10 by episode count:");
  for (const c of recurring.slice(0, 10)) {
    const series = c.seriesAppearances.join(",");
    console.log(
      `  ${String(c.episodeCount).padStart(3)} eps · ${c.character.padEnd(28)} · ${c.actor.padEnd(22)} · series ${series}`,
    );
  }
}

main().catch((err) => {
  console.error("[imdb] fatal:", err);
  process.exit(1);
});
