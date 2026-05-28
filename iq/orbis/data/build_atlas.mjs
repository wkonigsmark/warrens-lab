#!/usr/bin/env node
// Generates atlas.json by merging REST Countries (live fetch) with atlas_soft.json (hand-curated).
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
  "area", "population", "latlng", "flag", "flags"
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

async function fetchCountry(iso2) {
  const url = `https://restcountries.com/v3.1/alpha/${iso2}?fields=${FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed for ${iso2}: ${res.status}`);
  return res.json();
}

async function main() {
  const soft = JSON.parse(await fs.readFile(SOFT_PATH, "utf8"));
  const countryIsos = Object.keys(soft.countries);

  console.log(`Fetching ${countryIsos.length} countries from REST Countries...`);
  const fetched = await Promise.all(countryIsos.map(fetchCountry));

  const countries = fetched.map((raw, i) => {
    const iso2 = countryIsos[i];
    const s = soft.countries[iso2];
    const hemi = hemisphere(raw.latlng);
    return {
      iso_a2: raw.cca2,
      iso_a3: raw.cca3,
      name: raw.name.common,
      official_name: raw.name.official,
      level: s.level || 4,                                  // tier 1=Famous20, 2=top40, 3=top80, 4=all
      continent: continentFor(raw.region, raw.subregion),
      subregion: raw.subregion,
      capital: (raw.capital && raw.capital[0]) || null,
      languages: Object.values(raw.languages || {}),
      currency: Object.keys(raw.currencies || {})[0] || null,
      currency_name: Object.values(raw.currencies || {})[0]?.name || null,
      landlocked: raw.landlocked,
      island: s.island,
      borders: raw.borders || [],
      area_km2: raw.area,
      population: raw.population,
      latlng: raw.latlng,
      hemisphere_ns: hemi.ns,
      hemisphere_ew: hemi.ew,
      population_bucket: populationBucket(raw.population),
      area_bucket: areaBucket(raw.area),
      flag_emoji: raw.flag,
      flag_svg: raw.flags?.svg,
      flag_colors: s.flag_colors,
      flag_motifs: s.flag_motifs,
      climate_band: s.climate_band,
      terrain_headline: s.terrain_headline,
      bordering_waters: s.bordering_waters,
      landmark: s.landmark,
      famous_food: s.famous_food,
      fact_card: s.fact_card
    };
  });

  // Continents come straight from soft, but add a derived country_count.
  const continents = Object.entries(soft.continents).map(([id, c]) => ({
    id,
    ...c,
    country_count_in_atlas: countries.filter(co => co.continent === id).length
  }));

  const atlas = {
    version: 1,
    generated_at: new Date().toISOString(),
    sources: {
      countries: "https://restcountries.com/v3.1",
      soft_fields: "atlas_soft.json (hand-curated)"
    },
    continents,
    countries
  };

  await fs.writeFile(OUT_PATH, JSON.stringify(atlas, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
  console.log(`  continents: ${continents.length}`);
  console.log(`  countries:  ${countries.length}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
