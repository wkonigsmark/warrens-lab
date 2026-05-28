/**
 * Orbis Geocode — UI controller for the Guess Who + Globle hybrid.
 *
 * Drives a single OrbisQuiz geocode session and renders:
 *   - A right-side panel with a hint deck, a clue log, and a guess log
 *   - Map breadcrumbs at wrong-guess locations (warm/cold by distance)
 *   - A floating distance toast on each guess
 *   - A win/lose modal
 *
 * Country clicks on the map become guesses when isActive() is true.
 * The host page (script.js) gates clicks via OrbisGeocode.isActive().
 *
 * Public API:
 *   OrbisGeocode.init(opts)
 *   OrbisGeocode.start()
 *   OrbisGeocode.stop()
 *   OrbisGeocode.isActive()
 *   OrbisGeocode.handleMapClick(iso2, country)
 */
(function (global) {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const HINT_META = {
    continent:        { icon: "🌍", label: "Continent" },
    language:         { icon: "🗣️", label: "Language" },
    "flag-color":     { icon: "🎨", label: "Flag colors" },
    "flag-motif":     { icon: "⭐", label: "Flag features" },
    climate:          { icon: "☀️", label: "Climate" },
    hemisphere:       { icon: "🧭", label: "Hemisphere" },
    "capital-letter": { icon: "✏️", label: "Capital letter" },
    neighbor:         { icon: "🤝", label: "Neighbors" },
    water:            { icon: "🌊", label: "Bordering water" },
    size:             { icon: "📏", label: "Size" },
    population:       { icon: "👥", label: "Population" },
    terrain:          { icon: "🏞️", label: "Terrain" },
    landmark:         { icon: "🗽", label: "Landmark" },
    food:             { icon: "🍴", label: "Famous food" }
  };

  // Warm/cold thresholds (km) → label, css class, emoji.
  function warmth(km) {
    if (km < 1500)  return { label: "Burning hot", cls: "burning", emoji: "🔥" };
    if (km < 4000)  return { label: "Warm",        cls: "warm",     emoji: "🌡️" };
    if (km < 8000)  return { label: "Cool",        cls: "cool",     emoji: "🌬️" };
    return              { label: "Ice cold",   cls: "cold",     emoji: "🧊" };
  }

  const state = {
    initialized: false,
    active: false,
    session: null,
    dom: {}
  };

  function init() {
    if (state.initialized) return;
    state.dom = {
      panel:           document.getElementById("geocode-panel"),
      chips:           document.getElementById("hint-chips"),
      clueList:        document.getElementById("clue-list"),
      guessList:       document.getElementById("guess-list"),
      hintsRemaining:  document.getElementById("hints-remaining"),
      guessCount:      document.getElementById("guess-count"),
      giveUpBtn:       document.getElementById("geocode-give-up"),
      exitBtn:         document.getElementById("geocode-exit"),
      result:          document.getElementById("geocode-result-overlay"),
      resultTitle:     document.getElementById("geocode-result-title"),
      resultBody:      document.getElementById("geocode-result-body"),
      resultFlag:      document.getElementById("geocode-result-flag"),
      resultPlayAgain: document.getElementById("geocode-result-play-again"),
      resultClose:     document.getElementById("geocode-result-close"),
      toast:           document.getElementById("distance-toast"),
      svg:             document.getElementById("world-map")
    };
    buildChipDeck();
    state.dom.giveUpBtn.addEventListener("click", onGiveUp);
    state.dom.exitBtn.addEventListener("click", stop);
    state.dom.resultPlayAgain.addEventListener("click", () => { closeResult(); startRound(); });
    state.dom.resultClose.addEventListener("click", () => { closeResult(); });
    state.initialized = true;
  }

  function buildChipDeck() {
    const chips = state.dom.chips;
    chips.innerHTML = "";
    for (const cat of OrbisQuiz.HINT_CATEGORIES) {
      const meta = HINT_META[cat] || { icon: "❔", label: cat };
      const btn = document.createElement("button");
      btn.className = "hint-chip";
      btn.dataset.category = cat;
      btn.innerHTML = `<span class="chip-icon">${meta.icon}</span><span class="chip-label">${meta.label}</span>`;
      btn.addEventListener("click", () => onChipClick(cat, btn));
      chips.appendChild(btn);
    }
  }

  // ----- Lifecycle -------------------------------------------------------

  function start() {
    init();
    state.dom.panel.classList.add("open");
    state.active = true;
    document.body.classList.add("geocode-active");
    // Reset any zoom to the world view so the mystery isn't artificially framed.
    if (window.OrbisCountries) OrbisCountries.resetViewBox(document.getElementById("world-map"));
    startRound();
  }

  function stop() {
    state.active = false;
    document.body.classList.remove("geocode-active");
    if (state.session) state.session.end();
    state.session = null;
    clearBreadcrumbs();
    closeResult();
    state.dom.panel.classList.remove("open");
    // Restore default status display
    const label = document.querySelector(".status-label");
    if (label) label.textContent = "CURRENT FOCUS";
    const name = document.getElementById("current-region-name");
    if (name) name.textContent = "PLANET EARTH";
  }

  function isActive() { return state.active; }

  function startRound() {
    clearBreadcrumbs();
    resetPanel();
    state.session = OrbisQuiz.start({
      mode: "geocode",
      pool: { type: "all" },
      hintBudget: 5,
      autoStart: false,
      hooks: {
        onRoundStart: () => render(),
        onHint:       (h)  => { renderClue(h); render(); },
        onGuess:      (r)  => onGuessResult(r),
        onRoundEnd:   (o)  => onRoundEnd(o)
      }
    });
    state.session.nextRound();
  }

  function resetPanel() {
    state.dom.clueList.innerHTML = "";
    state.dom.guessList.innerHTML = "";
    for (const btn of state.dom.chips.querySelectorAll(".hint-chip")) {
      btn.classList.remove("used", "disabled");
      btn.disabled = false;
    }
    render();
  }

  function render() {
    if (!state.session) return;
    const s = state.session.getState();
    state.dom.hintsRemaining.textContent = s.hintsRemaining;
    state.dom.guessCount.textContent = s.guesses.length;
    // If hint budget exhausted, disable any unused chips
    if (s.hintsRemaining <= 0) {
      for (const btn of state.dom.chips.querySelectorAll(".hint-chip:not(.used)")) {
        btn.classList.add("disabled");
        btn.disabled = true;
      }
    }
  }

  // ----- Hint handling ---------------------------------------------------

  function onChipClick(category, btn) {
    if (!state.session) return;
    const before = state.session.getState();
    const already = before.hintsUsed.find(h => h.category === category);
    const hint = state.session.useHint(category);
    if (!hint) return;
    btn.classList.add("used");
    btn.disabled = true;
    if (already) return; // re-asking is free; clue card already in log
  }

  function renderClue(hint) {
    const meta = HINT_META[hint.category] || { icon: "❔", label: hint.category };
    const li = document.createElement("li");
    li.className = "clue-card";
    li.innerHTML = `
      <span class="clue-icon">${meta.icon}</span>
      <div class="clue-body">
        <span class="clue-cat">${meta.label}</span>
        <span class="clue-text">${escapeHtml(hint.display)}</span>
      </div>
    `;
    state.dom.clueList.appendChild(li);
  }

  // ----- Map click handling ---------------------------------------------

  function handleMapClick(iso2, country) {
    if (!state.active || !state.session) return;
    if (!country) return; // dim countries shouldn't fire, but guard anyway
    state.session.guess(iso2);
  }

  function onGuessResult(result) {
    if (result.correct) {
      flashCountry(result.guess_iso2, "correct");
      return;
    }
    flashCountry(result.guess_iso2, "wrong");
    dropBreadcrumb(result);
    showDistanceToast(result);
    appendGuessRow(result);
    render();
  }

  function appendGuessRow(result) {
    const w = warmth(result.distance_km);
    const li = document.createElement("li");
    li.className = `guess-row ${w.cls}`;
    li.innerHTML = `
      <span class="guess-emoji">${w.emoji}</span>
      <span class="guess-name">${escapeHtml(result.guess_name)}</span>
      <span class="guess-dist">${formatKm(result.distance_km)} ${result.direction}</span>
    `;
    state.dom.guessList.appendChild(li);
  }

  function formatKm(km) {
    if (km < 1000) return `${km} km`;
    return `${(km / 1000).toFixed(km < 10000 ? 1 : 0)}k km`;
  }

  // ----- Map decoration -------------------------------------------------

  function flashCountry(iso2, kind) {
    const path = document.querySelector(`path[data-iso2="${iso2}"]`);
    if (!path) return;
    const cls = kind === "correct" ? "correct-flash" : "incorrect-flash";
    path.classList.add(cls);
    setTimeout(() => path.classList.remove(cls), kind === "correct" ? 1200 : 600);
  }

  function getBreadcrumbsGroup() {
    let g = document.getElementById("geocode-breadcrumbs");
    if (!g) {
      g = document.createElementNS(SVG_NS, "g");
      g.id = "geocode-breadcrumbs";
      state.dom.svg.appendChild(g);
    }
    return g;
  }

  function clearBreadcrumbs() {
    const g = document.getElementById("geocode-breadcrumbs");
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

    // Direction arrow toward target (small chevron)
    const dir = document.createElementNS(SVG_NS, "text");
    dir.setAttribute("x", cx);
    dir.setAttribute("y", -cy + 60);
    dir.setAttribute("text-anchor", "middle");
    dir.setAttribute("class", "breadcrumb-label");
    dir.textContent = `${formatKm(result.distance_km)} ${result.direction}`;
    g.appendChild(dir);
  }

  function showDistanceToast(result) {
    const w = warmth(result.distance_km);
    const t = state.dom.toast;
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

  // ----- Round end ------------------------------------------------------

  function onGiveUp() {
    if (!state.session) return;
    state.session.giveUp();
  }

  function onRoundEnd(outcome) {
    const country = OrbisCountries.getCountry(outcome.target.iso_a2);
    showResult(outcome.won, country, outcome);
  }

  function showResult(won, country, outcome) {
    state.dom.resultTitle.textContent = won ? "Decoded!" : "Not this time";
    state.dom.resultFlag.textContent = country?.flag_emoji || "🌍";
    const facts = country
      ? `
        <div class="result-name">${escapeHtml(country.name)}</div>
        <div class="result-meta">${escapeHtml(country.capital)} · ${escapeHtml(country.languages.join(", "))}</div>
        <p class="result-fact">${escapeHtml(country.fact_card)}</p>
        <p class="result-stats">${outcome.attempts || 0} guess${(outcome.attempts || 0) === 1 ? "" : "es"} · ${outcome.hintsUsed || 0} hint${(outcome.hintsUsed || 0) === 1 ? "" : "s"}</p>
      `
      : `<p class="result-stats">Round ended.</p>`;
    state.dom.resultBody.innerHTML = facts;
    state.dom.result.classList.add("visible");
  }

  function closeResult() { state.dom.result.classList.remove("visible"); }

  // ----- Util ----------------------------------------------------------

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  global.OrbisGeocode = { init, start, stop, isActive, handleMapClick };
})(window);
