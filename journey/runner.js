/* =============================================
   Journey Runner — beta scaffold

   Single-page state machine. Holds the session,
   launches activities with journey params, ingests
   results returned via the JourneyBridge contract,
   and renders the post-round diagnostic sheet.

   State lives in localStorage so a round can
   round-trip through a child activity tab.
   ============================================= */
(() => {
  'use strict';

  // ---- Constants ------------------------------------------------------------

  const STORAGE_SESSION = 'journey:session';
  const STORAGE_RESULT  = 'journey:lastResult';   // transient, written by bridge

  const PARENTAL_GATE_MS = 20 * 60 * 1000;        // 20 min cumulative play

  // Beta plan. Hardcoded for v0; will move to plans/*.json later.
  // `url`     — path the runner will navigate to, with ?journey=... appended.
  // `skill`   — bucket for the adaptive engine.
  // `target`  — coarse expected target (questions/score). Activities echo their own actual.
  // `expectedMs` — used by the diagnostic to flag "too fast" / "too slow".
  // `blurb`   — kid-facing one-liner.
  const DEFAULT_PLAN = [
    { id: 's1', activity: 'ants-apples', label: 'Ants & Apples', skill: 'math',    url: '/iq/ants-apples/',    target: 10, expectedMs: 4*60*1000, blurb: 'Warm up with arithmetic adventures.' },
    { id: 's2', activity: 'lexicon',     label: 'Lexicon',       skill: 'vocab',   url: '/iq/lexicon/',        target: 8,  expectedMs: 3*60*1000, blurb: 'Roots, origins, and word puzzles.' },
    { id: 's3', activity: 'foursight',   label: 'FourSight',     skill: 'logic',   url: '/games/foursight/',   target: 1,  expectedMs: 3*60*1000, blurb: 'A friendly logic match against the computer.' },
    { id: 's4', activity: 'abacus',      label: 'Abacus',        skill: 'math',    url: '/games/abacus/',      target: 8,  expectedMs: 4*60*1000, blurb: 'Bead-by-bead mental math.' },
    { id: 's5', activity: 'chronos',     label: 'Chronos',       skill: 'history', url: '/iq/chronos/',        target: 6,  expectedMs: 4*60*1000, blurb: 'A descent through historical time.' },
    { id: 's6', activity: 'matching',    label: 'Matching',      skill: 'memory',  url: '/games/matching/',    target: 12, expectedMs: 3*60*1000, blurb: 'A memory cool-down to finish.' }
  ];

  // ---- Session model --------------------------------------------------------

  /** Load (or create) the current session. */
  function loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through */ }
    return null;
  }

  function saveSession(s) {
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(s));
  }

  function newSession(child) {
    return {
      id: 'j_' + Date.now().toString(36),
      child,                          // { name, age, parentEmail }
      plan: DEFAULT_PLAN.slice(),
      currentStopIndex: 0,
      log: [],                        // array of round results
      cumulativePlayMs: 0,
      startedAt: Date.now(),
      // per-skill level 1–10 for the adaptive engine. Seeded from age.
      levels: seedLevelsFromAge(child.age)
    };
  }

  function seedLevelsFromAge(age) {
    // Very coarse seed; adaptive engine refines from here.
    const base = Math.max(1, Math.min(8, Math.round((age - 4) * 1.1) + 1));
    return { math: base, vocab: base, logic: base, history: base, memory: base };
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_SESSION);
    localStorage.removeItem(STORAGE_RESULT);
  }

  // ---- Bridge result intake -------------------------------------------------

  /** Pull any pending bridge result, clear it, return it (or null). */
  function takePendingResult() {
    const raw = localStorage.getItem(STORAGE_RESULT);
    if (!raw) return null;
    localStorage.removeItem(STORAGE_RESULT);
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  // ---- Diagnostic logic -----------------------------------------------------

  /**
   * Score a round. Returns:
   *  { percent, band ('good'|'warn'|'weak'), verdict, worked[], didnt[], next[] }
   * Heuristics are intentionally transparent so we can tune them as we dogfood.
   */
  function diagnose(round, stop) {
    const percent = round.max > 0 ? Math.round((round.score / round.max) * 100) : 0;
    const fastRatio = stop.expectedMs ? round.timeMs / stop.expectedMs : 1;

    let band, verdict;
    if (percent >= 85) { band = 'good'; verdict = 'In strike zone — leaning easy'; }
    else if (percent >= 60) { band = 'good'; verdict = 'In strike zone'; }
    else if (percent >= 40) { band = 'warn'; verdict = 'Below target — bordering reinforcement'; }
    else { band = 'weak'; verdict = 'Below target — recommend reinforcement'; }

    const worked = [];
    const didnt = [];
    const next = [];

    if (percent >= 85) worked.push('Strong accuracy — answered most questions correctly.');
    else if (percent >= 60) worked.push('Solid accuracy with room to push harder.');
    if (fastRatio < 0.6 && percent >= 70) worked.push('Quick pace AND accurate — likely ready for a level-up.');
    if (fastRatio >= 0.6 && fastRatio <= 1.3) worked.push('Pace was on-target for the activity.');

    if (percent < 60) didnt.push('Accuracy below 60% — concepts not yet retained.');
    if (fastRatio > 1.6) didnt.push('Pace was notably slow — possible fatigue or difficulty.');
    if (fastRatio < 0.4 && percent < 60) didnt.push('Answered very quickly with low accuracy — may have been guessing or skipped.');
    if (didnt.length === 0) didnt.push('Nothing flagged this round.');

    if (percent >= 85 && fastRatio < 0.8) next.push('Bump ' + stop.skill + ' difficulty up one level.');
    else if (percent < 50) next.push('Drop ' + stop.skill + ' difficulty by one level on next encounter.');
    else next.push('Hold ' + stop.skill + ' level steady — well calibrated.');
    next.push('Print this sheet and review with your child later.');
    if (percent < 60) next.push('Send a reinforcement worksheet in this skill home with the kid.');

    return { percent, band, verdict, worked, didnt, next, fastRatio };
  }

  /** Tiny adaptive bump applied to session.levels after each round. */
  function applyAdaptive(session, stop, percent, fastRatio) {
    const cur = session.levels[stop.skill] ?? 5;
    let next = cur;
    if (percent >= 85 && fastRatio < 0.8) next = Math.min(10, cur + 1);
    else if (percent < 50) next = Math.max(1, cur - 1);
    session.levels[stop.skill] = next;
  }

  // ---- Render helpers -------------------------------------------------------

  function setActiveState(stateName) {
    document.querySelectorAll('.screen').forEach(el => {
      if (el.dataset.state === stateName) el.setAttribute('data-active', '');
      else el.removeAttribute('data-active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fmtTime(ms) {
    const totalSec = Math.round(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function renderIntro(session) {
    const stop = session.plan[session.currentStopIndex];
    const total = session.plan.length;
    const idx = session.currentStopIndex + 1;
    const level = session.levels[stop.skill];

    document.getElementById('intro-greeting').textContent = `Hi ${session.child.name}!`;
    const isFirst = session.currentStopIndex === 0;
    document.getElementById('intro-message').textContent = isFirst
      ? `Welcome to your first journey. We'll travel through ${total} stops — you can rest any time.`
      : `Great work so far. Ready for the next stop?`;

    document.getElementById('intro-stop-index').textContent = `Stop ${idx} of ${total}`;
    document.getElementById('intro-stop-skill').textContent = `${stop.skill} · level ${level}`;
    document.getElementById('intro-stop-title').textContent = stop.label;
    document.getElementById('intro-stop-blurb').textContent = stop.blurb;
  }

  function renderDiagnostic(session, round) {
    const stop = session.plan[round.stopIndex];
    const diag = round.diagnosis;

    document.getElementById('diag-activity').textContent = stop.label;
    document.getElementById('diag-meta').textContent =
      `Stop ${round.stopIndex + 1} of ${session.plan.length} • ${stop.skill} • level ${round.level}`;

    const stamp = document.getElementById('diag-stamp-percent').parentElement;
    stamp.classList.remove('good', 'warn', 'weak');
    stamp.classList.add(diag.band);
    document.getElementById('diag-stamp-percent').textContent = diag.percent + '%';
    document.getElementById('diag-stamp-label').textContent =
      diag.band === 'good' ? 'IN ZONE' : diag.band === 'warn' ? 'BORDERLINE' : 'BELOW TARGET';

    document.getElementById('diag-score').textContent = `${round.score} / ${round.max}`;
    document.getElementById('diag-time').textContent = fmtTime(round.timeMs);
    document.getElementById('diag-level').textContent = round.level;
    document.getElementById('diag-verdict').textContent = diag.verdict;

    fillList('diag-worked', diag.worked);
    fillList('diag-didnt',  diag.didnt);
    fillList('diag-next',   diag.next);

    // Progress strip — one pip per stop, colored by past results.
    const strip = document.getElementById('diag-progress-strip');
    strip.innerHTML = '';
    session.plan.forEach((s, i) => {
      const pip = document.createElement('div');
      pip.className = 'pip';
      const prior = session.log.find(r => r.stopIndex === i);
      if (prior) {
        pip.classList.add('done', prior.diagnosis.band);
        pip.innerHTML = `<div class="pip-label">${s.label}</div><div class="pip-value">${prior.diagnosis.percent}%</div>`;
      } else if (i === round.stopIndex) {
        pip.classList.add('current');
        pip.innerHTML = `<div class="pip-label">${s.label}</div><div class="pip-value">—</div>`;
      } else {
        pip.innerHTML = `<div class="pip-label">${s.label}</div><div class="pip-value">·</div>`;
      }
      strip.appendChild(pip);
    });

    document.getElementById('diag-source').textContent =
      'Result source: ' + (round.source === 'bridge' ? 'activity bridge (automatic)' : 'manual entry (fallback)');
    document.getElementById('diag-stamp-date').textContent = new Date(round.reportedAt).toLocaleString();

    // Manual reporter visibility: show when no bridge result captured.
    const manualEl = document.getElementById('manual-report');
    manualEl.hidden = round.source === 'bridge';
  }

  function fillList(id, items) {
    const el = document.getElementById(id);
    el.innerHTML = '';
    items.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      el.appendChild(li);
    });
  }

  function renderSessionSummary(session, mountId) {
    const el = document.getElementById(mountId);
    if (!session.log.length) { el.innerHTML = '<p class="muted small">No rounds completed yet.</p>'; return; }
    const rows = session.log.map(r => {
      const stop = session.plan[r.stopIndex];
      return `<tr>
        <td>${stop.label}</td>
        <td>${stop.skill}</td>
        <td>${r.diagnosis.percent}%</td>
        <td>${fmtTime(r.timeMs)}</td>
        <td>${r.diagnosis.verdict}</td>
      </tr>`;
    }).join('');
    el.innerHTML = `<table>
      <thead><tr><th>Activity</th><th>Skill</th><th>Score</th><th>Time</th><th>Verdict</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  // ---- Flow controllers -----------------------------------------------------

  function startActivity(session) {
    const stop = session.plan[session.currentStopIndex];
    saveSession(session);

    const params = new URLSearchParams({
      journey: '1',
      jid: session.id,
      stopId: stop.id,
      stopIndex: String(session.currentStopIndex),
      level: String(session.levels[stop.skill]),
      target: String(stop.target),
      childName: session.child.name,
      returnTo: '/journey/?resume=1'
    });

    // Mark when the activity launched so we can compute time-on-task if the
    // bridge doesn't include it (fallback heuristic).
    sessionStorage.setItem('journey:launchAt', String(Date.now()));
    window.location.href = stop.url + '?' + params.toString();
  }

  function ingestRound(session, pending) {
    const stop = session.plan[session.currentStopIndex];
    const launchAt = Number(sessionStorage.getItem('journey:launchAt')) || (Date.now() - 60_000);
    sessionStorage.removeItem('journey:launchAt');

    const round = {
      stopIndex: session.currentStopIndex,
      stopId: stop.id,
      activity: stop.activity,
      level: session.levels[stop.skill],
      score: pending?.score ?? 0,
      max: pending?.max ?? stop.target,
      timeMs: pending?.timeMs ?? (Date.now() - launchAt),
      reportedAt: Date.now(),
      source: pending ? 'bridge' : 'manual',
      notes: pending?.notes || ''
    };

    round.diagnosis = diagnose(round, stop);
    applyAdaptive(session, stop, round.diagnosis.percent, round.diagnosis.fastRatio);
    session.cumulativePlayMs += round.timeMs;
    session.log.push(round);
    saveSession(session);
    return round;
  }

  function advance(session) {
    session.currentStopIndex += 1;
    saveSession(session);
    if (session.currentStopIndex >= session.plan.length) {
      renderSessionSummary(session, 'complete-summary');
      setActiveState('complete');
    } else if (session.cumulativePlayMs >= PARENTAL_GATE_MS) {
      enterParentalGate(session);
    } else {
      renderIntro(session);
      setActiveState('intro');
    }
  }

  function enterParentalGate(session) {
    document.getElementById('parental-name').textContent = session.child.name;
    document.getElementById('parental-time').textContent = Math.round(session.cumulativePlayMs / 60000);
    renderSessionSummary(session, 'parental-summary');

    // Generate a tiny math gate. Two single-digit multiplication.
    const a = 2 + Math.floor(Math.random() * 8);
    const b = 2 + Math.floor(Math.random() * 8);
    document.getElementById('gate-q').textContent = `${a} × ${b} = ?`;
    document.getElementById('gate-answer').value = '';
    document.getElementById('gate-error').hidden = true;
    document.getElementById('gate-submit').onclick = () => {
      const guess = Number(document.getElementById('gate-answer').value);
      if (guess === a * b) {
        // Reset cumulative timer for the next 20-minute window.
        session.cumulativePlayMs = 0;
        saveSession(session);
        renderIntro(session);
        setActiveState('intro');
      } else {
        document.getElementById('gate-error').hidden = false;
      }
    };
    setActiveState('parental');
  }

  // ---- Manual fallback reporter --------------------------------------------

  function bindManualReporter(session) {
    const btn = document.getElementById('manual-save-btn');
    if (!btn) return;
    btn.onclick = () => {
      const round = session.log[session.log.length - 1];
      if (!round) return;
      const stop = session.plan[round.stopIndex];

      const score = Number(document.getElementById('manual-score').value);
      const max   = Number(document.getElementById('manual-max').value) || stop.target;
      const mins  = Number(document.getElementById('manual-mins').value);
      const notes = document.getElementById('manual-notes').value.trim();

      if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return;

      // Roll back the prior diagnosis and re-ingest with manual data.
      session.cumulativePlayMs -= round.timeMs;
      session.log.pop();
      // Roll back the adaptive change applied previously.
      session.levels[stop.skill] = session.levels[stop.skill]; // no-op marker; could implement undo if needed.

      const fakePending = {
        score,
        max,
        timeMs: Number.isFinite(mins) && mins > 0 ? mins * 60_000 : round.timeMs,
        notes
      };
      sessionStorage.setItem('journey:launchAt', String(Date.now() - fakePending.timeMs));
      const fresh = ingestRound(session, fakePending);
      fresh.source = 'manual';
      saveSession(session);
      renderDiagnostic(session, fresh);
    };
  }

  // ---- Event wiring ---------------------------------------------------------

  function bindOnboard() {
    document.getElementById('onboard-form').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const child = {
        name: String(fd.get('name') || '').trim() || 'Friend',
        age: Number(fd.get('age')) || 8,
        parentEmail: String(fd.get('parentEmail') || '').trim()
      };
      const session = newSession(child);
      saveSession(session);
      renderIntro(session);
      setActiveState('intro');
    });
  }

  function bindIntroActions() {
    document.getElementById('begin-stop-btn').onclick = () => {
      const session = loadSession();
      if (session) startActivity(session);
    };

    document.getElementById('skip-stop-btn').onclick = () => {
      // Dogfood path: simulate a returned round so the diagnostic renders.
      const session = loadSession();
      if (!session) return;
      const stop = session.plan[session.currentStopIndex];
      const fakeScore = Math.floor(Math.random() * (stop.target + 1));
      const fakeTime = stop.expectedMs * (0.5 + Math.random() * 1.2);
      sessionStorage.setItem('journey:launchAt', String(Date.now() - fakeTime));
      const round = ingestRound(session, { score: fakeScore, max: stop.target, timeMs: fakeTime });
      // Mark simulated rounds as bridge so the manual reporter stays hidden.
      round.source = 'bridge';
      round.notes = '(simulated for testing)';
      saveSession(session);
      renderDiagnostic(session, round);
      bindManualReporter(session);
      setActiveState('diagnostic');
    };

    document.getElementById('reset-btn').onclick = () => {
      if (confirm('End this session and start over?')) { clearSession(); location.href = '/journey/'; }
    };
  }

  function bindDiagnosticActions() {
    document.getElementById('print-btn').onclick = () => window.print();
    document.getElementById('continue-btn').onclick = () => {
      const session = loadSession();
      if (session) advance(session);
    };
    document.getElementById('reset-btn-2').onclick = () => {
      if (confirm('End this session?')) { clearSession(); location.href = '/journey/'; }
    };
  }

  function bindParentalActions() {
    document.getElementById('print-recap-btn').onclick = () => window.print();
    document.getElementById('end-session-btn').onclick = () => {
      const session = loadSession();
      if (session) {
        renderSessionSummary(session, 'complete-summary');
        setActiveState('complete');
      }
    };
  }

  function bindCompleteActions() {
    document.getElementById('print-final-btn').onclick = () => window.print();
    document.getElementById('restart-btn').onclick = () => { clearSession(); location.href = '/journey/'; };
  }

  // ---- Boot -----------------------------------------------------------------

  function boot() {
    bindOnboard();
    bindIntroActions();
    bindDiagnosticActions();
    bindParentalActions();
    bindCompleteActions();

    const params = new URLSearchParams(location.search);
    if (params.has('reset')) { clearSession(); location.href = '/journey/'; return; }

    let session = loadSession();

    // Returning from an activity?
    if (params.has('resume') && session) {
      const pending = takePendingResult();
      const round = ingestRound(session, pending);
      renderDiagnostic(session, round);
      bindManualReporter(session);
      setActiveState('diagnostic');
      return;
    }

    if (!session) { setActiveState('onboard'); return; }

    renderIntro(session);
    setActiveState('intro');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
