/**
 * Orbis Quiz Engine
 *
 * One mode-agnostic session driver for all quiz formats.
 * - mode: "mission"  → target announced, user guesses by clicking. Distance/direction returned.
 * - mode: "geocode"  → target hidden. User spends hints to learn attributes, guesses, gets warmer/colder feedback.
 *
 * Depends on window.OrbisCountries — call OrbisCountries.load() before starting a session.
 *
 * Usage:
 *   const session = OrbisQuiz.start({
 *     mode: "geocode",
 *     pool: { type: "all" },           // or { type: "continent", value: "europe" } or { type: "iso2s", value: ["FR","DE"] }
 *     rounds: 1,                        // mission default 10, geocode default 1
 *     hintBudget: 5,                    // geocode only
 *     hooks: {
 *       onRoundStart(target, session) {},
 *       onGuess(result, session) {},   // result: { correct, distance_km, direction, guess_name, ... }
 *       onHint(hint, session) {},      // hint: { category, value, display }
 *       onRoundEnd(outcome, session) {},
 *       onSessionEnd(summary, session) {}
 *     }
 *   });
 *
 *   session.guess("FR");
 *   session.useHint("flag-color");
 *   session.nextRound();
 *   session.end();
 */
(function (global) {
  // ---------- Geometry ----------------------------------------------------
  const R_KM = 6371;
  const rad = d => (d * Math.PI) / 180;

  function haversine(lat1, lng1, lat2, lng2) {
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R_KM * Math.asin(Math.sqrt(a));
  }

  function bearing(lat1, lng1, lat2, lng2) {
    const y = Math.sin(rad(lng2 - lng1)) * Math.cos(rad(lat2));
    const x =
      Math.cos(rad(lat1)) * Math.sin(rad(lat2)) -
      Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(rad(lng2 - lng1));
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  }

  const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const compass8 = deg => COMPASS[Math.round(deg / 45) % 8];

  // ---------- Formatters --------------------------------------------------
  const CONTINENT_HUMAN = {
    africa: "Africa",
    antarctica: "Antarctica",
    asia: "Asia",
    europe: "Europe",
    north_america: "North America",
    oceania: "Oceania",
    south_america: "South America"
  };

  function listFormat(arr) {
    if (!arr || !arr.length) return "—";
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
    return `${arr.slice(0, -1).join(", ")}, and ${arr[arr.length - 1]}`;
  }

  function pickN(arr, n) {
    const copy = (arr || []).slice();
    const out = [];
    while (out.length < n && copy.length) {
      const i = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(i, 1)[0]);
    }
    return out;
  }

  // ---------- Hint builders ----------------------------------------------
  // Each returns { category, value, display, noData?: true }
  // noData hints fire for Tier 4 countries that lack hand-curated soft fields —
  // they tell the player politely and (per controller policy) don't consume budget.

  function noData(category, fieldLabel) {
    return {
      category,
      value: null,
      noData: true,
      display: `We don't have ${fieldLabel} info for this country yet.`
    };
  }

  const HINT_BUILDERS = {
    continent: c => ({
      category: "continent",
      value: c.continent,
      display: `This country is in ${CONTINENT_HUMAN[c.continent] || c.continent}.`
    }),
    language: c => {
      if (!c.languages || !c.languages.length) return noData("language", "language");
      return {
        category: "language",
        value: c.languages,
        display: `They speak ${listFormat(c.languages)}.`
      };
    },
    "flag-color": c => {
      if (!c.flag_colors || !c.flag_colors.length) return noData("flag-color", "flag color");
      return {
        category: "flag-color",
        value: c.flag_colors,
        display: `Its flag uses ${listFormat(c.flag_colors)}.`
      };
    },
    "flag-motif": c => {
      if (!c.flag_motifs || !c.flag_motifs.length) return noData("flag-motif", "flag-feature");
      return {
        category: "flag-motif",
        value: c.flag_motifs,
        display: `Its flag features ${listFormat(c.flag_motifs)}.`
      };
    },
    climate: c => {
      if (!c.climate_band) return noData("climate", "climate");
      return {
        category: "climate",
        value: c.climate_band,
        display: `The climate here is mostly ${c.climate_band}.`
      };
    },
    hemisphere: c => ({
      category: "hemisphere",
      value: { ns: c.hemisphere_ns, ew: c.hemisphere_ew },
      display: `It sits in the ${c.hemisphere_ns === "N" ? "Northern" : "Southern"} and ${c.hemisphere_ew === "E" ? "Eastern" : "Western"} Hemispheres.`
    }),
    "capital-letter": c => {
      if (!c.capital) return noData("capital-letter", "capital");
      return {
        category: "capital-letter",
        value: c.capital[0],
        display: `Its capital begins with the letter "${c.capital[0]}".`
      };
    },
    neighbor: c => {
      const picks = pickN(c.borders || [], 3)
        .map(iso3 => {
          const found = OrbisCountries.allCountries().find(x => x.iso_a3 === iso3);
          return found ? found.name : null;
        })
        .filter(Boolean);
      if (!c.borders || !c.borders.length) {
        return {
          category: "neighbor",
          value: [],
          display: "It has no land neighbors — it might be an island or surrounded by water."
        };
      }
      if (!picks.length) {
        return {
          category: "neighbor",
          value: [],
          display: `It has ${c.borders.length} land neighbors (none in this atlas yet).`
        };
      }
      const more = c.borders.length > picks.length ? " (and more)" : "";
      return {
        category: "neighbor",
        value: picks,
        display: `Its neighbors include ${listFormat(picks)}${more}.`
      };
    },
    water: c => {
      if (!c.bordering_waters) return noData("water", "bordering-water");
      const picks = pickN(c.bordering_waters, 2);
      if (!picks.length) {
        return {
          category: "water",
          value: [],
          display: "It is fully landlocked — no coastline."
        };
      }
      return {
        category: "water",
        value: picks,
        display: `It touches the ${listFormat(picks)}.`
      };
    },
    size: c => ({
      category: "size",
      value: c.area_bucket,
      display: `By area, it's a ${c.area_bucket} country.`
    }),
    population: c => ({
      category: "population",
      value: c.population_bucket,
      display: `By population, it's a ${c.population_bucket}-sized country.`
    }),
    terrain: c => {
      if (!c.terrain_headline) return noData("terrain", "terrain");
      return {
        category: "terrain",
        value: c.terrain_headline,
        display: `Its terrain is mostly ${c.terrain_headline}.`
      };
    },
    landmark: c => {
      if (!c.landmark) return noData("landmark", "landmark");
      return {
        category: "landmark",
        value: c.landmark,
        display: `It is home to the ${c.landmark}.`
      };
    },
    food: c => {
      if (!c.famous_food) return noData("food", "famous-food");
      return {
        category: "food",
        value: c.famous_food,
        display: `A famous food from here is ${c.famous_food}.`
      };
    }
  };

  const HINT_CATEGORIES = Object.keys(HINT_BUILDERS);

  // ---------- Pool resolution --------------------------------------------
  function resolvePool(spec) {
    const all = OrbisCountries.allCountries();
    if (!spec || spec.type === "all") return all.slice();
    if (spec.type === "continent") {
      return all.filter(c => c.continent === spec.value);
    }
    if (spec.type === "iso2s") {
      const set = new Set(spec.value.map(s => s.toUpperCase()));
      return all.filter(c => set.has(c.iso_a2));
    }
    // Tier ladder: { type: 'level', value: N } returns every country with level <= N.
    // L1 = Famous 20, L2 = top 40, L3 = top 80, L4 = all ~195.
    if (spec.type === "level") {
      const maxLevel = Number(spec.value);
      return all.filter(c => (c.level || 4) <= maxLevel);
    }
    if (spec.type === "predicate") return all.filter(spec.predicate);
    return all.slice();
  }

  // ---------- Session factory --------------------------------------------
  function start(config) {
    const cfg = Object.assign(
      {
        mode: "mission",
        pool: { type: "all" },
        rounds: null,
        hintBudget: 5,
        autoStart: true,
        hooks: {}
      },
      config
    );

    if (cfg.rounds == null) cfg.rounds = cfg.mode === "geocode" ? 1 : 10;

    const pool = resolvePool(cfg.pool);
    if (!pool.length) throw new Error("OrbisQuiz: empty pool");

    const state = {
      mode: cfg.mode,
      poolIsos: pool.map(c => c.iso_a2),
      rounds: cfg.rounds,
      roundIndex: 0,
      targetsSeen: new Set(),
      target: null,
      guesses: [],
      hintsUsed: [],
      hintBudget: cfg.hintBudget,
      score: 0,
      startedAt: Date.now(),
      endedAt: null,
      ended: false
    };

    let session; // forward declaration for hook calls

    function emit(name, ...args) {
      const h = cfg.hooks && cfg.hooks[name];
      if (typeof h === "function") {
        try { h(...args, session); }
        catch (e) { console.error(`OrbisQuiz hook ${name} threw:`, e); }
      }
    }

    function nextRound() {
      if (state.ended) return null;
      if (state.roundIndex >= state.rounds) {
        finish();
        return null;
      }
      const remaining = pool.filter(c => !state.targetsSeen.has(c.iso_a2));
      const choices = remaining.length ? remaining : pool;
      const target = choices[Math.floor(Math.random() * choices.length)];
      state.target = target;
      state.targetsSeen.add(target.iso_a2);
      state.guesses = [];
      state.hintsUsed = [];
      state.roundIndex += 1;
      emit("onRoundStart", publicTarget(target));
      return publicTarget(target);
    }

    // For mission mode the target is public (name shown). For geocode it's hidden.
    function publicTarget(target) {
      if (state.mode === "mission") {
        return { iso_a2: target.iso_a2, name: target.name, hidden: false };
      }
      return { iso_a2: null, name: null, hidden: true, roundIndex: state.roundIndex };
    }

    function guess(iso2) {
      if (state.ended || !state.target) return null;
      iso2 = String(iso2 || "").toUpperCase();
      const guessed = OrbisCountries.getCountry(iso2);
      if (!guessed) return null;
      const correct = iso2 === state.target.iso_a2;
      const [glat, glng] = guessed.latlng;
      const [tlat, tlng] = state.target.latlng;
      const km = Math.round(haversine(glat, glng, tlat, tlng));
      const dirDeg = bearing(glat, glng, tlat, tlng);
      const result = {
        correct,
        guess_iso2: iso2,
        guess_name: guessed.name,
        distance_km: km,
        direction: correct ? null : compass8(dirDeg),
        bearing_deg: correct ? null : dirDeg,
        attempt: state.guesses.length + 1
      };
      if (correct) {
        result.target_iso2 = state.target.iso_a2;
        result.target_name = state.target.name;
      }
      state.guesses.push(result);
      emit("onGuess", result);
      if (correct) {
        state.score += 1;
        emit("onRoundEnd", { won: true, target: state.target, attempts: state.guesses.length, hintsUsed: state.hintsUsed.length });
      }
      return result;
    }

    function useHint(category) {
      if (state.ended || !state.target) return null;
      if (state.mode !== "geocode") return null;
      const existing = state.hintsUsed.find(h => h.category === category);
      if (existing) return existing; // free re-read; doesn't cost budget
      if (state.hintsUsed.length >= state.hintBudget) return null;
      const builder = HINT_BUILDERS[category];
      if (!builder) return null;
      const hint = builder(state.target);
      // Don't charge for "no info" hints — the chip stays available so the player
      // can spend their budget on a category that actually exists for this country.
      if (!hint.noData) state.hintsUsed.push(hint);
      emit("onHint", hint);
      return hint;
    }

    function giveUp() {
      if (state.ended || !state.target) return null;
      const target = state.target;
      emit("onRoundEnd", { won: false, gaveUp: true, target, attempts: state.guesses.length, hintsUsed: state.hintsUsed.length });
      return { iso_a2: target.iso_a2, name: target.name };
    }

    function finish() {
      if (state.ended) return;
      state.ended = true;
      state.endedAt = Date.now();
      emit("onSessionEnd", {
        score: state.score,
        rounds: state.rounds,
        durationMs: state.endedAt - state.startedAt
      });
    }

    function getState() {
      // Return a serializable snapshot. Strip the live target name when in geocode mid-round.
      return {
        mode: state.mode,
        roundIndex: state.roundIndex,
        rounds: state.rounds,
        pool: state.poolIsos.slice(),
        target: state.mode === "mission" && state.target
          ? { iso_a2: state.target.iso_a2, name: state.target.name }
          : state.ended || !state.target
            ? state.target ? { iso_a2: state.target.iso_a2, name: state.target.name } : null
            : { hidden: true },
        guesses: state.guesses.slice(),
        hintsUsed: state.hintsUsed.slice(),
        hintBudget: state.hintBudget,
        hintsRemaining: state.hintBudget - state.hintsUsed.length,
        score: state.score,
        ended: state.ended,
        startedAt: state.startedAt,
        endedAt: state.endedAt
      };
    }

    session = {
      mode: cfg.mode,
      getState,
      nextRound,
      guess,
      useHint,
      giveUp,
      end: finish,
      availableHintCategories: () => HINT_CATEGORIES.slice()
    };

    if (cfg.autoStart) nextRound();
    return session;
  }

  global.OrbisQuiz = {
    start,
    haversine,
    bearing,
    compass8,
    HINT_CATEGORIES,
    HINT_BUILDERS,
    CONTINENT_HUMAN
  };
})(window);
