/*
 * Warren's World Cup Quiz — engine
 *
 * An endless, forgiving trivia game built for long car rides. It blends
 * hand-authored World Cup history (quiz-trivia.js) with geography questions
 * generated on the fly from the 48 World Cup 2026 teams (quiz-teams.js).
 *
 * Design goals (kid buy-in): big tappable choices, instant celebration,
 * running streak, a fun fact after every answer, and lots of easy wins.
 */

(function () {
  "use strict";

  // Data is provided by quiz-teams.js and quiz-trivia.js as plain globals so
  // the quiz works even when opened directly as a file (no ES-module loader).
  const wcTeams = window.WC_QUIZ_TEAMS || [];
  // Trivia pool = World Cup history trivia + Rules of the Game questions.
  const triviaQuestions = (window.WC_QUIZ_TRIVIA || []).concat(window.WC_QUIZ_RULES || []);
  const wcWinners = (window.WC_QUIZ_WINNERS || []).filter((w) => !w.cancelled);
  const wcTitles = window.WC_QUIZ_TITLES || [];

  // ---- Helpers ------------------------------------------------------------
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const sampleN = (arr, n) => shuffle(arr).slice(0, n);

  const CONFED_LABEL = {
    UEFA: "Europe (UEFA)",
    CONMEBOL: "South America (CONMEBOL)",
    CONCACAF: "N. America (CONCACAF)",
    CAF: "Africa (CAF)",
    AFC: "Asia (AFC)",
    OFC: "Oceania (OFC)",
  };

  // flagcdn code (handles England/Scotland which share ISO "GB")
  function flagCode(team) {
    if (team.id === "ENG") return "gb-eng";
    if (team.id === "SCO") return "gb-sct";
    return team.iso2.toLowerCase();
  }
  const flagUrl = (team) => `https://flagcdn.com/w320/${flagCode(team)}.png`;

  function popLabel(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + " billion";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + " million";
    return n.toLocaleString();
  }

  // ---- Difficulty / age presets ------------------------------------------
  // maxDiff filters question hardness; choices caps the number of buttons.
  const AGES = {
    rookie: { label: "🐣 Rookie", maxDiff: 1, choices: 3, blurb: "Nice and easy" },
    pro: { label: "🧒 Pro", maxDiff: 2, choices: 4, blurb: "A good challenge" },
    legend: { label: "🧠 Legend", maxDiff: 3, choices: 4, blurb: "Hardest mode" },
  };

  // ---- Categories ---------------------------------------------------------
  // Each maps to trivia cats and/or geography generator keys.
  const CATEGORIES = {
    mix: { label: "🎲 Mix It All!", blurb: "Every kind of question", trivia: "*", gens: "*" },
    history: {
      label: "🏆 World Cup History",
      blurb: "Champions, hosts, legends & records",
      trivia: ["champions", "hosts", "records", "legends", "usa"],
      gens: ["whoWonYear", "howManyTitles", "whoHostedYear"],
    },
    flags: {
      label: "🚩 Flags & Teams",
      blurb: "Spot the flag, group & confederation",
      trivia: [],
      gens: ["flagToCountry", "pickFlag", "group", "confederation"],
    },
    geography: {
      label: "🌍 Geography",
      blurb: "Continents, capitals & populations",
      trivia: [],
      gens: ["continent", "capital", "biggerPop", "landmark", "whichFromContinent"],
    },
    rules: {
      label: "📏 Rules of the Game",
      blurb: "Offside, fouls, cards & free kicks",
      trivia: ["rules"],
      gens: [],
    },
  };

  // ---- Geography question generators -------------------------------------
  // Each returns a normalized question: { q, media?, choices[], answer, fact, diff }
  const GEN = {
    flagToCountry(maxChoices) {
      const target = sample(wcTeams);
      const decoys = sampleN(wcTeams.filter((t) => t.id !== target.id), maxChoices - 1);
      const opts = shuffle([target, ...decoys]);
      return {
        diff: 1,
        media: { type: "flag", url: flagUrl(target) },
        q: "Which country's flag is this?",
        choices: opts.map((t) => t.name),
        answer: opts.indexOf(target),
        fact: target.fact || `${target.name} plays in Group ${target.group}.`,
      };
    },
    pickFlag(maxChoices) {
      const target = sample(wcTeams);
      const decoys = sampleN(wcTeams.filter((t) => t.id !== target.id), maxChoices - 1);
      const opts = shuffle([target, ...decoys]);
      return {
        diff: 1,
        q: `Which flag belongs to ${target.name}?`,
        choices: opts.map((t) => ({ flag: flagUrl(t), label: t.name })),
        answer: opts.indexOf(target),
        fact: target.fact || `${target.name} plays in Group ${target.group}.`,
      };
    },
    continent(maxChoices) {
      const target = sample(wcTeams);
      const conts = [...new Set(wcTeams.map((t) => t.continent))];
      const decoys = sampleN(conts.filter((c) => c !== target.continent), maxChoices - 1);
      const opts = shuffle([target.continent, ...decoys]);
      return {
        diff: 1,
        q: `Which continent is ${target.name} in?`,
        choices: opts,
        answer: opts.indexOf(target.continent),
        fact: `${target.name} is in ${target.continent}.`,
      };
    },
    confederation(maxChoices) {
      const target = sample(wcTeams);
      const confs = [...new Set(wcTeams.map((t) => t.confederation))];
      const decoys = sampleN(confs.filter((c) => c !== target.confederation), maxChoices - 1);
      const opts = shuffle([target.confederation, ...decoys]);
      return {
        diff: 2,
        q: `${target.name} plays in which confederation?`,
        choices: opts.map((c) => CONFED_LABEL[c] || c),
        answer: opts.indexOf(target.confederation),
        fact: `${target.name} qualifies through ${CONFED_LABEL[target.confederation] || target.confederation}.`,
      };
    },
    capital(maxChoices) {
      const pool = wcTeams.filter((t) => t.capital);
      const target = sample(pool);
      const decoys = sampleN(
        pool.filter((t) => t.capital !== target.capital),
        maxChoices - 1
      );
      const opts = shuffle([target.capital, ...decoys.map((t) => t.capital)]);
      return {
        diff: 2,
        q: `What is the capital of ${target.name}?`,
        choices: opts,
        answer: opts.indexOf(target.capital),
        fact: `${target.capital} is the capital of ${target.name}.`,
      };
    },
    group(maxChoices) {
      const target = sample(wcTeams);
      const groups = [...new Set(wcTeams.map((t) => t.group))];
      const decoys = sampleN(groups.filter((g) => g !== target.group), maxChoices - 1);
      const opts = shuffle([target.group, ...decoys]).map((g) => "Group " + g);
      const correct = "Group " + target.group;
      return {
        diff: 2,
        q: `Which group is ${target.name} in at the 2026 World Cup?`,
        choices: opts,
        answer: opts.indexOf(correct),
        fact: `${target.name} is drawn in Group ${target.group}.`,
      };
    },
    biggerPop() {
      const [a, b] = sampleN(wcTeams.filter((t) => t.population), 2);
      const bigger = a.population >= b.population ? a : b;
      const opts = shuffle([a, b]);
      return {
        diff: 2,
        q: "Which country has MORE people?",
        choices: opts.map((t) => t.name),
        answer: opts.indexOf(bigger),
        fact: `${bigger.name} has about ${popLabel(bigger.population)} people — more than ${
          (bigger === a ? b : a).name
        } (${popLabel((bigger === a ? b : a).population)}).`,
      };
    },
    landmark(maxChoices) {
      const pool = wcTeams.filter((t) => t.landmark);
      const target = sample(pool);
      const decoys = sampleN(pool.filter((t) => t.id !== target.id), maxChoices - 1);
      const opts = shuffle([target, ...decoys]);
      return {
        diff: 3,
        q: `In which country would you find ${target.landmark}?`,
        choices: opts.map((t) => t.name),
        answer: opts.indexOf(target),
        fact: `${target.landmark} is found in ${target.name}.`,
      };
    },
    whichFromContinent(maxChoices) {
      // Pick a continent, one team from it, and decoys from OTHER continents.
      const target = sample(wcTeams);
      const others = wcTeams.filter((t) => t.continent !== target.continent);
      const decoys = sampleN(others, maxChoices - 1);
      const opts = shuffle([target, ...decoys]);
      return {
        diff: 2,
        q: `Which of these teams is from ${target.continent}?`,
        choices: opts.map((t) => t.name),
        answer: opts.indexOf(target),
        fact: `${target.name} is the ${target.continent} team here.`,
      };
    },
    // ---- World Cup history generators (lots of champion variety) ----------
    whoWonYear(maxChoices) {
      const entry = sample(wcWinners);
      const names = wcTitles.map((t) => t.nation); // canonical champion names
      // Don't show both "Germany" and "West Germany" as options.
      const conflict = (n) => entry.winner.includes("Germany") && n.includes("Germany");
      const decoys = sampleN(
        names.filter((n) => n !== entry.winner && !conflict(n)),
        maxChoices - 1
      );
      const opts = shuffle([entry.winner, ...decoys]);
      return {
        diff: 2,
        q: `Who won the ${entry.year} World Cup?`,
        choices: opts,
        answer: opts.indexOf(entry.winner),
        fact: `${entry.winner} won the ${entry.year} World Cup, hosted by ${entry.host}.`,
      };
    },
    howManyTitles(maxChoices) {
      const t = sample(wcTitles);
      const pool = [1, 2, 3, 4, 5, 6].filter((n) => n !== t.titles);
      const decoys = sampleN(pool, maxChoices - 1);
      const opts = shuffle([t.titles, ...decoys]).map(String);
      return {
        diff: 2,
        q: `How many World Cups has ${t.nation} won?`,
        choices: opts,
        answer: opts.indexOf(String(t.titles)),
        fact: `${t.nation} has won ${t.titles} (${t.years}).${t.note ? " " + t.note + "." : ""}`,
      };
    },
    whoHostedYear(maxChoices) {
      const entry = sample(wcWinners.filter((w) => w.host));
      const hosts = [...new Set(wcWinners.map((w) => w.host))];
      const decoys = sampleN(hosts.filter((h) => h !== entry.host), maxChoices - 1);
      const opts = shuffle([entry.host, ...decoys]);
      return {
        diff: 3,
        q: `Which country hosted the ${entry.year} World Cup?`,
        choices: opts,
        answer: opts.indexOf(entry.host),
        fact: `The ${entry.year} World Cup was hosted by ${entry.host} — and won by ${entry.winner}.`,
      };
    },
  };

  // Static difficulty for each generator so we can filter by age cleanly.
  const GEN_DIFF = {
    flagToCountry: 1, pickFlag: 1, continent: 1,
    confederation: 2, capital: 2, group: 2, biggerPop: 2,
    whichFromContinent: 2, whoWonYear: 2, howManyTitles: 2,
    landmark: 3, whoHostedYear: 3,
  };

  // ---- State --------------------------------------------------------------
  const state = {
    category: null,
    age: "pro",
    mode: "normal", // "normal" | "review" (practice only the missed bank)
    score: 0,
    streak: 0,
    bestStreak: 0,
    answered: 0,
    correctCount: 0,
    current: null,
    locked: false,
    recentKeys: [], // avoid immediate repeats
    missed: [],     // banked questions the player got wrong
  };

  const BEST_KEY = "wc-quiz.bestStreak";
  const MISSED_KEY = "wc-quiz.missed";

  // Friendly labels for the topic tag shown on review cards.
  const CAT_TAG = {
    rules: "📏 Rules", champions: "🏆 History", hosts: "🏆 History",
    records: "🏆 History", legends: "🏆 History", usa: "🦅 Team USA",
    flags: "🚩 Flags & Teams", geography: "🌍 Geography", history: "🏆 History",
    mix: "🎲 Mix",
  };

  // A stable identity for a question so we don't bank the same one twice and
  // can remove it once it's learned. Built from the prompt + correct answer
  // (+ flag image, since several flag questions share the same prompt text).
  function answerTextOf(q) {
    const c = q.choices[q.answer];
    return c && typeof c === "object" ? c.label : c;
  }
  function keyOf(q) {
    return q.q + " || " + answerTextOf(q) + " || " + (q.media && q.media.url ? q.media.url : "");
  }

  // ---- DOM ----------------------------------------------------------------
  const el = {};
  function cacheDom() {
    [
      "home", "game", "cat-grid", "age-grid", "score", "streak", "best",
      "q-media", "q-text", "choices", "feedback", "fact", "next-btn",
      "cat-label", "quit-btn", "milestone", "milestone-text", "answered",
      "review", "review-list", "review-count", "review-empty",
      "review-cta", "review-cta-count", "review-back", "practice-btn", "clear-misses",
    ].forEach((id) => (el[id] = document.getElementById(id)));
  }

  // ---- Question selection -------------------------------------------------
  function pickQuestion() {
    // Review practice: serve only banked (missed) questions.
    if (state.mode === "review") {
      if (!state.missed.length) return null;
      let rec = state.missed[0];
      for (let i = 0; i < 6; i++) {
        rec = sample(state.missed);
        if (!state.recentKeys.includes(rec.key) || i === 5) break;
      }
      state.recentKeys.push(rec.key);
      if (state.recentKeys.length > 8) state.recentKeys.shift();
      return reshapeMissed(rec);
    }

    const cat = CATEGORIES[state.category];
    const age = AGES[state.age];

    // Build the menu of available sources for this category.
    const triviaCats = cat.trivia === "*" ? null : cat.trivia;
    let triviaPool = triviaQuestions.filter((qq) => qq.diff <= age.maxDiff);
    if (triviaCats) triviaPool = triviaPool.filter((qq) => triviaCats.includes(qq.cat));

    const allGenKeys = cat.gens === "*" ? Object.keys(GEN) : cat.gens.filter((k) => GEN[k]);
    // Only offer generators within the age's difficulty cap.
    const genKeys = allGenKeys.filter((k) => (GEN_DIFF[k] || 1) <= age.maxDiff);

    const hasTrivia = triviaPool.length > 0;
    const hasGens = genKeys.length > 0;

    // Decide trivia vs generated. For "mix" weight generated a bit higher so
    // it feels endless; otherwise honor whatever the category offers.
    let useGen;
    if (hasTrivia && hasGens) useGen = Math.random() < 0.55;
    else useGen = hasGens;

    // Try a few times to avoid an immediate repeat.
    for (let attempt = 0; attempt < 6; attempt++) {
      let q;
      if (useGen || !hasTrivia) {
        const key = sample(genKeys);
        q = GEN[key](age.choices);
        if (q.diff > age.maxDiff && attempt < 5) continue; // respect age cap
        q._key = key + "|" + (q.media?.url || q.q);
      } else {
        const base = sample(triviaPool);
        // Trim/shuffle choices to the age's choice count but always keep answer.
        q = normalizeTrivia(base, age.choices);
        q._key = "t|" + base.q;
      }
      if (!state.recentKeys.includes(q._key) || attempt === 5) {
        state.recentKeys.push(q._key);
        if (state.recentKeys.length > 8) state.recentKeys.shift();
        return q;
      }
    }
    // Fallback
    return GEN.flagToCountry(age.choices);
  }

  // Pick up to `n` choices for a trivia question and ALWAYS shuffle them, so
  // the correct answer never sits in a predictable spot (e.g. always first).
  function normalizeTrivia(base, n) {
    const correct = base.choices[base.answer];
    const wrong = base.choices.filter((_, i) => i !== base.answer);
    const keep = Math.max(1, Math.min(n, base.choices.length) - 1);
    const keptWrong = sampleN(wrong, keep);
    const opts = shuffle([correct, ...keptWrong]);
    return { ...base, choices: opts, answer: opts.indexOf(correct), media: null };
  }

  // Re-shuffle a banked question's choices so it isn't memorized by position.
  function reshapeMissed(rec) {
    const order = shuffle(rec.choices.map((_, i) => i));
    const choices = order.map((i) => rec.choices[i]);
    const answer = order.indexOf(rec.answer);
    return {
      q: rec.q, choices, answer, fact: rec.fact,
      media: rec.media || null, cat: rec.cat, _key: "m|" + rec.key,
    };
  }

  // ---- Render -------------------------------------------------------------
  function renderQuestion() {
    // In review mode, once everything is learned, return to the review screen.
    if (state.mode === "review" && !state.missed.length) {
      openReview();
      return;
    }
    state.locked = false;
    const q = pickQuestion();
    if (!q) { openReview(); return; }
    state.current = q;

    el.feedback.textContent = "";
    el.feedback.className = "feedback";
    el.fact.textContent = "";
    el.fact.classList.remove("show");
    el["next-btn"].classList.remove("show");

    // Media (flag image)
    el["q-media"].innerHTML = "";
    el["q-media"].classList.toggle("has-media", !!q.media);
    if (q.media && q.media.type === "flag") {
      const img = document.createElement("img");
      img.src = q.media.url;
      img.alt = "Guess the country from this flag";
      img.className = "flag-media";
      el["q-media"].appendChild(img);
    }

    el["q-text"].textContent = q.q;

    // Choices
    el.choices.innerHTML = "";
    const isFlagChoices = typeof q.choices[0] === "object" && q.choices[0].flag;
    el.choices.classList.toggle("flag-choices", !!isFlagChoices);
    el.choices.style.setProperty("--n", q.choices.length);
    q.choices.forEach((choice, i) => {
      const btn = document.createElement("button");
      btn.className = "choice";
      if (isFlagChoices) {
        btn.classList.add("choice-flag");
        const img = document.createElement("img");
        img.src = choice.flag;
        img.alt = choice.label;
        btn.appendChild(img);
      } else {
        btn.textContent = choice;
      }
      btn.addEventListener("click", () => onAnswer(btn, i));
      el.choices.appendChild(btn);
    });
  }

  function onAnswer(btn, index) {
    if (state.locked) return;
    state.locked = true;
    const q = state.current;
    const correct = index === q.answer;
    state.answered += 1;

    const buttons = [...el.choices.querySelectorAll(".choice")];
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === q.answer) b.classList.add("correct");
    });

    if (correct) {
      state.score += 10;
      state.streak += 1;
      state.correctCount += 1;
      if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
        saveBest();
      }
      el.feedback.textContent = sample(["✓ Yes!", "✓ Correct!", "✓ Nailed it!", "✓ Great!", "✓ Goal! ⚽"]);
      el.feedback.className = "feedback good";
      burst(btn);
      // Got it right → it's learned, so remove it from the review bank.
      unbankMissed(q);
      // Milestone celebration every 5 in a row
      if (state.streak > 0 && state.streak % 5 === 0) showMilestone(state.streak);
    } else {
      btn.classList.add("wrong");
      state.streak = 0;
      el.feedback.textContent = "✗ Not quite!";
      el.feedback.className = "feedback bad";
      // Bank the missed question (with its correct answer) for later review.
      bankMissed(q);
    }

    el.fact.textContent = q.fact || "";
    el.fact.classList.add("show");
    el["next-btn"].classList.add("show");
    updateHud();
  }

  function showMilestone(streak) {
    el["milestone-text"].textContent = `🔥 ${streak} in a row!`;
    el.milestone.classList.add("show");
    setTimeout(() => el.milestone.classList.remove("show"), 1500);
  }

  // Lightweight confetti-ish burst from the chosen button.
  function burst(origin) {
    const rect = origin.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const colors = ["#f4c95d", "#24b47e", "#4aa3ff", "#ff5d5d", "#f7f4eb"];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("span");
      p.className = "confetti";
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.background = sample(colors);
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 90;
      p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--dy", (Math.sin(angle) * dist - 40) + "px");
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  function updateHud() {
    el.score.textContent = state.score;
    el.streak.textContent = state.streak;
    el.best.textContent = state.bestStreak;
    el.answered.textContent = state.answered;
  }

  // ---- Persistence --------------------------------------------------------
  function saveBest() {
    try { localStorage.setItem(BEST_KEY, String(state.bestStreak)); } catch (e) {}
  }
  function loadBest() {
    try {
      const v = parseInt(localStorage.getItem(BEST_KEY), 10);
      if (!isNaN(v)) state.bestStreak = v;
    } catch (e) {}
  }

  // ---- Missed-question bank (the review study sheet) ----------------------
  function loadMissed() {
    try {
      const raw = JSON.parse(localStorage.getItem(MISSED_KEY));
      state.missed = Array.isArray(raw) ? raw : [];
    } catch (e) { state.missed = []; }
  }
  function saveMissed() {
    try { localStorage.setItem(MISSED_KEY, JSON.stringify(state.missed)); } catch (e) {}
  }
  function bankMissed(q) {
    const key = keyOf(q);
    if (state.missed.some((m) => m.key === key)) return; // already banked
    state.missed.unshift({
      key,
      q: q.q,
      choices: q.choices,
      answer: q.answer,
      fact: q.fact || "",
      media: q.media || null,
      cat: q.cat || state.category,
      ts: Date.now(),
    });
    if (state.missed.length > 80) state.missed.length = 80; // keep it sane
    saveMissed();
  }
  function unbankMissed(q) {
    const key = keyOf(q);
    const before = state.missed.length;
    state.missed = state.missed.filter((m) => m.key !== key);
    if (state.missed.length !== before) saveMissed();
  }

  // ---- Screens ------------------------------------------------------------
  function resetRound() {
    state.score = 0;
    state.streak = 0;
    state.answered = 0;
    state.correctCount = 0;
    state.recentKeys = [];
  }

  function startGame(catKey) {
    state.mode = "normal";
    state.category = catKey;
    resetRound();
    el["cat-label"].textContent = CATEGORIES[catKey].label;
    el.review.classList.add("hidden");
    el.home.classList.add("hidden");
    el.game.classList.remove("hidden");
    updateHud();
    renderQuestion();
  }

  // Practice ONLY the questions you've missed before.
  function startReviewPractice() {
    if (!state.missed.length) return;
    state.mode = "review";
    resetRound();
    el["cat-label"].textContent = "📝 Practice Misses";
    el.review.classList.add("hidden");
    el.home.classList.add("hidden");
    el.game.classList.remove("hidden");
    updateHud();
    renderQuestion();
  }

  function goHome() {
    state.mode = "normal";
    el.game.classList.add("hidden");
    el.review.classList.add("hidden");
    el.home.classList.remove("hidden");
    refreshReviewCta();
  }

  // ---- Review screen (study sheet of missed questions) --------------------
  function openReview() {
    state.mode = "normal";
    el.game.classList.add("hidden");
    el.home.classList.add("hidden");
    el.review.classList.remove("hidden");
    renderReviewList();
  }

  function renderReviewList() {
    const n = state.missed.length;
    el["review-count"].textContent = n
      ? `${n} question${n === 1 ? "" : "s"} to review`
      : "";
    el["review-empty"].classList.toggle("hidden", n > 0);
    el["practice-btn"].classList.toggle("hidden", n === 0);
    el["clear-misses"].classList.toggle("hidden", n === 0);

    const list = el["review-list"];
    list.innerHTML = "";
    state.missed.forEach((rec) => {
      const card = document.createElement("div");
      card.className = "review-card";
      const tag = CAT_TAG[rec.cat] || "⚽ Quiz";
      const ans = rec.choices[rec.answer];
      const ansText = ans && typeof ans === "object" ? ans.label : ans;
      const flag = rec.media && rec.media.url
        ? `<img class="review-flag" src="${rec.media.url}" alt="">`
        : "";
      card.innerHTML =
        `<div class="review-top"><span class="review-tag">${tag}</span>` +
        `<button class="review-got" title="I know this now — remove it">✓ Got it</button></div>` +
        flag +
        `<div class="review-q">${rec.q}</div>` +
        `<div class="review-a">Answer: <strong>${ansText}</strong></div>` +
        (rec.fact ? `<div class="review-fact">${rec.fact}</div>` : "");
      card.querySelector(".review-got").addEventListener("click", () => {
        state.missed = state.missed.filter((m) => m.key !== rec.key);
        saveMissed();
        renderReviewList();
      });
      list.appendChild(card);
    });
  }

  function refreshReviewCta() {
    const n = state.missed.length;
    if (!el["review-cta"]) return;
    el["review-cta"].classList.toggle("hidden", n === 0);
    if (el["review-cta-count"]) el["review-cta-count"].textContent = n;
  }

  // ---- Build home screen --------------------------------------------------
  function buildHome() {
    // Age selector
    el["age-grid"].innerHTML = "";
    Object.entries(AGES).forEach(([key, a]) => {
      const btn = document.createElement("button");
      btn.className = "age-btn" + (key === state.age ? " active" : "");
      btn.innerHTML = `<span class="age-label">${a.label}</span><span class="age-blurb">${a.blurb}</span>`;
      btn.addEventListener("click", () => {
        state.age = key;
        [...el["age-grid"].children].forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
      });
      el["age-grid"].appendChild(btn);
    });

    // Category cards
    el["cat-grid"].innerHTML = "";
    Object.entries(CATEGORIES).forEach(([key, c]) => {
      const card = document.createElement("button");
      card.className = "cat-card" + (key === "mix" ? " cat-hero" : "");
      card.innerHTML = `<span class="cat-title">${c.label}</span><span class="cat-blurb">${c.blurb}</span>`;
      card.addEventListener("click", () => startGame(key));
      el["cat-grid"].appendChild(card);
    });
  }

  // ---- Boot ---------------------------------------------------------------
  function init() {
    cacheDom();
    loadBest();
    loadMissed();
    buildHome();
    updateHud();
    refreshReviewCta();
    el["next-btn"].addEventListener("click", renderQuestion);
    el["quit-btn"].addEventListener("click", goHome);
    if (el["review-cta"]) el["review-cta"].addEventListener("click", openReview);
    if (el["review-back"]) el["review-back"].addEventListener("click", goHome);
    if (el["practice-btn"]) el["practice-btn"].addEventListener("click", startReviewPractice);
    if (el["clear-misses"]) el["clear-misses"].addEventListener("click", () => {
      if (state.missed.length && window.confirm("Clear all your missed questions?")) {
        state.missed = [];
        saveMissed();
        renderReviewList();
      }
    });
    // Keyboard: Enter / Space for next when an answer is showing.
    document.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && state.locked && !el.game.classList.contains("hidden")) {
        e.preventDefault();
        renderQuestion();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
