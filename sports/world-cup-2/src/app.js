import {
  FALLBACK_RANKINGS,
  FALLBACK_SCHEDULE,
  getFlagCode,
  parseCSV
} from '../../world-cup/src/data.js';

const GROUPS = 'ABCDEFGHIJKL'.split('');
const app = document.getElementById('app');

const rankings = parseCSV(FALLBACK_RANKINGS).slice(1).map(([name, group, wIndex, status]) => ({
  name,
  group,
  wIndex: Number(String(wIndex).replace('%', '')) || 0,
  status
}));

const rankingByName = new Map(rankings.map(team => [team.name, team]));
const groups = buildGroupsFromSchedule();

const state = {
  step: 'welcome',
  activeGroupIndex: 0,
  entry: {
    bracketName: '',
    venmo: ''
  },
  groupPicks: Object.fromEntries(GROUPS.map(group => [group, []])),
  thirdPicks: []
};

function buildGroupsFromSchedule() {
  const schedule = parseCSV(FALLBACK_SCHEDULE);
  const headers = schedule[0] || [];
  const team1Idx = headers.indexOf('Team 1');
  const team2Idx = headers.indexOf('Team 2');
  const grouped = Object.fromEntries(GROUPS.map(group => [group, []]));
  const seenByGroup = Object.fromEntries(GROUPS.map(group => [group, new Set()]));

  schedule.slice(1).forEach(row => {
    [row[team1Idx], row[team2Idx]].forEach(teamName => {
      const team = rankingByName.get(teamName);
      if (!team || seenByGroup[team.group].has(team.name)) return;
      seenByGroup[team.group].add(team.name);
      grouped[team.group].push(team);
    });
  });

  GROUPS.forEach(group => {
    grouped[group].sort((a, b) => b.wIndex - a.wIndex);
  });

  return grouped;
}

function teamFlag(teamName, size = 80) {
  return `https://flagcdn.com/w${size}/${getFlagCode(teamName)}.png`;
}

function render(resetScroll = false) {
  if (state.step === 'welcome') renderWelcome();
  if (state.step === 'intro') renderIntro();
  if (state.step === 'groups') renderGroupPicker();
  if (state.step === 'thirds') renderThirdPlacePicker();
  if (state.step === 'bracket') renderBracketPreview();
  if (resetScroll) window.scrollTo(0, 0);
}

function renderWelcome() {
  app.innerHTML = `
    <section class="welcome-screen">
      <div class="brand-lockup">
        <span class="eyebrow">World Cup Pool</span>
        <h1>Build your bracket.</h1>
        <p>Fast picks, clean bracket, no spreadsheet nonsense.</p>
      </div>

      <div class="welcome-steps" aria-label="How to enter">
        <article>
          <span class="rank-number">1</span>
          <div>
            <strong>Fill out your picks</strong>
            <small>Rank all 12 groups, then choose which third-place teams advance.</small>
          </div>
        </article>
        <article>
          <span class="rank-number">2</span>
          <div>
            <strong>Name your bracket</strong>
            <small>Add a unique bracket name and Venmo handle so payment can be matched later.</small>
          </div>
        </article>
        <article>
          <span class="rank-number">3</span>
          <div>
            <strong>Send Venmo</strong>
            <small>Once your bracket is in, send payment separately.</small>
          </div>
        </article>
      </div>

      <div class="welcome-actions">
        <button class="primary-action" id="welcome-start-btn" type="button">Start My Bracket</button>
        <a class="rules-link" href="#rules">Pool rules</a>
      </div>
    </section>
  `;

  document.getElementById('welcome-start-btn').addEventListener('click', () => {
    state.step = 'intro';
    render(true);
  });
}

function renderIntro() {
  app.innerHTML = `
    <section class="intro-screen">
      <div class="brand-lockup">
        <span class="eyebrow">World Cup Pool</span>
        <h1>Who’s picking?</h1>
        <p>Add the name and Venmo handle for this bracket.</p>
      </div>

      <form id="entry-form" class="entry-card">
        <label>
          <span>Bracket name</span>
          <input id="bracket-name" type="text" autocomplete="nickname" placeholder="Warren's Winners" value="${escapeAttr(state.entry.bracketName)}" required>
        </label>
        <label>
          <span>Venmo handle</span>
          <input id="venmo" type="text" autocapitalize="off" autocomplete="off" placeholder="@yourhandle" value="${escapeAttr(state.entry.venmo)}" required>
        </label>
        <button class="primary-action" type="submit">Start Group A</button>
      </form>
    </section>
  `;

  document.getElementById('entry-form').addEventListener('submit', event => {
    event.preventDefault();
    state.entry.bracketName = document.getElementById('bracket-name').value.trim();
    state.entry.venmo = normalizeVenmo(document.getElementById('venmo').value);
    state.step = 'groups';
    render(true);
  });
}

