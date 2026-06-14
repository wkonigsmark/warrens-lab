/*
 * Ants & Atlases · Print Quiz · Flags of the World
 *
 * Draw-a-line matching worksheet: real flag images (flagcdn, via the atlas
 * flag_svg field) on the left, shuffled country names on the right.
 *
 * Randomized on every load and on "New flags", so it never becomes rote.
 * A screen-only difficulty selector chooses the country pool (L1-L4); the
 * picker and shuffle button are hidden when printing. The answer key prints
 * upside-down at the foot of the sheet.
 */

const COUNT = 8; // flags per worksheet

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

function flagUrl(country) {
  return country.flag_svg || `https://flagcdn.com/${country.iso_a2.toLowerCase()}.svg`;
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
  const selected = pickCountries();            // the matched set
  const flagOrder = shuffle(selected);         // left column order
  const nameOrder = shuffle(selected);         // right column order (independent)

  // --- Flags column ---
  document.getElementById("flags-col").innerHTML = flagOrder
    .map(
      (c) => `
      <div class="match-item flag-item">
        <span class="flag-thumb"><img src="${flagUrl(c)}" alt="Flag to identify" loading="eager"></span>
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

  // --- Answer key (flag's flagcdn code is the only on-paper hint to the order;
  // we list the flags in the LEFT-column order so it's checkable left-to-right) ---
  const key = flagOrder.map((c, i) => `${i + 1}. ${c.name}`).join("   ");
  document.getElementById("answer-key-text").textContent = key;

  // Number the flags so the answer key can reference them.
  document.querySelectorAll(".flag-item").forEach((el, i) => {
    const badge = document.createElement("span");
    badge.className = "flag-num";
    badge.textContent = i + 1;
    el.prepend(badge);
  });
}

async function init() {
  document.getElementById("shuffle-btn").addEventListener("click", render);
  document.getElementById("level-select").addEventListener("change", render);

  try {
    const res = await fetch("../data/atlas.json");
    const data = await res.json();
    ALL_COUNTRIES = data.countries.filter((c) => c.landmark && c.flag_svg && c.iso_a2);
  } catch (e) {
    console.error("Flags worksheet: failed to load atlas.json", e);
    document.getElementById("flags-col").innerHTML = "<p>Could not load flag data.</p>";
    return;
  }

  render();
}

document.addEventListener("DOMContentLoaded", init);
