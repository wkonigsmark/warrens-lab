#!/usr/bin/env node
// Builds atlas.json by merging two committed, offline sources:
//   • countries_base.json — machine-derived "hard" fields (iso codes, name,
//     capital, languages, currency, borders, area, population, flag URLs,
//     continent/hemisphere/buckets). Origin: REST Countries, snapshotted.
//   • atlas_soft.json      — hand-curated "soft" fields (level, flag colors &
//     motifs, climate, terrain, landmark, food, fact card, bordering waters,
//     island) plus named "slices" (e.g. the World Cup 2026 roster).
//
// WHY OFFLINE: the REST Countries v3.1 API was deprecated in 2026 (every
// endpoint now 301-redirects to a dead "legacy" error file). The build no
// longer hits the network, so it can never break from an upstream API change.
// countries_base.json is the canonical cache; regenerate it only if you adopt a
// new upstream data source.
//
// To add a NEW country:
//   1. Add its hard fields to countries_base.json (copy the shape of an existing
//      entry; flag_svg is https://flagcdn.com/<iso2-lowercase>.svg).
//   2. Add a soft entry (and any slice membership) to atlas_soft.json.
//   3. Run:  node build_atlas.mjs
//
// Usage:  node build_atlas.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_PATH = path.join(__dirname, "countries_base.json");
const SOFT_PATH = path.join(__dirname, "atlas_soft.json");
const OUT_PATH = path.join(__dirname, "atlas.json");

// Soft fields copied from atlas_soft.json onto each country (null when absent).
const SOFT_FIELDS = [
  "flag_colors", "flag_motifs", "climate_band", "terrain_headline",
  "bordering_waters", "landmark", "famous_food", "fact_card"
];

async function main() {
  const base = JSON.parse(await fs.readFile(BASE_PATH, "utf8"));
  const soft = JSON.parse(await fs.readFile(SOFT_PATH, "utf8"));

  // Named slices (e.g. World Cup 2026) cut across the L1-L4 tiers. Each slice
  // defines a boolean `flag` key + a list of ISO2s; matching countries get stamped.
  const slices = soft.slices || {};
  const sliceFlags = Object.values(slices).map(s => ({
    flag: s.flag, set: new Set(s.iso2s || [])
  }));

  const countries = base.countries.map(hard => {
    const iso2 = hard.iso_a2;
    const s = soft.countries[iso2] || {};

    const country = {
      ...hard,
      level: s.level || 4,                 // L1-L3 hand-curated, L4 default
      island: s.island ?? null,
    };
    for (const f of SOFT_FIELDS) country[f] = s[f] ?? null;

    // Stamp slice membership flags (e.g. wc2026: true). Absent when not a member.
    for (const { flag, set } of sliceFlags) {
      if (flag && set.has(iso2)) country[flag] = true;
    }
    return country;
  });

  // Stable ISO sort for readable diffs.
  countries.sort((a, b) => a.iso_a2.localeCompare(b.iso_a2));

  const tierBreakdown = countries.reduce((acc, c) => {
    acc[c.level] = (acc[c.level] || 0) + 1;
    return acc;
  }, {});

  const continents = Object.entries(soft.continents).map(([id, c]) => ({
    id,
    ...c,
    country_count_in_atlas: countries.filter(co => co.continent === id).length
  }));

  // Top-level slice metadata (label/note/flag + live count), without the iso lists.
  const sliceMeta = Object.fromEntries(
    Object.entries(slices).map(([id, s]) => [id, {
      flag: s.flag,
      label: s.label || id,
      note: s.note || null,
      count: countries.filter(c => c[s.flag]).length
    }])
  );

  const atlas = {
    version: 3,
    generated_at: new Date().toISOString(),
    sources: {
      countries: "countries_base.json (offline snapshot; REST Countries origin)",
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

main().catch(err => { console.error(err); process.exit(1); });
