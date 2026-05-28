/**
 * Orbis Mission — UI controller for the "Locate the country" quiz.
 *
 * Drives an OrbisQuiz session in 'mission' mode. Lighter than Geocode:
 * - A top HUD strip shows round counter, target name, score, and an End button.
 * - Country clicks become guesses.
 * - Wrong guesses drop warm/cold breadcrumbs and flash a distance toast.
 * - Right guess auto-advances to the next round after a brief celebration.
 * - At session end (default 10 rounds), a summary modal shows score, attempts, time, and a round-by-round breakdown.
 *
 * Country clicks on the map route to OrbisMission.handleMapClick() when isActive() is true.
 *
 * Public API:
 *   OrbisMission.init()
 *   OrbisMission.start()
 *   OrbisMission.stop()
 *   OrbisMission.isActive()
 *   OrbisMission.handleMapClick(iso2, country)
 */
(function (global) {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const TIMING = {
    correctAdvance: 1100,
    wrongFlash: 600
  };

  const state = {
    initialized: false,
    active: false,
    session: null,
    totalAttempts: 0,
    roundStartAttempts: 0,
    roundHistory: [],
    dom: {}
  };

  function init() {
    if (state.initialized) return;
    state.dom = {
      strip:            document.getElementById("mission-strip"),
      statusDisplay:    document.getElementById("status-display"),
      targetName:       document.getElementById("mission-target-name"),
      roundCurrent:     document.getElementById("mission-round-current"),
      roundTotal:       document.getElementById("mission-round-total"),
      score:            document.getElementById("mission-score"),
      exitBtn:          document.getElementById("mission-exit"),
      summary:          document.getElementById("mission-summary-overlay"),
      summaryTitle:     document.getElementById("mission-summary-title"),
      summaryScore:     document.getElementById("summary-score"),
      summaryAttempts:  document.getElementById("summary-attempts"),
      summaryTime:      document.getElementById("summary-time"),
      summaryDetail:    document.getElementById("summary-detail"),
      summaryAgain:     document.getElementById("mission-summary-again"),
      summaryHome:      document.getElementById("mission-summary-home"),
      summaryClose:     document.getElementById("mission-summary-close"),
      toast:            document.getElementById("distance-toast"),
      svg:              document.getElementById("world-map")
    };
    state.dom.exitBtn.addEventListener("click", stop);
    state.dom.summaryAgain.addEventListener("click", () => { closeSummary(); start(); });
    state.dom.summaryHome.addEventListener("click", () => { closeSummary(); goHome(); });
    state.dom.summaryClose.addEventListener("click", closeSummary);
    state.initialized = true;
  }

  // ----- Lifecycle -------------------------------------------------------

  function start() {
    init();
    if (state.active) return; // already running

    state.active = true;
    state.totalAttempts = 0;
    state.roundStartAttempts = 0;
    state.roundHistory = [];
    clearBreadcrumbs();
    closeSummary();

    state.dom.statusDisplay.classList.add("hidden");
    state.dom.strip.classList.add("active");
    // Hide country ISO labels while Mission is active — they're cheat helpers
    document.body.classList.add("mission-active");
    // Reset any region zoom — Mission always uses the world view
    if (window.OrbisCountries) OrbisCountries.resetViewBox(state.dom.svg);

    state.session = OrbisQuiz.start({
      mode: "mission",
      pool: { type: "all" },
      rounds: 10,
      autoStart: false,  // we'll kick off the first round manually so state.session is assigned first
      hooks: {
        onRoundStart: t => onRoundStart(t),
        onGuess:      r => onGuess(r),
        onRoundEnd:   o => onRoundEnd(o),
        onSessionEnd: s => onSessionEnd(s)
      }
    });
    state.session.nextRound();
  }

  function stop() {
    if (!state.active) return;
    state.active = false;
    if (state.session) state.session.end();
    state.session = null;
    state.dom.strip.classList.remove("active");
    state.dom.statusDisplay.classList.remove("hidden");
    document.body.classList.remove("mission-active");
    clearBreadcrumbs();
  }

  function isActive() { return state.active; }

  function handleMapClick(iso2, country) {
    if (!state.active || !state.session) return;
    if (!country) return; // not in pool — ignore
    state.session.guess(iso2);
  }

  // ----- Hook handlers --------------------------------------------------

  function onRoundStart(target) {
    const s = state.session.getState();
    state.dom.targetName.textContent = target.name.toUpperCase();
    state.dom.roundCurrent.textContent = s.roundIndex;
    state.dom.roundTotal.textContent = s.rounds;
    state.dom.score.textContent = s.score;
    state.roundStartAttempts = state.totalAttempts;
    clearBreadcrumbs();
  }

  function onGuess(result) {
    state.totalAttempts += 1;
    if (result.correct) {
      flashCountry(result.guess_iso2, "correct");
    } else {
      flashCountry(result.guess_iso2, "wrong");
      dropBreadcrumb(result);
      showDistanceToast(result);
    }
  }

  function onRoundEnd(outcome) {
    const attempts = state.totalAttempts - state.roundStartAttempts;
    state.roundHistory.push({
      iso_a2: outcome.target.iso_a2,
      name: outcome.target.name,
      attempts,
      won: outcome.won !== false
    });
    state.dom.score.textContent = state.session.getState().score;

    // Auto-advance to next round (or session end fires)
    setTimeout(() => {
      if (state.active && state.session) state.session.nextRound();
    }, TIMING.correctAdvance);
  }

  function onSessionEnd(summary) {
    state.active = false;
    state.dom.strip.classList.remove("active");
    state.dom.statusDisplay.classList.remove("hidden");
    document.body.classList.remove("mission-active");
    showSummary(summary);
  }

  // ----- Summary --------------------------------------------------------

  function showSummary(summary) {
    const perfect = summary.score === summary.rounds;
    state.dom.summaryTitle.textContent = perfect ? "Perfect Mission!" : "Mission Complete";
    state.dom.summaryScore.textContent = `${summary.score} / ${summary.rounds}`;
    state.dom.summaryAttempts.textContent = state.totalAttempts;
    state.dom.summaryTime.textContent = formatTime(summary.durationMs);
    state.dom.summaryDetail.innerHTML = state.roundHistory.map((r, i) => `
      <div class="summary-row">
        <span class="summary-row-num">${i + 1}.</span>
        <span class="summary-row-name">${escapeHtml(r.name)}</span>
        <span class="summary-row-tries">${r.attempts} ${r.attempts === 1 ? "try" : "tries"}</span>
      </div>
    `).join("");
    state.dom.summary.classList.add("visible");
  }

  function closeSummary() {
    state.dom.summary.classList.remove("visible");
  }

  // "Home" — exit the Mission flow back to the base Continents view.
  // We trigger the existing toolbar button so all the right side effects fire
  // (currentView swap, renderMap, status reset) without reaching into script.js internals.
  function goHome() {
    const btn = document.getElementById("view-continents-btn");
    if (btn) btn.click();
  }

  // ----- Map decoration (shared visual language with Geocode) ----------

  function warmth(km) {
    if (km < 1500)  return { label: "Burning hot", cls: "burning", emoji: "🔥" };
    if (km < 4000)  return { label: "Warm",        cls: "warm",     emoji: "🌡️" };
    if (km < 8000)  return { label: "Cool",        cls: "cool",     emoji: "🌬️" };
    return              { label: "Ice cold",   cls: "cold",     emoji: "🧊" };
  }

  function formatKm(km) {
    if (km < 1000) return `${km} km`;
    return `${(km / 1000).toFixed(km < 10000 ? 1 : 0)}k km`;
  }

  function flashCountry(iso2, kind) {
    const path = document.querySelector(`path[data-iso2="${iso2}"]`);
    if (!path) return;
    const cls = kind === "correct" ? "correct-flash" : "incorrect-flash";
    path.classList.add(cls);
    setTimeout(() => path.classList.remove(cls), kind === "correct" ? TIMING.correctAdvance : TIMING.wrongFlash);
  }

  function getBreadcrumbsGroup() {
    let g = document.getElementById("mission-breadcrumbs");
    if (!g) {
      g = document.createElementNS(SVG_NS, "g");
      g.id = "mission-breadcrumbs";
      state.dom.svg.appendChild(g);
    }
    return g;
  }

  function clearBreadcrumbs() {
    const g = document.getElementById("mission-breadcrumbs");
    if (g) g.innerHTML = "";
  }

  function dropBreadcrumb(result) {
    const feature = OrbisCountries.getFeature(result.guess_iso2);
    if (!feature) return;
    const [cx, cy] = OrbisCountries.centroidOfFeature(feature);
    if (cx == null) return;
    const g = getBreadcrumbsGroup();
    const w = warmth(result.distance_km);
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", -cy);
    circle.setAttribute("r", 120);
    circle.setAttribute("class", `breadcrumb-dot ${w.cls}`);
    g.appendChild(circle);
    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", cx);
    label.setAttribute("y", -cy + 60);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "breadcrumb-label");
    label.textContent = `${formatKm(result.distance_km)} ${result.direction}`;
    g.appendChild(label);
  }

  function showDistanceToast(result) {
    const t = state.dom.toast;
    const w = warmth(result.distance_km);
    t.className = `distance-toast ${w.cls}`;
    t.innerHTML = `
      <span class="toast-emoji">${w.emoji}</span>
      <span class="toast-text">
        <span class="toast-label">${w.label}</span>
        <span class="toast-sub">${formatKm(result.distance_km)} ${result.direction}</span>
      </span>
    `;
    t.classList.add("visible");
    clearTimeout(showDistanceToast._timer);
    showDistanceToast._timer = setTimeout(() => t.classList.remove("visible"), 2200);
  }

  // ----- Util -----------------------------------------------------------

  function formatTime(ms) {
    const s = Math.round(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  global.OrbisMission = { init, start, stop, isActive, handleMapClick };
})(window);
