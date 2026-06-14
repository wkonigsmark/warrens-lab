/*
 * Ants & Atlases · Shape Match
 *
 * Identify a country from its outline silhouette. Mechanically identical to
 * Flag Match (same 8-rung combined difficulty ladder, smarter distractors as
 * you climb, streaks, level-up, localStorage progress) — but instead of a flag
 * image it shows the country's shape, rendered from world.geo.json via
 * AACountries.silhouetteSVG().
 */

(function () {
  "use strict";

  const LADDER = [
    { rung: 1, name: "Starter",      tierLabel: "Famous 20", pool: [1],          choices: 2, decoys: "random",    advanceAt: 4 },
    { rung: 2, name: "Explorer",     tierLabel: "Famous 20", pool: [1],          choices: 3, decoys: "random",    advanceAt: 5 },
    { rung: 3, name: "Voyager",      tierLabel: "Top 40",    pool: [1, 2],       choices: 3, decoys: "mixed",     advanceAt: 5 },
    { rung: 4, name: "Navigator",    tierLabel: "Top 40",    pool: [1, 2],       choices: 4, decoys: "mixed",     advanceAt: 6 },
    { rung: 5, name: "Pathfinder",   tierLabel: "Top 80",    pool: [1, 2, 3],    choices: 4, decoys: "continent", advanceAt: 6 },
    { rung: 6, name: "Globetrotter", tierLabel: "Top 80",    pool: [1, 2, 3],    choices: 5, decoys: "continent", advanceAt: 7 },
    { rung: 7, name: "Cartographer", tierLabel: "World Tour",pool: [1, 2, 3, 4], choices: 5, decoys: "continent", advanceAt: 7 },
    { rung: 8, name: "World Master", tierLabel: "World Tour",pool: [1, 2, 3, 4], choices: 6, decoys: "continent", advanceAt: 8 },
  ];

  const STORAGE_KEY = "ants-atlases.shapeMatch.maxRung";

  const state = {
    countries: [],
    rungIndex: 0,
    maxRungUnlocked: 0,
    score: 0,
    streak: 0,
    rungProgress: 0,
    target: null,
    locked: false,
    wcMode: false,
  };

  const el = {
    ladder:   document.getElementById("fm-ladder"),
    shapeCard:document.getElementById("shape-card"),
    choices:  document.getElementById("choices"),
    feedback: document.getElementById("feedback"),
    scoreNum: document.getElementById("score-num"),
    streakNum:document.getElementById("streak-num"),
    overlay:  document.getElementById("levelup-overlay"),
    luTitle:  document.getElementById("levelup-title"),
    luSub:    document.getElementById("levelup-sub"),
    luBtn:    document.getElementById("levelup-continue"),
  };

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function rung() { return LADDER[state.rungIndex]; }
  function poolForRung(r) {
    if (state.wcMode) return state.countries.filter((c) => c.wc2026);
    return state.countries.filter((c) => r.pool.includes(c.level));
  }
  function tierLabelOf(r) { return state.wcMode ? "World Cup 2026" : r.tierLabel; }

  function buildRound() {
    const r = rung();
    const pool = poolForRung(r);
    const target = sample(pool);
    const others = pool.filter((c) => c.iso_a2 !== target.iso_a2);

    let distractorPool;
    if (r.decoys === "continent") {
      const same = others.filter((c) => c.continent === target.continent);
      distractorPool = same.length >= r.choices - 1 ? same : others;
    } else if (r.decoys === "mixed") {
      const same = others.filter((c) => c.continent === target.continent);
      distractorPool = shuffle([...same, ...others]);
    } else {
      distractorPool = others;
    }

    const distractors = shuffle(distractorPool).slice(0, r.choices - 1);
    state.target = target;
    return shuffle([target, ...distractors]);
  }

  function renderRound() {
    state.locked = false;
    const choices = buildRound();

    el.feedback.textContent = "";
    el.feedback.className = "fm-feedback";

    // Render the country silhouette.
    el.shapeCard.classList.remove("revealed");
    el.shapeCard.innerHTML = AACountries.silhouetteSVG(state.target.iso_a2, {
      svgClass: "shape-svg",
      pathClass: "shape-path",
    });
    // Fade in on next frame.
    requestAnimationFrame(() => el.shapeCard.classList.add("revealed"));

    el.choices.innerHTML = "";
    for (const c of choices) {
      const btn = document.createElement("button");
      btn.className = "fm-choice";
      btn.textContent = c.name;
      btn.dataset.iso = c.iso_a2;
      btn.addEventListener("click", () => onChoice(btn, c));
      el.choices.appendChild(btn);
    }
  }

  function onChoice(btn, country) {
    if (state.locked) return;
    const correct = country.iso_a2 === state.target.iso_a2;

    if (correct) {
      state.locked = true;
      btn.classList.add("correct");
      state.score += 1;
      state.streak += 1;
      state.rungProgress += 1;
      updateScoreboard();
      el.feedback.textContent = `✓ ${state.target.name}!`;
      el.feedback.className = "fm-feedback good";

      const reachedGoal = state.rungProgress >= rung().advanceAt;
      setTimeout(() => {
        if (reachedGoal && state.rungIndex < LADDER.length - 1) {
          levelUp();
        } else {
          if (reachedGoal) state.rungProgress = 0;
          renderRound();
        }
      }, 900);
    } else {
      btn.classList.add("wrong");
      btn.disabled = true;
      state.streak = 0;
      updateScoreboard();
      el.feedback.textContent = "Not quite — try again!";
      el.feedback.className = "fm-feedback bad";
    }
  }

  function levelUp() {
    state.rungIndex += 1;
    state.rungProgress = 0;
    if (state.rungIndex > state.maxRungUnlocked) {
      state.maxRungUnlocked = state.rungIndex;
      saveProgress();
    }
    const r = rung();
    el.luTitle.textContent = `Level ${r.rung}: ${r.name}!`;
    el.luSub.textContent = `${tierLabelOf(r)} · ${r.choices} choices`;
    el.overlay.classList.remove("hidden");
    renderLadder();
  }

  function renderLadder() {
    el.ladder.innerHTML = "";
    LADDER.forEach((r, i) => {
      const chip = document.createElement("button");
      chip.className = "fm-rung";
      const unlocked = i <= state.maxRungUnlocked;
      if (i === state.rungIndex) chip.classList.add("active");
      if (!unlocked) chip.classList.add("locked");
      chip.innerHTML = `<span class="fm-rung-num">${r.rung}</span><span class="fm-rung-name">${r.name}</span>`;
      chip.title = unlocked ? `${tierLabelOf(r)} · ${r.choices} choices` : "Locked — keep playing to unlock";
      if (unlocked) {
        chip.addEventListener("click", () => {
          if (state.locked) return;
          state.rungIndex = i;
          state.rungProgress = 0;
          renderLadder();
          renderRound();
        });
      } else {
        chip.disabled = true;
      }
      el.ladder.appendChild(chip);
    });
  }

  function updateScoreboard() {
    el.scoreNum.textContent = state.score;
    el.streakNum.textContent = state.streak;
  }

  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, String(state.maxRungUnlocked)); } catch (e) {}
  }
  function loadProgress() {
    try {
      const v = parseInt(localStorage.getItem(STORAGE_KEY), 10);
      if (!isNaN(v) && v >= 0 && v < LADDER.length) state.maxRungUnlocked = v;
    } catch (e) {}
  }

  async function init() {
    el.luBtn.addEventListener("click", () => {
      el.overlay.classList.add("hidden");
      renderRound();
    });

    try {
      await AACountries.load();
    } catch (e) {
      el.feedback.textContent = "Could not load map data.";
      el.feedback.className = "fm-feedback bad";
      console.error("Shape Match: failed to load atlas/geo data", e);
      return;
    }

    // Pool: curated countries (soft data) that also have a drawable silhouette.
    state.countries = AACountries.allCountries().filter(
      (c) => c.landmark && c.iso_a2 && AACountries.silhouette(c.iso_a2)
    );

    // Mode switch: World Tour (levels) vs World Cup 2026 (slice).
    const modeButtons = document.querySelectorAll(".fm-mode-btn");
    modeButtons.forEach((btn) =>
      btn.addEventListener("click", () => {
        const wc = btn.dataset.mode === "wc";
        if (wc === state.wcMode) return;
        state.wcMode = wc;
        modeButtons.forEach((b) => b.classList.toggle("active", b === btn));
        state.rungProgress = 0;
        renderLadder();
        renderRound();
      })
    );

    loadProgress();
    state.rungIndex = state.maxRungUnlocked;
    updateScoreboard();
    renderLadder();
    renderRound();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
