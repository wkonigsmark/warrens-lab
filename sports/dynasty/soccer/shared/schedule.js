// Dynasty Soccer — schedule fetch + render, shared by the hub and team pages.
import { sb, esc } from './db.js';

export const TYPE_LABEL = { game: 'Game', practice: 'Practice', training_game: 'Training + Game', bye: 'Bye' };

/** Fetch events (optionally for one team), sorted by date then time. */
export async function fetchEvents(teamId) {
  const filter = teamId ? `&team_id=eq.${teamId}` : '';
  return sb(
    `events?select=id,team_id,event_date,start_time,end_time,event_type,opponent,location,notes,teams(*)` +
    `${filter}&order=event_date.asc,start_time.asc.nullslast`
  );
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function fmtRange(e) {
  if (e.event_type === 'bye') return '—';
  const s = fmtTime(e.start_time);
  const en = fmtTime(e.end_time);
  return en ? `${s} – ${en}` : s || 'TBD';
}

/**
 * Render events into a <tbody>. Options:
 *   showTeam  — include a Team column (hub)
 *   hidePast  — drop events before today
 *   matches   — map event_id -> {status, our_score, their_score}
 *   matchUrl  — path prefix for the scoring page (event id appended)
 *   canStart  — show "Score" links for games without a match (coach mode)
 *   checkinUrl — when set (coach mode), each row links to roster check-in
 *   attendance — map event_id -> {out, maybe} counts, shown as a badge
 */
export function scoreBadge(m) {
  if (!m) return '';
  const r = m.our_score > m.their_score ? 'W' : m.our_score < m.their_score ? 'L' : 'T';
  return m.status === 'final'
    ? `<span class="score final ${r}">${r} ${m.our_score}–${m.their_score}</span>`
    : `<span class="score live">Live ${m.our_score}–${m.their_score}</span>`;
}

export function renderEvents(tbody, events, { showTeam = false, hidePast = false, matches = {}, matchUrl = '', canStart = false, checkinUrl = '', attendance = {} } = {}) {
  const today = todayISO();
  const cols = showTeam ? 6 : 5;
  const list = hidePast ? events.filter(e => e.event_date >= today) : events;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="${cols}" class="empty">${events.length ? 'No upcoming events.' : 'No events scheduled.'}</td></tr>`;
    return 0;
  }

  let nextMarked = false;
  tbody.innerHTML = list.map(e => {
    const past = e.event_date < today;
    const isToday = e.event_date === today;
    let cls = e.event_type;
    if (past) cls += ' past';
    if (isToday) cls += ' today';
    if (!past && !nextMarked) { cls += ' next'; nextMarked = true; }
    const m = matches[e.id];
    let score = '';
    if (matchUrl && e.event_type === 'game' && e.teams?.live_scoring !== false) {
      if (m) score = ` <a class="score-link" href="${matchUrl}${e.id}">${scoreBadge(m)}</a>`;
      else if (canStart) score = ` <a class="score-link start" href="${matchUrl}${e.id}">Score</a>`;
    }
    return `
      <tr class="${cls}">
        <td class="date">${fmtDate(e.event_date)}</td>
        <td class="time">${fmtRange(e)}</td>
        ${showTeam ? `<td class="team"><a href="teams/${encodeURIComponent(e.teams.slug)}/index.html">${esc(e.teams.name)}</a></td>` : ''}
        <td class="what"><span class="pill ${e.event_type}">${TYPE_LABEL[e.event_type]}</span>${e.opponent ? ` <span class="opp">vs ${esc(e.opponent)}</span>` : ''}${score}</td>
        <td class="loc">${esc(e.location || '')}</td>
        <td class="notes">${esc(e.notes || '')}${(() => {
          if (!checkinUrl || e.event_type === 'bye') return '';
          const a = attendance[e.id];
          const n = a ? (a.out || 0) + (a.maybe || 0) : 0;
          return `${e.notes ? ' ' : ''}<a class="att-link" href="${checkinUrl}${e.id}">check-in</a>${
            n ? ` <span class="att-badge">${a.out ? `${a.out} out` : ''}${a.out && a.maybe ? ', ' : ''}${a.maybe ? `${a.maybe} maybe` : ''}</span>` : ''}`;
        })()}</td>
      </tr>`;
  }).join('');
  return list.length;
}

/** True when the API says the events table doesn't exist yet (schema not migrated). */
export function isMissingTable(err) {
  return /404|PGRST205|Could not find the table/i.test(err?.message || '');
}