function renderGroupPicker() {
  const group = GROUPS[state.activeGroupIndex];
  const picks = state.groupPicks[group];
  const remaining = groups[group].filter(team => !picks.includes(team.name));

  app.innerHTML = `
    ${renderTopBar(`Group ${group}`, state.activeGroupIndex + 1, GROUPS.length)}
    <section class="pick-screen">
      <div class="screen-copy">
        <span class="eyebrow">Final Standings</span>
        <h1>Rank Group ${group}</h1>
      </div>

      <div class="rank-stack" aria-label="Selected Group ${group} order">
        ${[0, 1, 2, 3].map(index => renderRankSlot(index, picks[index], 'group')).join('')}
      </div>

      <div class="team-grid" aria-label="Available Group ${group} teams">
        ${remaining.map(team => renderTeamButton(team, 'group-team')).join('')}
      </div>
    </section>

    <nav class="bottom-nav">
      <button class="secondary-action" id="back-btn" ${state.activeGroupIndex === 0 ? 'disabled' : ''}>Back</button>
      <button class="ghost-action" id="clear-btn" ${picks.length === 0 ? 'disabled' : ''}>Clear</button>
      <button class="primary-action compact" id="next-btn" ${picks.length !== 4 ? 'disabled' : ''}>${state.activeGroupIndex === GROUPS.length - 1 ? 'Pick Thirds' : `Group ${GROUPS[state.activeGroupIndex + 1]}`}</button>
    </nav>
  `;

  app.querySelectorAll('[data-team]').forEach(button => {
    button.addEventListener('click', () => {
      const teamName = button.dataset.team;
      if (picks.length < 4) {
        picks.push(teamName);
        autoFillFinalGroupSlot(group);
        render();
      }
    });
  });

  app.querySelectorAll('[data-remove-index]').forEach(button => {
    button.addEventListener('click', () => {
      picks.splice(Number(button.dataset.removeIndex), 1);
      render();
    });
  });

  document.getElementById('clear-btn').addEventListener('click', () => {
    state.groupPicks[group] = [];
    render();
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    if (state.activeGroupIndex > 0) {
      state.activeGroupIndex -= 1;
      render(true);
    }
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    if (picks.length !== 4) return;
    if (state.activeGroupIndex < GROUPS.length - 1) {
      state.activeGroupIndex += 1;
    } else {
      state.step = 'thirds';
      state.thirdPicks = state.thirdPicks.filter(teamName => getThirdPlaceTeams().some(team => team.name === teamName));
    }
    render(true);
  });
}

function renderThirdPlacePicker() {
  const thirdTeams = getThirdPlaceTeams();
  const remaining = thirdTeams.filter(team => !state.thirdPicks.includes(team.name));

  app.innerHTML = `
    ${renderTopBar('Third Place', state.thirdPicks.length, 8)}
    <section class="pick-screen">
      <div class="screen-copy">
        <span class="eyebrow">Round of 32 Gate</span>
        <h1>Pick the top 8 third-place teams</h1>
      </div>

      <div class="rank-stack top-eight" aria-label="Selected third-place order">
        ${Array.from({ length: 8 }, (_, index) => renderRankSlot(index, state.thirdPicks[index], 'third')).join('')}
      </div>

      <div class="team-grid" aria-label="Available third-place teams">
        ${remaining.map(team => renderTeamButton(team, 'third-team', `Group ${team.group} · ${team.wIndex.toFixed(1)} W-index`)).join('')}
      </div>
    </section>

    <nav class="bottom-nav">
      <button class="secondary-action" id="back-btn">Back</button>
      <button class="ghost-action" id="clear-btn" ${state.thirdPicks.length === 0 ? 'disabled' : ''}>Clear</button>
      <button class="primary-action compact" id="finish-btn" ${state.thirdPicks.length !== 8 ? 'disabled' : ''}>Build R32</button>
    </nav>
  `;

  app.querySelectorAll('[data-team]').forEach(button => {
    button.addEventListener('click', () => {
      if (state.thirdPicks.length < 8) {
        state.thirdPicks.push(button.dataset.team);
        render();
      }
    });
  });

  app.querySelectorAll('[data-remove-index]').forEach(button => {
    button.addEventListener('click', () => {
      state.thirdPicks.splice(Number(button.dataset.removeIndex), 1);
      render();
    });
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    state.step = 'groups';
    state.activeGroupIndex = GROUPS.length - 1;
    render(true);
  });

  document.getElementById('clear-btn').addEventListener('click', () => {
    state.thirdPicks = [];
    render();
  });

  document.getElementById('finish-btn').addEventListener('click', () => {
    if (state.thirdPicks.length !== 8) return;
    state.step = 'bracket';
    render(true);
  });
}

