#!/usr/bin/env node
// Generates atlas.json by merging REST Countries (live fetch of every sovereign
// nation) with atlas_soft.json (hand-curated tier 1-3). Countries without soft
// fields land at level 4 with null soft data — the engine handles them via the
// "no info" hint fallback.
//
// Usage:  node build_atlas.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOFT_PATH = path.join(__dirname, "atlas_soft.json");
const OUT_PATH = path.join(__dirname, "atlas.json");

const FIELDS = [
  "name", "cca2", "cca3", "region", "subregion", "capital",
  "languages", "currencies", "landlocked", "borders",
  "area", "population", "latlng", "flag", "flags", "independent"
].join(",");

const REGION_TO_CONTINENT = {
  Africa: "africa",
  Antarctic: "antarctica",
  Asia: "asia",
  Europe: "europe",
  Oceania: "oceania"
};
const SUBREGION_TO_AMERICAS = {
  "North America": "north_america",
  "Central America": "north_america",
  Caribbean: "north_america",
  "South America": "south_america"
};

function continentFor(region, subregion) {
  if (region === "Americas") return SUBREGION_TO_AMERICAS[subregion] || "north_america";
  return REGION_TO_CONTINENT[region] || "unknown";
}

function populationBucket(p) {
  if (p < 1_000_000) return "tiny";
  if (p < 10_000_000) return "small";
  if (p < 50_000_000) return "medium";
  if (p < 200_000_000) return "large";
  return "mega";
}

function areaBucket(a) {
  if (a < 100_000) return "tiny";
  if (a < 500_000) return "small";
  if (a < 2_000_000) return "medium";
  if (a < 5_000_000) return "large";
  return "huge";
}

function hemisphere(latlng) {
  const [lat, lng] = latlng;
  return { ns: lat >= 0 ? "N" : "S", ew: lng >= 0 ? "E" : "W" };
}

async function fetchAll() {
  // /v3.1/all is deprecated by the API. The /independent endpoint with status=true
  // returns every sovereign nation in one call. Much faster than 195 individual queries.
  const url = `https://restcountries.com/v3.1/independent?status=true&fields=${FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch /independent failed: ${res.status}`);
  return res.json();
}

async function fetchOne(iso2) {
  const url = `https://restcountries.com/v3.1/alpha/${iso2}?fields=${FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function main() {
  const soft = JSON.parse(await fs.readFile(SOFT_PATH, "utf8"));

  console.log(`Fetching all countries from REST Countries...`);
  const all = await fetchAll();

  // Sovereign nations only — drops dependent territories, UN observers without
  // recognition, and Antarctic claims. ~195 countries.
  const sovereign = all.filter(c => c.independent === true);

  // REST Countries excludes a handful of entities (Taiwan especially) from the
  // /independent endpoint because of disputed UN recognition. If our hand-curated
  // soft data references any such ISOs, fetch them individually and add them in.
  const haveIsos = new Set(sovereign.map(c => c.cca2));
  const softIsos = Object.keys(soft.countries);
  const missing = softIsos.filter(iso => !haveIsos.has(iso));
  if (missing.length > 0) {
    console.log(`Backfilling ${missing.length} curated country/ies not in /independent:`, missing.join(", "));
    const extras = await Promise.all(missing.map(fetchOne));
    for (const c of extras) if (c) sovereign.push(c);
  }

  console.log(`Total countries in atlas: ${sovereign.length}.`);

  // Stable sort by ISO so output diffs are readable
  sovereign.sort((a, b) => a.cca2.localeCompare(b.cca2));

  // Named slices (e.g. World Cup 2026) cut across the L1-L4 tiers. Each slice
  // defines a boolean `flag` key and a list of ISO2s; we stamp matching countries
  // with that flag so every quiz mode can filter to the slice.
  const slices = soft.slices || {};
  const sliceFlags = Object.values(slices).map(s => ({
    flag: s.flag,
    set: new Set(s.iso2s || [])
  }));

  const countries = sovereign.map(raw => {
    const iso2 = raw.cca2;
    const s = soft.countries[iso2] || {};
    const latlng = raw.latlng || [0, 0];
    const hemi = hemisphere(latlng);
    const sliceMembership = {};
    for (const { flag, set } of sliceFlags) {
      if (flag && set.has(iso2)) sliceMembership[flag] = true;
    }
    return {
      iso_a2: raw.cca2,
      iso_a3: raw.cca3,
      name: raw.name.common,
      official_name: raw.name.official,
      level: s.level || 4,                                  // L1-L3 hand-curated, L4 auto
      continent: continentFor(raw.region, raw.subregion),
      subregion: raw.subregion || null,
      capital: (raw.capital && raw.capital[0]) || null,
      languages: Object.values(raw.languages || {}),
      currency: Object.keys(raw.currencies || {})[0] || null,
      currency_name: Object.values(raw.currencies || {})[0]?.name || null,
      landlocked: !!raw.landlocked,
      island: s.island ?? null,
      borders: raw.borders || [],
      area_km2: raw.area || 0,
      population: raw.population || 0,
      latlng,
      hemisphere_ns: hemi.ns,
      hemisphere_ew: hemi.ew,
      population_bucket: populationBucket(raw.population || 0),
      area_bucket: areaBucket(raw.area || 0),
      flag_emoji: raw.flag,
      flag_svg: raw.flags?.svg,
      // Soft fields — null when not hand-curated. Hint builders handle nulls gracefully.
      flag_colors: s.flag_colors || null,
      flag_motifs: s.flag_motifs || null,
      climate_band: s.climate_band || null,
      terrain_headline: s.terrain_headline || null,
      bordering_waters: s.bordering_waters || null,
      landmark: s.landmark || null,
      famous_food: s.famous_food || null,
      fact_card: s.fact_card || null,
      // Slice membership flags (e.g. wc2026: true). Absent when not a member.
      ...sliceMembership
    };
  });

  const tierBreakdown = countries.reduce((acc, c) => {
    acc[c.level] = (acc[c.level] || 0) + 1;
    return acc;
  }, {});

  const continents = Object.entries(soft.continents).map(([id, c]) => ({
    id,
    ...c,
    country_count_in_atlas: countries.filter(co => co.continent === id).length
  }));

  // Surface slice definitions at the top level (label/note/flag), without the
  // verbose iso2 lists — consumers filter on the per-country boolean flags.
  const sliceMeta = Object.fromEntries(
    Object.entries(slices).map(([id, s]) => [id, {
      flag: s.flag,
      label: s.label || id,
      note: s.note || null,
      count: countries.filter(c => c[s.flag]).length
    }])
  );

  const atlas = {
    version: 2,
    generated_at: new Date().toISOString(),
    sources: {
      countries: "https://restcountries.com/v3.1",
      soft_fields: "atlas_soft.json (hand-curated)"
    },
    slices: sliceMeta,
    continents,
    countries
  };

  await fs.writeFile(OUT_PATH, JSON.stringify(atlas, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
  console.log(`  continents: ${continents.length}`);
  console.log(`  countries:  ${countries.length}`);
  console.log(`  tier breakdown:`, tierBreakdown);
  for (const [id, m] of Object.entries(sliceMeta)) {
    console.log(`  slice ${id} (${m.flag}): ${m.count} countries`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
