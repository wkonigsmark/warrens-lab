/**
 * Orbis Countries — country-level map renderer.
 * Loads atlas.json (curated country data) and world.geo.json (Natural Earth shapes),
 * exposes a small API for rendering, lookup, and bbox/zoom.
 *
 * Coordinate system: world.geo.json y-axis points north (positive = north).
 * SVG y points down. We invert y on render so south is at the bottom.
 * The existing viewBox in index.html (-1000 -10000 11000 6200) already
 * matches this convention.
 */
(function (global) {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const DATA_DIR = "data";

  const state = {
    loaded: false,
    atlas: null,
    geo: null,
    byIso2: new Map(),     // ISO-A2 → country atlas record
    featByIso2: new Map(), // ISO-A2 → geo feature
    inAtlas: new Set()     // ISO-A2 in the curated atlas
  };

  async function load() {
    if (state.loaded) return;
    const [atlas, geo] = await Promise.all([
      fetch(`${DATA_DIR}/atlas.json`).then(r => r.json()),
      fetch(`${DATA_DIR}/world.geo.json`).then(r => r.json())
    ]);

    state.atlas = atlas;
    state.geo = geo;

    for (const c of atlas.countries) {
      state.byIso2.set(c.iso_a2, c);
      state.inAtlas.add(c.iso_a2);
    }
    for (const f of geo.features) {
      const iso2 = (f.properties["iso-a2"] || f.properties["hc-a2"] || "").toUpperCase();
      if (iso2) state.featByIso2.set(iso2, f);
    }
    state.loaded = true;
  }

  // ---- Path conversion ----------------------------------------------------

  function ringToPath(ring) {
    let d = "";
    for (let i = 0; i < ring.length; i++) {
      const [x, y] = ring[i];
      d += (i === 0 ? "M" : "L") + x + "," + (-y);
    }
    return d + "Z";
  }

  function featureToPathD(feature) {
    const g = feature.geometry;
    if (!g) return "";
    if (g.type === "Polygon") {
      return g.coordinates.map(ringToPath).join(" ");
    }
    if (g.type === "MultiPolygon") {
      return g.coordinates.flatMap(poly => poly.map(ringToPath)).join(" ");
    }
    return "";
  }

  // ---- Rendering ----------------------------------------------------------

  /**
   * Render country paths into the given SVG <g> element.
   * options.filter      — (iso2, feature) => bool. If omitted, renders all.
   * options.onClick     — (iso2, country?, ev) => void
   * options.onHover     — (iso2, country?) => void  (fires on mouseenter)
   * options.onUnhover   — () => void  (fires on mouseleave)
   * options.labelAtlas  — bool. When true, draw a tiny label at the centroid for in-atlas countries.
   */
  function renderInto(group, options = {}) {
    if (!state.loaded) throw new Error("OrbisCountries: call load() first");
    group.innerHTML = "";

    for (const f of state.geo.features) {
      const iso2 = (f.properties["iso-a2"] || f.properties["hc-a2"] || "").toUpperCase();
      if (options.filter && !options.filter(iso2, f)) continue;

      const d = featureToPathD(f);
      if (!d) continue;

      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", d);
      path.setAttribute("class", "country-path" + (state.inAtlas.has(iso2) ? " in-atlas" : " dim"));
      path.setAttribute("data-iso2", iso2);
      path.setAttribute("data-name", f.properties.name || "");

      const country = state.byIso2.get(iso2) || null;

      if (options.onClick) {
        path.addEventListener("click", ev => options.onClick(iso2, country, ev));
      }
      if (options.onHover) {
        path.addEventListener("mouseenter", () => options.onHover(iso2, country));
      }
      if (options.onUnhover) {
        path.addEventListener("mouseleave", options.onUnhover);
      }

      group.appendChild(path);
    }

    if (options.labelAtlas) drawAtlasLabels(group);
  }

  function drawAtlasLabels(group) {
    for (const country of state.atlas.countries) {
      const f = state.featByIso2.get(country.iso_a2);
      if (!f) continue;
      const [cx, cy] = centroidOfFeature(f);
      if (cx == null) continue;
      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", cx);
      text.setAttribute("y", -cy);
      text.setAttribute("class", "country-label");
      text.setAttribute("text-anchor", "middle");
      text.textContent = country.iso_a2;
      group.appendChild(text);
    }
  }

  // ---- Geometry helpers ---------------------------------------------------

  function bboxOfFeature(f) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const walk = ring => {
      for (const [x, y] of ring) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    };
    const g = f.geometry;
    if (!g) return null;
    if (g.type === "Polygon") g.coordinates.forEach(walk);
    else if (g.type === "MultiPolygon") g.coordinates.forEach(p => p.forEach(walk));
    return { minX, minY, maxX, maxY };
  }

  function centroidOfFeature(f) {
    // Picks the largest ring's bbox-center. Good enough for labels.
    const g = f.geometry;
    if (!g) return [null, null];
    let bestRing = null, bestArea = -1;
    const consider = ring => {
      const b = ringBbox(ring);
      const area = (b.maxX - b.minX) * (b.maxY - b.minY);
      if (area > bestArea) { bestArea = area; bestRing = b; }
    };
    if (g.type === "Polygon") g.coordinates.forEach(consider);
    else if (g.type === "MultiPolygon") g.coordinates.forEach(p => p.forEach(consider));
    if (!bestRing) return [null, null];
    return [
      (bestRing.minX + bestRing.maxX) / 2,
      (bestRing.minY + bestRing.maxY) / 2
    ];
  }

  function ringBbox(ring) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY };
  }

  /**
   * Returns an SVG-space viewBox string [x, y, w, h] that frames the given features.
   * Accepts: array of features, array of iso2s, single iso2, or single feature.
   * Pads by `padRatio` (default 0.15) on each side.
   */
  function viewBoxOf(target, padRatio = 0.15) {
    const features = normalizeTargets(target);
    if (!features.length) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const f of features) {
      const b = bboxOfFeature(f);
      if (!b) continue;
      if (b.minX < minX) minX = b.minX;
      if (b.minY < minY) minY = b.minY;
      if (b.maxX > maxX) maxX = b.maxX;
      if (b.maxY > maxY) maxY = b.maxY;
    }
    if (!isFinite(minX)) return null;

    // Flip Y for SVG space.
    const svgMinX = minX;
    const svgMaxX = maxX;
    const svgMinY = -maxY;
    const svgMaxY = -minY;

    const w = svgMaxX - svgMinX;
    const h = svgMaxY - svgMinY;
    const padX = w * padRatio;
    const padY = h * padRatio;
    return [svgMinX - padX, svgMinY - padY, w + 2 * padX, h + 2 * padY];
  }

  function normalizeTargets(target) {
    if (!target) return [];
    if (Array.isArray(target)) {
      if (!target.length) return [];
      if (typeof target[0] === "string") {
        return target.map(iso => state.featByIso2.get(iso.toUpperCase())).filter(Boolean);
      }
      return target;
    }
    if (typeof target === "string") {
      const f = state.featByIso2.get(target.toUpperCase());
      return f ? [f] : [];
    }
    return [target];
  }

  // ---- Lookup API ---------------------------------------------------------

  function getCountry(iso2) { return state.byIso2.get(iso2?.toUpperCase()) || null; }
  function getFeature(iso2) { return state.featByIso2.get(iso2?.toUpperCase()) || null; }
  function isInAtlas(iso2) { return state.inAtlas.has(iso2?.toUpperCase()); }
  function allCountries() { return state.atlas?.countries ?? []; }
  function allFeatures() { return state.geo?.features ?? []; }
  function continents() { return state.atlas?.continents ?? []; }

  global.OrbisCountries = {
    load,
    renderInto,
    viewBoxOf,
    bboxOfFeature,
    centroidOfFeature,
    getCountry,
    getFeature,
    isInAtlas,
    allCountries,
    allFeatures,
    continents
  };
})(window);
