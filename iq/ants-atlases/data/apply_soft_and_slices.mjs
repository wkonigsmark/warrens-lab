#!/usr/bin/env node
// Offline atlas updater.
//
// The REST Countries v3.1 API (used by build_atlas.mjs) has been deprecated and
// now redirects to a dead legacy endpoint, so we can't re-fetch hard fields live.
// This script instead treats the existing atlas.json as the cached source of hard
// fields (iso codes, capital, population, geometry-independent facts) and:
//   1. Re-merges soft fields from atlas_soft.json (so curation edits take effect)
//   2. Stamps slice membership flags (e.g. wc2026) from atlas_soft.json "slices"
//   3. Backfills manual entries not present in the cache (e.g. Curaçao)
//   4. Refreshes the top-level slices metadata block
//
// Usage:  node apply_soft_and_slices.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOFT_PATH = path.join(__dirname, "atlas_soft.json");
const OUT_PATH = path.join(__dirname, "atlas.json");

const SOFT_FIELDS = [
  "level", "island", "flag_colors", "flag_motifs", "climate_band",
  "terrain_headline", "bordering_waters", "landmark", "famous_food", "fact_card"
];

// Manual backfill for entities not in the cached atlas and not fetchable
// (non-sovereign FIFA entrants, etc.). Hard fields are hand-entered.
const MANUAL = {
  CW: {
    iso_a2: "CW", iso_a3: "CUW",
    name: "Curaçao", official_name: "Country of Curaçao",
    continent: "north_america", subregion: "Caribbean",
    capital: "Willemstad",
    languages: ["Dutch", "Papiamento", "English"],
    currency: "ANG", currency_name: "Netherlands Antillean guilder",
    landlocked: false,
    borders: [],
    area_km2: 444, population: 155014,
    latlng: [12.116667, -68.933333],
    hemisphere_ns: "N", hemisphere_ew: "W",
    population_bucket: "tiny", area_bucket: "tiny",
    flag_emoji: "🇨🇼", flag_svg: "https://flagcdn.com/cw.svg"
  }
};

function mergeSoft(country, soft) {
  if (!soft) return country;
  for (const f of SOFT_FIELDS) {
    if (soft[f] !== undefined) country[f] = soft[f];
  }
  return country;
}

async function main() {
  const soft = JSON.parse(await fs.readFile(SOFT_PATH, "utf8"));
  const atlas = JSON.parse(await fs.readFile(OUT_PATH, "utf8"));

  // Slice flag sets from atlas_soft.json
  const slices = soft.slices || {};
  const sliceFlags = Object.values(slices).map(s => ({
    flag: s.flag, set: new Set(s.iso2s || [])
  }));

  const byIso = new Map(atlas.countries.map(c => [c.iso_a2, c]));

  // Backfill manual entries (e.g. Curaçao) if missing.
  for (const [iso, rec] of Object.entries(MANUAL)) {
    if (!byIso.has(iso)) {
      const c = { ...rec };
      atlas.countries.push(c);
      byIso.set(iso, c);
    }
  }

  // Re-merge soft fields + stamp slice flags. Clear stale slice flags first so
  // removing a country from a slice in atlas_soft.json actually un-stamps it.
  const allFlags = sliceFlags.map(s => s.flag).filter(Boolean);
  for (const c of atlas.countries) {
    for (const f of allFlags) delete c[f];
    mergeSoft(c, soft.countries[c.iso_a2]);
    for (const { flag, set } of sliceFlags) {
      if (flag && set.has(c.iso_a2)) c[flag] = true;
    }
  }

  // Keep ISO-sorted for readable diffs.
  atlas.countries.sort((a, b) => a.iso_a2.localeCompare(b.iso_a2));

  // Top-level slice metadata (label/note/flag + live count).
  atlas.slices = Object.fromEntries(
    Object.entries(slices).map(([id, s]) => [id, {
      flag: s.flag,
      label: s.label || id,
      note: s.note || null,
      count: atlas.countries.filter(c => c[s.flag]).length
    }])
  );
  atlas.generated_at = new Date().toISOString();

  await fs.writeFile(OUT_PATH, JSON.stringify(atlas, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
  console.log(`  countries: ${atlas.countries.length}`);
  for (const [id, m] of Object.entries(atlas.slices)) {
    console.log(`  slice ${id} (${m.flag}): ${m.count} countries`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
