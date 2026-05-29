// Animals of the World worksheet — randomized on every load.
// One animal is picked per continent; both columns are shuffled independently.

const ANIMAL_POOL = [
  { continent: 'Africa',        emoji: '🐘', name: 'African Elephant' },
  { continent: 'Africa',        emoji: '🦁', name: 'Lion' },
  { continent: 'Africa',        emoji: '🦒', name: 'Giraffe' },
  { continent: 'Africa',        emoji: '🦓', name: 'Zebra' },
  { continent: 'Africa',        emoji: '🦍', name: 'Gorilla' },
  { continent: 'Africa',        emoji: '🦛', name: 'Hippo' },
  { continent: 'Africa',        emoji: '🦏', name: 'Rhino' },

  { continent: 'Asia',          emoji: '🐼', name: 'Giant Panda' },
  { continent: 'Asia',          emoji: '🐅', name: 'Bengal Tiger' },
  { continent: 'Asia',          emoji: '🦧', name: 'Orangutan' },
  { continent: 'Asia',          emoji: '🦚', name: 'Peacock' },
  { continent: 'Asia',          emoji: '🐫', name: 'Bactrian Camel' },

  { continent: 'North America', emoji: '🦬', name: 'Bison' },
  { continent: 'North America', emoji: '🦅', name: 'Bald Eagle' },
  { continent: 'North America', emoji: '🦫', name: 'Beaver' },
  { continent: 'North America', emoji: '🦝', name: 'Raccoon' },
  { continent: 'North America', emoji: '🫎', name: 'Moose' },

  { continent: 'South America', emoji: '🐆', name: 'Jaguar' },
  { continent: 'South America', emoji: '🦙', name: 'Llama' },
  { continent: 'South America', emoji: '🦥', name: 'Sloth' },
  { continent: 'South America', emoji: '🦜', name: 'Macaw' },

  { continent: 'Oceania',       emoji: '🦘', name: 'Kangaroo' },
  { continent: 'Oceania',       emoji: '🐨', name: 'Koala' },

  { continent: 'Europe',        emoji: '🐻', name: 'Brown Bear' },
  { continent: 'Europe',        emoji: '🦊', name: 'Red Fox' },
  { continent: 'Europe',        emoji: '🦔', name: 'Hedgehog' },
  { continent: 'Europe',        emoji: '🐺', name: 'Wolf' },

  { continent: 'Antarctica',    emoji: '🐧', name: 'Emperor Penguin' },
  { continent: 'Antarctica',    emoji: '🦭', name: 'Leopard Seal' },
];

const CONTINENTS = [
  'Africa', 'Asia', 'North America', 'South America',
  'Oceania', 'Europe', 'Antarctica',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickAnimals() {
  const picked = [];
  for (const continent of CONTINENTS) {
    const pool = ANIMAL_POOL.filter(a => a.continent === continent);
    picked.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return picked;
}

function render() {
  const selected = pickAnimals();           // one per continent, in continent order
  const animalCol   = shuffle(selected);    // left column: shuffled
  const continentCol = shuffle(CONTINENTS); // right column: shuffled independently

  // --- Animal column ---
  const animalsEl = document.getElementById('animals-col');
  animalsEl.innerHTML = animalCol.map(a => `
    <div class="match-item animal-item">
      <div class="animal-icon">${a.emoji}</div>
      <div class="animal-label">${a.name}</div>
      <div class="match-dot right"></div>
    </div>
  `).join('');

  // --- Continent column ---
  const contEl = document.getElementById('continents-col');
  contEl.innerHTML = continentCol.map(c => `
    <div class="match-item continent-item">
      <div class="match-dot left"></div>
      <div class="cont-label">${c}</div>
    </div>
  `).join('');

  // --- Answer key (upside-down) ---
  const pairs = selected.map(a => `${a.name} → ${a.continent}`).join('  ·  ');
  document.getElementById('answer-key-text').textContent = pairs;
}

render();
