/*
 * Ants & Atlases · Print Quiz · Shapes of the World
 *
 * Draw-a-line matching worksheet: country outline silhouettes (rendered from
 * world.geo.json via AACountries.silhouetteSVG) on the left, shuffled country
 * names on the right. Mirrors the Flags worksheet.
 *
 * Randomized on every load and on "New shapes". A screen-only difficulty
 * selector chooses the country pool (L1-L4); picker + shuffle hidden in print.
 * Answer key prints upside-down at the foot of the sheet.
 */

const COUNT = 8; // shapes per worksheet

const LEVEL_POOLS = {
  "1": [1],
  "2": [1, 2],
  "3": [1, 2, 3],
  "4": [1, 2, 3, 4],
};

let ALL_COUNTRIES = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function currentLevel() {
  return document.getElementById("level-select").value;
}

function pickCountries() {
  const sel = currentLevel();
  const pool = sel === "wc"
    ? ALL_COUNTRIES.filter((c) => c.wc2026)
    : ALL_COUNTRIES.filter((c) => (LEVEL_POOLS[sel] || [1, 2]).includes(c.level));
  return shuffle(pool).slice(0, COUNT);
}

function render() {
  const selected = pickCountries();
  const shapeOrder = shuffle(selected);  // left column
  const nameOrder = shuffle(selected);   // right column (independent)

  // --- Shapes column ---
  document.getElementById("shapes-col").innerHTML = shapeOrder
    .map(
      (c, i) => `
      <div class="match-item shape-item">
        <span class="shape-num">${i + 1}</span>
        <span class="shape-thumb">${AACountries.silhouetteSVG(c.iso_a2, {
          svgClass: "shape-svg",
          pathClass: "ws-shape-path",
        })}</span>
        <div class="match-dot right"></div>
      </div>`
    )
    .join("");

  // --- Country names column ---
  document.getElementById("names-col").innerHTML = nameOrder
    .map(
      (c) => `
      <div class="match-item name-item">
        <div class="match-dot left"></div>
        <div class="name-label">${c.name}</div>
      </div>`
    )
    .join("");

  // --- Answer key, keyed to the numbered shapes (left-column order) ---
  document.getElementById("answer-key-text").textContent = shapeOrder
    .map((c, i) => `${i + 1}. ${c.name}`)
    .join("   ");
}

async function init() {
  document.getElementById("shuffle-btn").addEventListener("click", render);
  document.getElementById("level-select").addEventListener("change", render);

  try {
    AACountries.setDataDir("../data"); // page lives in print/
    await AACountries.load();
  } catch (e) {
    console.error("Shapes worksheet: failed to load map data", e);
    document.getElementById("shapes-col").innerHTML = "<p>Could not load shape data.</p>";
    return;
  }

  // Curated countries that also have a drawable silhouette.
  ALL_COUNTRIES = AACountries.allCountries().filter(
    (c) => c.landmark && c.iso_a2 && AACountries.silhouette(c.iso_a2)
  );

  render();
}

document.addEventListener("DOMContentLoaded", init);