function renderBracketPreview() {
  const bracket = buildRoundOf32();
  const topThirdGroups = state.thirdPicks.map(teamName => getTeam(teamName).group).sort().join('');

  app.innerHTML = `
    ${renderTopBar('Round of 32', 1, 1)}
    <section class="bracket-screen">
      <div class="screen-copy">
        <span class="eyebrow">${escapeHtml(state.entry.bracketName)} · ${escapeHtml(state.entry.venmo)}</span>
        <h1>Group-stage entry built</h1>
        <p class="subtle">Third-place key: ${topThirdGroups}</p>
      </div>

      <div class="bracket-list">
        ${bracket.map(match => `
          <article class="match-card">
            <div class="match-number">Match ${match.id}</div>
            ${renderMatchTeam(match.t1, match.t1Desc)}
            <div class="versus">vs</div>
            ${renderMatchTeam(match.t2, match.t2Desc)}
          </article>
        `).join('')}
      </div>
    </section>

    <nav class="bottom-nav two-up">
      <button class="secondary-action" id="back-btn">Back</button>
      <button class="primary-action compact" id="review-btn">Review Groups</button>
    </nav>
  `;

  document.getElementById('back-btn').addEventListener('click', () => {
    state.step = 'thirds';
    render(true);
  });

  document.getElementById('review-btn').addEventListener('click', () => {
    state.step = 'groups';
    state.activeGroupIndex = 0;
    render(true);
  });
}

function renderTopBar(label, complete, total) {
  const progress = Math.round((complete / total) * 100);
  return `
    <header class="top-bar">
      <div>
        <span class="top-kicker">World Cup Pool</span>
        <strong>${label}</strong>
      </div>
      <div class="progress-pill">${complete}/${total}</div>
      <div class="progress-track" aria-hidden="true">
        <span style="width: ${progress}%"></span>
      </div>
    </header>
  `;
}

function renderRankSlot(index, teamName, mode) {
  if (!teamName) {
    return `
      <button class="rank-slot empty" type="button" disabled>
        <span class="rank-number">${index + 1}</span>
        <span>Tap a team</span>
      </button>
    `;
  }

  const team = getTeam(teamName);
  return `
    <button class="rank-slot filled" type="button" data-remove-index="${index}" aria-label="Remove ${escapeAttr(teamName)} from rank ${index + 1}">
      <span class="rank-number">${index + 1}</span>
      <img src="${teamFlag(teamName)}" alt="">
      <span>
        <strong>${escapeHtml(teamName)}</strong>
        <small>${mode === 'third' ? `Group ${team.group}` : `${team.wIndex.toFixed(1)} W-index`}</small>
      </span>
    </button>
  `;
}

function renderTeamButton(team, className, meta = `${team.wIndex.toFixed(1)} W-index`) {
  return `
    <button class="team-pick ${className}" type="button" data-team="${escapeAttr(team.name)}">
      <img src="${teamFlag(team.name)}" alt="">
      <span>
        <strong>${escapeHtml(team.name)}</strong>
        <small>${escapeHtml(meta)}</small>
      </span>
    </button>
  `;
}

function renderMatchTeam(teamName, descriptor) {
  return `
    <div class="match-team">
      <img src="${teamFlag(teamName)}" alt="">
      <span>
        <strong>${escapeHtml(teamName)}</strong>
        <small>${escapeHtml(descriptor)}</small>
      </span>
    </div>
  `;
}

function getThirdPlaceTeams() {
  return GROUPS.map(group => {
    const teamName = state.groupPicks[group][2];
    return teamName ? getTeam(teamName) : null;
  }).filter(Boolean);
}

function autoFillFinalGroupSlot(group) {
  const picks = state.groupPicks[group];
  if (picks.length !== 3) return;

  const finalTeam = groups[group].find(team => !picks.includes(team.name));
  if (finalTeam) picks.push(finalTeam.name);
}

