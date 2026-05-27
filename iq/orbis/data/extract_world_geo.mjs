#!/usr/bin/env node
// One-shot: strip the Highcharts.maps assignment from world.js and emit clean JSON.
// Run with:  node extract_world_geo.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "world.js");
const OUT = path.join(__dirname, "world.geo.json");

const raw = await fs.readFile(SRC, "utf8");
const start = raw.indexOf("{");
const end = raw.lastIndexOf("}");
if (start < 0 || end < 0) throw new Error("Could not locate JSON braces in world.js");
const json = raw.slice(start, end + 1);
const parsed = JSON.parse(json);

await fs.writeFile(OUT, JSON.stringify(parsed));
const stats = await fs.stat(OUT);
console.log(`Wrote ${OUT}`);
console.log(`  size: ${(stats.size / 1024).toFixed(1)} KB`);
console.log(`  features: ${parsed.features.length}`);
