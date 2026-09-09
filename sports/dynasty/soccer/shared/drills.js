// Dynasty Soccer — drill library data + filtering, shared by the library page and the planner.
let cache = null;

/** Load data/drills.json once. `base` is the relative path back to the soccer root. */
export async function loadDrills(base = '..') {
  if (!cache) {
    const res = await fetch(`${base}/data/drills.json`);
    if (!res.ok) throw new Error(`Could not load drills.json (${res.status})`);
    cache = await res.json();
  }
  return cache;
}

export const label = v => String(v || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export const QUICK_SPECIALTIES = ['warm_up', 'dribbling', 'passing', 'shooting', 'defense', 'offense', 'small_sided_game'];

function haystack(d) {
  return [d.title, d.source, d.summary, d.whyUseIt, d.difficulty,
          (d.specialties || []).join(' '), (d.equipment || []).join(' '), (d.coachingCues || []).join(' ')]
    .join(' ').toLowerCase();
}

/** Filter by free text, difficulty and specialty. Any field may be blank. */
export function filterDrills(drills, { q = '', difficulty = '', specialty = '' } = {}) {
  const needle = q.trim().toLowerCase();
  return drills.filter(d =>
    (!needle || haystack(d).includes(needle)) &&
    (!difficulty || d.difficulty === difficulty) &&
    (!specialty || (d.specialties || []).includes(specialty)));
}

export const findDrill = (drills, id) => drills.find(d => d.id === id) || null;