function buildRoundOf32() {
  const advancingThirdGroups = state.thirdPicks
    .map(teamName => getTeam(teamName).group)
    .sort();
  const key = advancingThirdGroups.join('');
  const mapping = window.BRACKET_LOOKUP?.[key] || {};

  const getSeed = (rank, group) => state.groupPicks[group][rank - 1] || 'TBD';
  const getThird = group => {
    const teamName = state.thirdPicks.find(name => getTeam(name).group === group);
    return teamName || 'TBD';
  };
  const thirdGroup = seed => seed?.replace('3', '') || '?';

  return [
    { id: 73, t1Desc: 'Winner E', t2Desc: `3rd Group ${thirdGroup(mapping.E)}`, t1: getSeed(1, 'E'), t2: getThird(thirdGroup(mapping.E)) },
    { id: 74, t1Desc: 'Winner I', t2Desc: `3rd Group ${thirdGroup(mapping.I)}`, t1: getSeed(1, 'I'), t2: getThird(thirdGroup(mapping.I)) },
    { id: 75, t1Desc: 'Runner-up A', t2Desc: 'Runner-up B', t1: getSeed(2, 'A'), t2: getSeed(2, 'B') },
    { id: 76, t1Desc: 'Winner F', t2Desc: 'Runner-up C', t1: getSeed(1, 'F'), t2: getSeed(2, 'C') },
    { id: 77, t1Desc: 'Winner C', t2Desc: 'Runner-up F', t1: getSeed(1, 'C'), t2: getSeed(2, 'F') },
    { id: 78, t1Desc: 'Runner-up E', t2Desc: 'Runner-up I', t1: getSeed(2, 'E'), t2: getSeed(2, 'I') },
    { id: 79, t1Desc: 'Winner A', t2Desc: `3rd Group ${thirdGroup(mapping.A)}`, t1: getSeed(1, 'A'), t2: getThird(thirdGroup(mapping.A)) },
    { id: 80, t1Desc: 'Winner L', t2Desc: `3rd Group ${thirdGroup(mapping.L)}`, t1: getSeed(1, 'L'), t2: getThird(thirdGroup(mapping.L)) },
    { id: 81, t1Desc: 'Runner-up K', t2Desc: 'Runner-up L', t1: getSeed(2, 'K'), t2: getSeed(2, 'L') },
    { id: 82, t1Desc: 'Winner H', t2Desc: 'Runner-up J', t1: getSeed(1, 'H'), t2: getSeed(2, 'J') },
    { id: 83, t1Desc: 'Winner D', t2Desc: `3rd Group ${thirdGroup(mapping.D)}`, t1: getSeed(1, 'D'), t2: getThird(thirdGroup(mapping.D)) },
    { id: 84, t1Desc: 'Winner G', t2Desc: `3rd Group ${thirdGroup(mapping.G)}`, t1: getSeed(1, 'G'), t2: getThird(thirdGroup(mapping.G)) },
    { id: 85, t1Desc: 'Winner B', t2Desc: `3rd Group ${thirdGroup(mapping.B)}`, t1: getSeed(1, 'B'), t2: getThird(thirdGroup(mapping.B)) },
    { id: 86, t1Desc: 'Winner K', t2Desc: `3rd Group ${thirdGroup(mapping.K)}`, t1: getSeed(1, 'K'), t2: getThird(thirdGroup(mapping.K)) },
    { id: 87, t1Desc: 'Winner J', t2Desc: 'Runner-up H', t1: getSeed(1, 'J'), t2: getSeed(2, 'H') },
    { id: 88, t1Desc: 'Runner-up D', t2Desc: 'Runner-up G', t1: getSeed(2, 'D'), t2: getSeed(2, 'G') }
  ];
}

function getTeam(teamName) {
  return rankingByName.get(teamName) || { name: teamName, group: '?', wIndex: 0 };
}

function normalizeVenmo(value) {
  const cleaned = value.trim().replace(/^@+/, '');
  return cleaned ? `@${cleaned}` : '';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

window.addEventListener('keydown', event => {
  if (event.key !== 'Enter') return;
  if (event.target instanceof HTMLInputElement) return;

  const advanceButton = document.getElementById('next-btn')
    || document.getElementById('welcome-start-btn')
    || document.getElementById('finish-btn')
    || document.getElementById('review-btn');

  if (advanceButton && !advanceButton.disabled) {
    event.preventDefault();
    advanceButton.click();
  }
});

render();
