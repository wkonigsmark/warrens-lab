// Dynasty Soccer — floating pill navigation, shared by every page.
// Sticky at the top; collapses to just the current section once you scroll,
// and re-expands on hover (desktop) or tap (mobile). A live match always stays
// visible so you can jump back to the scoreboard from anywhere.
import { sb, esc } from './db.js';

const ITEMS = [
  { key: 'team',      label: 'Team',      icon: '👥', href: t => `teams/${t}/index.html` },
  { key: 'checkin',   label: 'Check-in',  icon: '✓',  href: (t, e) => e ? `attendance/index.html?event=${e}` : `teams/${t}/index.html` },
  { key: 'lineup',    label: 'Lineup',    icon: '🧩', href: (t, e) => `lineup/index.html?team=${t}${e ? `&event=${e}` : ''}` },
  { key: 'stopwatch', label: 'Stopwatch', icon: '⏱',  href: (t, e) => `stopwatch/index.html?team=${t}${e ? `&event=${e}` : ''}` },
  { key: 'practice',  label: 'Practice',  icon: '📋', href: t => `practice/index.html?team=${t}` },
  { key: 'drills',    label: 'Drills',    icon: '📚', href: () => `drills/index.html` },
  { key: 'hub',       label: 'All teams', icon: '⚽', href: () => `index.html` },
];

/** Relative path back to the soccer root, from wherever this page lives. */
function basePath() {
  const m = location.pathname.match(/\/soccer\/(.*)$/);
  const depth = m ? m[1].split('/').length - 1 : 0;
  return depth ? '../'.repeat(depth) : './';
}

let liveTimer = null;

export async function mountNav({ active = '', teamSlug = '', eventId = '' } = {}) {
  const base = basePath();
  const nav = document.createElement('nav');
  nav.className = 'app-nav';
  nav.id = 'app-nav';
  document.body.prepend(nav);

  // Resolve a team and a "current" session so Check-in and Lineup land somewhere useful.
  let slug = teamSlug, ev = eventId;
  try {
    if (!slug) {
      const [t] = await sb('teams?sport_id=eq.soccer&active=eq.true&select=slug&order=name.asc&limit=1');
      slug = t?.slug || '';
    }
    if (slug && !ev) {
      const today = new Date().toISOString().slice(0, 10);
      const [next] = await sb(`events?teams.slug=eq.${encodeURIComponent(slug)}&event_date=gte.${today}` +
        `&event_type=neq.bye&select=id,teams!inner(slug)&order=event_date.asc&limit=1`);
      ev = next?.id || '';
    }
  } catch { /* nav still renders with whatever we have */ }

  function draw(live) {
    nav.innerHTML = `
      ${live ? `<a class="an-live" href="${base}match/index.html?event=${live.event_id}">
          <span class="an-dot"></span><span class="an-txt">LIVE ${live.our_score}–${live.their_score}</span>
        </a>` : ''}
      ${ITEMS.map(i => `
        <a class="an-item${i.key === active ? ' active' : ''}" href="${base}${i.href(slug, ev)}">
          <span class="an-icon">${i.icon}</span><span class="an-label">${esc(i.label)}</span>
        </a>`).join('')}`;
  }
  draw(null);

  // Keep a running match visible from every page.
  async function pollLive() {
    try {
      const [m] = await sb('matches?status=eq.live&select=event_id,our_score,their_score&order=created_at.desc&limit=1');
      draw(m || null);
    } catch { /* leave the nav as it is */ }
  }
  pollLive();
  clearInterval(liveTimer);
  liveTimer = setInterval(() => { if (document.visibilityState === 'visible') pollLive(); }, 15000);

  // Collapse once the page scrolls; tap toggles it open on touch devices.
  // style-lab.css makes <body> the scroll container, so window.scrollY alone is not enough.
  const scrollTop = () =>
    window.scrollY || document.body.scrollTop || document.documentElement.scrollTop || 0;
  let open = false;
  const sync = () => nav.classList.toggle('minimized', scrollTop() > 90 && !open);
  for (const target of [window, document, document.body]) {
    target.addEventListener('scroll', sync, { passive: true });
  }
  nav.addEventListener('click', e => {
    if (!nav.classList.contains('minimized')) return;
    if (e.target.closest('.an-item.active')) { e.preventDefault(); open = true; sync(); }
  });
  document.addEventListener('click', e => {
    if (open && !nav.contains(e.target)) { open = false; sync(); }
  });
  sync();
  return nav;
}
