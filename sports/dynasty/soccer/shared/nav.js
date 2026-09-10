// Dynasty Soccer — floating navigation, shared by every page.
//
// Game-day utilities (Score, Lineup, Check-in) are always visible and never collapse:
// on a Saturday morning those are the only three things that matter. Everything else
// lives behind the ⋯ menu. A live match shows as a badge from any page.
import { sb, esc } from './db.js';

const PRIMARY = [
  { key: 'score',   label: 'Score',    icon: '⚽',   href: (t, e, s) => s ? `match/index.html?event=${s}` : `teams/${t}/index.html` },
  { key: 'lineup',  label: 'Lineup',   icon: '📋',   href: (t, e) => `lineup/index.html?team=${t}${e ? `&event=${e}` : ''}` },
  { key: 'checkin', label: 'Check-in', icon: '👦👧', href: (t, e) => e ? `attendance/index.html?event=${e}` : `teams/${t}/index.html` },
];

const MORE = [
  { key: 'team',      label: 'Team roster', icon: '👥', href: t => `teams/${t}/index.html` },
  { key: 'stopwatch', label: 'Stopwatch',   icon: '⏱',  href: (t, e) => `stopwatch/index.html?team=${t}${e ? `&event=${e}` : ''}` },
  { key: 'practice',  label: 'Practice plan', icon: '📝', href: t => `practice/index.html?team=${t}` },
  { key: 'drills',    label: 'Drill library', icon: '📚', href: () => `drills/index.html` },
  { key: 'hub',       label: 'All teams',   icon: '🏠', href: () => `index.html` },
];

/** Relative path back to the soccer root, from wherever this page lives. */
function basePath() {
  const m = location.pathname.match(/\/soccer\/(.*)$/);
  const depth = m ? m[1].split('/').length - 1 : 0;
  return depth ? '../'.repeat(depth) : './';
}

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const daysApart = (iso, today) =>
  Math.abs((Date.parse(iso + 'T00:00:00') - Date.parse(today + 'T00:00:00')) / 86400000);

/** The session nearest to today — today's if there is one, else whichever is closest either way. */
function nearest(events, today, filter = () => true) {
  const pool = events.filter(filter);
  if (!pool.length) return null;
  const sameDay = pool.filter(e => e.event_date === today);
  const pick = (sameDay.length ? sameDay : pool)
    .slice()
    .sort((a, b) => daysApart(a.event_date, today) - daysApart(b.event_date, today)
                 || (a.start_time || '').localeCompare(b.start_time || ''));
  return pick[0];
}

let liveTimer = null;

export async function mountNav({ active = '', teamSlug = '', eventId = '' } = {}) {
  const base = basePath();
  const nav = document.createElement('nav');
  nav.className = 'app-nav';
  nav.id = 'app-nav';
  document.body.prepend(nav);

  let slug = teamSlug, ev = eventId, scoreEv = '';
  try {
    if (!slug) {
      const [t] = await sb('teams?sport_id=eq.soccer&active=eq.true&select=slug&order=name.asc&limit=1');
      slug = t?.slug || '';
    }
    if (slug) {
      const today = todayISO();
      const evs = await sb(`events?select=id,event_date,start_time,event_type,teams!inner(slug,live_scoring)` +
        `&teams.slug=eq.${encodeURIComponent(slug)}&event_type=neq.bye&order=event_date.asc`);
      if (!ev) ev = nearest(evs, today)?.id || '';
      // Score jumps to the nearest *scoreable* game, so it is one tap on match day.
      scoreEv = nearest(evs, today, e => e.event_type === 'game' && e.teams.live_scoring !== false)?.id || '';
    }
  } catch { /* nav still renders with whatever resolved */ }

  function draw(live) {
    if (live) scoreEv = live.event_id;              // a running match always wins
    nav.innerHTML = `
      ${live ? `<a class="an-live" href="${base}match/index.html?event=${live.event_id}">
          <span class="an-dot"></span><span class="an-txt">LIVE ${live.our_score}–${live.their_score}</span>
        </a>` : ''}
      ${PRIMARY.map(i => `
        <a class="an-item${i.key === active ? ' active' : ''}" href="${base}${i.href(slug, ev, scoreEv)}">
          <span class="an-icon">${i.icon}</span><span class="an-label">${esc(i.label)}</span>
        </a>`).join('')}
      <div class="an-more">
        <button class="an-item an-more-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="More">⋯</button>
        <div class="an-menu">
          ${MORE.map(i => `
            <a class="an-menu-item${i.key === active ? ' active' : ''}" href="${base}${i.href(slug, ev)}">
              <span class="an-icon">${i.icon}</span>${esc(i.label)}
            </a>`).join('')}
        </div>
      </div>`;
  }
  draw(null);

  // Keep a running match reachable from every page.
  async function pollLive() {
    try {
      const [m] = await sb('matches?status=eq.live&select=event_id,our_score,their_score&order=created_at.desc&limit=1');
      const openMenu = nav.querySelector('.an-more.open');
      if (!openMenu) draw(m || null);
    } catch { /* leave the nav as it is */ }
  }
  pollLive();
  clearInterval(liveTimer);
  liveTimer = setInterval(() => { if (document.visibilityState === 'visible') pollLive(); }, 15000);

  nav.addEventListener('click', e => {
    const btn = e.target.closest('.an-more-btn');
    if (!btn) return;
    e.preventDefault();
    const box = btn.closest('.an-more');
    const open = box.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.an-more')) {
      for (const b of nav.querySelectorAll('.an-more.open')) {
        b.classList.remove('open');
        b.querySelector('.an-more-btn')?.setAttribute('aria-expanded', 'false');
      }
    }
  });
  return nav;
}
