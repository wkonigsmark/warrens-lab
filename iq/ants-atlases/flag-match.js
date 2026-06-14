/*
 * Ants & Atlases · Flag Match
 *
 * A multiple-choice flag identification game with a combined difficulty ladder.
 * Each rung ramps the country pool (L1 Famous 20 → L4 World Tour) AND the
 * number of answer choices (2 → 6) together, so learners make achievable strides.
 *
 * Distractors get smarter as you climb: early rungs pull random wrong answers,
 * higher rungs pull same-continent decoys so it's a true test of flag knowledge.
 *
 * Data: data/atlas.json — uses only curated countries (those with soft data),
 * each of which carries a `level` (1-4), `name`, `continent`, and `flag_svg`.
 */

(function () {
  "use strict";

  // ---- The combined difficulty ladder -------------------------------------
  // pool: which atlas tiers are eligible. choices: number of buttons.
  // decoys: how wrong answers are chosen. advanceAt: correct-in-a-row to level up.
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

  const STORAGE_KEY = "ants-atlases.flagMatch.maxRung";

  // ---- State --------------------------------------------------------------
  const state = {
    countries: [],        // all curated countries
    rungIndex: 0,         // current ladder index
    maxRungUnlocked: 0,   // highest rung the learner has reached
    score: 0,
    streak: 0,
    rungProgress: 0,      // correct-in-a-row at the current rung
    target: null,         // current correct country
    locked: false,        // true while resolving / animating a round
    wcMode: false,        // World Cup 2026 slice instead of the level pools
  };

  // ---- DOM ----------------------------------------------------------------
  const el = {
    ladder:   document.getElementById("fm-ladder"),
    flagImg:  document.getElementById("flag-img"),
    flagCard: document.getElementById("flag-card"),
    choices:  document.getElementById("choices"),
    feedback: document.getElementById("feedback"),
    scoreNum: document.getElementById("score-num"),
    streakNum:document.getElementById("streak-num"),
    overlay:  document.getElementById("levelup-overlay"),
    luTitle:  document.getElementById("levelup-title"),
    luSub:    document.getElementById("levelup-sub"),
    luBtn:    document.getElementById("levelup-continue"),
  };

  // ---- Helpers ------------------------------------------------------------
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function flagUrl(country) {
    // flag_svg is a crisp flagcdn URL e.g. https://flagcdn.com/fr.svg
    return country.flag_svg || `https://flagcdn.com/${country.iso_a2.toLowerCase()}.svg`;
  }

  function rung() { return LADDER[state.rungIndex]; }

  // In World Cup mode the universe is the 2026 roster (the rung still controls
  // choice count + decoy strategy). Otherwise it's the rung's level pool.
  function poolForRung(r) {
    if (state.wcMode) return state.countries.filter((c) => c.wc2026);
    return state.countries.filter((c) => r.pool.includes(c.level));
  }

  function tierLabelOf(r) {
    return state.wcMode ? "World Cup 2026" : r.tierLabel;
  }

  // ---- Build the answer set for a round -----------------------------------
  function buildRound() {
    const r = rung();
    const pool = poolForRung(r);
    const target = sample(pool);

    // Choose distractors based on the rung's decoy strategy.
    const others = pool.filter((c) => c.iso_a2 !== target.iso_a2);
    let distractorPool;

    if (r.decoys === "continent") {
      const sameContinent = others.filter((c) => c.continent === target.continent);
      // Fall back to the whole pool if the continent is too sparse.
      distractorPool = sameContinent.length >= r.choices - 1 ? sameContinent : others;
    } else if (r.decoys === "mixed") {
      const sameContinent = others.filter((c) => c.continent === target.continent);
      // Blend: prefer some same-continent decoys but keep a couple random.
      distractorPool = shuffle([...sameContinent, ...others]);
    } else {
      distractorPool = others;
    }

    const distractors = shuffle(distractorPool).slice(0, r.choices - 1);
    const choices = shuffle([target, ...distractors]);

    state.target = target;
    return choices;
  }

  // ---- Render a round -----------------------------------------------------
  function renderRound() {
    state.locked = false;
    const choices = buildRound();

    el.feedback.textContent = "";
    el.feedback.className = "fm-feedback";

    // Flag (fade in once loaded to avoid a flash of the previous flag)
    el.flagCard.classList.remove("revealed");
    el.flagImg.onload = () => el.flagCard.classList.add("revealed");
    el.flagImg.src = flagUrl(state.target);
    el.flagImg.alt = "Flag of a country — guess which one";

    // Choice buttons
    el.choices.innerHTML = "";
    el.choices.style.setProperty("--choice-count", choices.length);
    for (const c of choices) {
      const btn = document.createElement("button");
      btn.className = "fm-choice";
      btn.textContent = c.name;
      btn.dataset.iso = c.iso_a2;
      btn.addEventListener("click", () => onChoice(btn, c));
      el.choices.appendChild(btn);
    }
  }

  // ---- Handle a guess -----------------------------------------------------
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
          if (reachedGoal) state.rungProgress = 0; // already at max rung; reset goal meter
          renderRound();
        }
      }, 900);
    } else {
      // Wrong: mark it, break the streak, let them try again.
      btn.classList.add("wrong");
      btn.disabled = true;
      state.streak = 0;
      updateScoreboard();
      el.feedback.textContent = "Not quite — try again!";
      el.feedback.className = "fm-feedback bad";
    }
  }

  // ---- Level up -----------------------------------------------------------
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

  // ---- Ladder UI ----------------------------------------------------------
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

  // ---- Scoreboard ---------------------------------------------------------
  function updateScoreboard() {
    el.scoreNum.textContent = state.score;
    el.streakNum.textContent = state.streak;
  }

  // ---- Persistence --------------------------------------------------------
  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, String(state.maxRungUnlocked)); } catch (e) {}
  }
  function loadProgress() {
    try {
      const v = parseInt(localStorage.getItem(STORAGE_KEY), 10);
      if (!isNaN(v) && v >= 0 && v < LADDER.length) state.maxRungUnlocked = v;
    } catch (e) {}
  }

  // ---- Boot ---------------------------------------------------------------
  async function init() {
    el.luBtn.addEventListener("click", () => {
      el.overlay.classList.add("hidden");
      renderRound();
    });

    try {
      const res = await fetch("data/atlas.json");
      const data = await res.json();
      // Only curated countries (those with hand-authored soft fields) carry a
      // reliable level + recognizable profile. `landmark` is a good proxy.
      state.countries = data.countries.filter((c) => c.landmark && c.flag_svg && c.iso_a2);
    } catch (e) {
      el.feedback.textContent = "Could not load atlas data.";
      el.feedback.className = "fm-feedback bad";
      console.error("Flag Match: failed to load atlas.json", e);
      return;
    }

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
    state.rungIndex = state.maxRungUnlocked; // resume at the furthest unlocked rung
    updateScoreboard();
    renderLadder();
    renderRound();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
