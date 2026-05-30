/**
 * Ants & Atlases Countries — country-level map renderer.
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
  // Mutable so pages in subfolders (e.g. print/) can point at "../data".
  let dataDir = "data";
  function setDataDir(dir) { dataDir = dir; }

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
    // cache: "no-store" forces a fresh fetch — these JSON files change as we expand
    // the atlas; without this, browsers serve stale copies even after script reloads.
    const [atlas, geo] = await Promise.all([
      fetch(`${dataDir}/atlas.json`, { cache: "no-store" }).then(r => r.json()),
      fetch(`${dataDir}/world.geo.json`, { cache: "no-store" }).then(r => r.json())
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

  // ---- Single-country silhouette ------------------------------------------

  /**
   * Build a self-contained silhouette for one country: an SVG path string plus a
   * tightly-framed viewBox. Used by the Shape Match game and the Shapes print quiz.
   *
   * Clusters polygons to drop geographically distant outliers (French Guiana on
   * the France feature, Alaska/Hawaii on the US) so the main landmass fills the
   * frame — while KEEPING nearby islands so archipelagos (Japan, Indonesia, NZ,
   * the Philippines) stay recognizable. Anchors on the largest polygon and keeps
   * any polygon whose center lies within `clusterFactor`× the main polygon's span.
   *
   * Returns { d, viewBox: [x,y,w,h] } in SVG space (y already inverted), or null.
   */
  function silhouette(iso2, options = {}) {
    const padRatio = options.padRatio ?? 0.08;
    const clusterFactor = options.clusterFactor ?? 3;
    const f = getFeature(iso2);
    if (!f || !f.geometry) return null;
    const g = f.geometry;

    // Collect each polygon's outer-ring bbox, area, center, and span.
    const polys = [];
    const addPoly = (rings) => {
      if (!rings || !rings.length) return;
      const b = ringBbox(rings[0]);
      polys.push({
        rings,
        b,
        area: (b.maxX - b.minX) * (b.maxY - b.minY),
        cx: (b.minX + b.maxX) / 2,
        cy: (b.minY + b.maxY) / 2,
        span: Math.hypot(b.maxX - b.minX, b.maxY - b.minY)
      });
    };
    if (g.type === "Polygon") addPoly(g.coordinates);
    else if (g.type === "MultiPolygon") g.coordinates.forEach(addPoly);
    if (!polys.length) return null;

    // Anchor on the largest polygon; keep neighbors within clusterFactor × its span.
    polys.sort((a, b) => b.area - a.area);
    const main = polys[0];
    const maxDist = Math.max(main.span * clusterFactor, 1);
    const kept = polys.filter(p => Math.hypot(p.cx - main.cx, p.cy - main.cy) <= maxDist);

    // Path string from all rings of kept polygons (ringToPath already inverts y).
    let d = "";
    for (const p of kept) for (const ring of p.rings) d += ringToPath(ring) + " ";

    // Union bbox of kept polygons → SVG viewBox (flip y, then pad).
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of kept) {
      if (p.b.minX < minX) minX = p.b.minX;
      if (p.b.minY < minY) minY = p.b.minY;
      if (p.b.maxX > maxX) maxX = p.b.maxX;
      if (p.b.maxY > maxY) maxY = p.b.maxY;
    }
    const svgMinX = minX, svgMaxX = maxX, svgMinY = -maxY, svgMaxY = -minY;
    const w = svgMaxX - svgMinX, h = svgMaxY - svgMinY;
    const padX = w * padRatio, padY = h * padRatio;
    return { d: d.trim(), viewBox: [svgMinX - padX, svgMinY - padY, w + 2 * padX, h + 2 * padY] };
  }

  /** Convenience: returns a complete <svg>…</svg> markup string for a country shape. */
  function silhouetteSVG(iso2, options = {}) {
    const s = silhouette(iso2, options);
    if (!s) return "";
    const cls = options.pathClass || "shape-path";
    const par = options.preserveAspectRatio || "xMidYMid meet";
    return `<svg viewBox="${s.viewBox.join(" ")}" preserveAspectRatio="${par}" class="${options.svgClass || "shape-svg"}">`
      + `<path d="${s.d}" class="${cls}" /></svg>`;
  }

  // ---- Rendering ----------------------------------------------------------

  /**
   * Render country paths into the given SVG <g> element.
   * options.filter      — (iso2, feature) => bool. If omitted, renders all.
   * options.levelFilter — number. If set, only countries with level <= this get the
   *                       `in-atlas` class (others dim as context). Countries not in
   *                       the atlas at all also stay dim. Defaults to "all in-atlas".
   * options.onClick     — (iso2, country?, ev) => void
   * options.onHover     — (iso2, country?) => void  (fires on mouseenter)
   * options.onUnhover   — () => void  (fires on mouseleave)
   * options.labelAtlas  — bool. When true, draw a tiny label at the centroid for in-atlas (in-tier) countries.
   */
  function renderInto(group, options = {}) {
    if (!state.loaded) throw new Error("AACountries: call load() first");
    group.innerHTML = "";

    const levelFilter = options.levelFilter;

    for (const f of state.geo.features) {
      const iso2 = (f.properties["iso-a2"] || f.properties["hc-a2"] || "").toUpperCase();
      if (options.filter && !options.filter(iso2, f)) continue;

      const d = featureToPathD(f);
      if (!d) continue;

      const country = state.byIso2.get(iso2) || null;
      const inAtlas = !!country;
      const inTier = inAtlas && (levelFilter == null || country.level <= levelFilter);

      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", d);
      path.setAttribute("class", "country-path" + (inTier ? " in-atlas" : " dim"));
      path.setAttribute("data-iso2", iso2);
      path.setAttribute("data-name", f.properties.name || "");

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

    if (options.labelAtlas) drawAtlasLabels(group, levelFilter);
  }

  function drawAtlasLabels(group, levelFilter) {
    for (const country of state.atlas.countries) {
      if (levelFilter != null && country.level > levelFilter) continue;
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
  // The default world view — must match the viewBox attribute on the SVG in index.html.
  const WORLD_VIEWBOX = [-1000, -10000, 11000, 6200];

  // Hand-curated representative ISOs per continent. Auto-bboxes break on continents like
  // Europe (UK + France span the globe via overseas territories) and Oceania (Pacific
  // island nations are spread across thousands of km). We pick "core" countries that
  // frame each continent the way a kid would expect.
  // Russia is intentionally excluded from Europe — its mainland spans 11 timezones and
  // would drag the bbox into Asia.
  const CONTINENT_ZOOM_ISOS = {
    africa:        ["EG", "ZA", "NG", "DZ", "KE", "ML", "ET"],
    asia:          ["CN", "JP", "IN", "KR", "SA", "TH", "ID", "IR"],
    europe:        ["DE", "FR", "ES", "IT", "GB", "PL", "GR", "NO"],
    north_america: ["US", "CA", "MX", "GT"],
    south_america: ["BR", "AR", "PE", "CO", "CL", "VE"],
    oceania:       ["AU", "NZ", "PG"]
  };

  // Bbox of just the largest polygon in a feature — kills outliers like
  // French Guiana on the France feature or Falkland Islands on the UK feature.
  function mainPolygonBbox(feature) {
    const g = feature.geometry;
    if (!g) return null;
    let best = null, bestArea = -1;
    const consider = ring => {
      const b = ringBbox(ring);
      const a = (b.maxX - b.minX) * (b.maxY - b.minY);
      if (a > bestArea) { bestArea = a; best = b; }
    };
    if (g.type === "Polygon") g.coordinates.forEach(consider);
    else if (g.type === "MultiPolygon") g.coordinates.forEach(p => p.forEach(consider));
    return best;
  }

  function viewBoxOfContinent(id, padRatio = 0.10) {
    if (!state.loaded) return null;
    const isos = CONTINENT_ZOOM_ISOS[id];
    if (!isos) return null;

    const bboxes = isos
      .map(iso => state.featByIso2.get(iso))
      .filter(Boolean)
      .map(mainPolygonBbox)
      .filter(Boolean);
    if (!bboxes.length) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const b of bboxes) {
      if (b.minX < minX) minX = b.minX;
      if (b.minY < minY) minY = b.minY;
      if (b.maxX > maxX) maxX = b.maxX;
      if (b.maxY > maxY) maxY = b.maxY;
    }

    // Flip Y into SVG space + pad
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

  // Animate an SVG element's viewBox attribute to a target [x, y, w, h] over `duration` ms.
  // Uses ease-out cubic. Cancels any prior animation on the same element.
  // Uses setTimeout instead of requestAnimationFrame so it works in hidden tabs
  // (RAF is suspended when document.visibilityState === 'hidden', e.g. headless testing).
  function animateViewBoxTo(svg, target, duration = 650) {
    if (!svg || !target) return;
    const current = svg.getAttribute("viewBox").split(/\s+/).map(parseFloat);
    if (current.every((v, i) => Math.abs(v - target[i]) < 0.5)) return;
    if (svg.__vbAnim) clearTimeout(svg.__vbAnim);
    const startTs = performance.now();
    const FRAME_MS = 16; // ~60fps
    function step() {
      const t = Math.min(1, (performance.now() - startTs) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      const vb = current.map((s, i) => s + (target[i] - s) * e);
      svg.setAttribute("viewBox", vb.join(" "));
      if (t < 1) svg.__vbAnim = setTimeout(step, FRAME_MS);
      else svg.__vbAnim = null;
    }
    svg.__vbAnim = setTimeout(step, FRAME_MS);
  }

  function resetViewBox(svg, animated = false) {
    if (animated) animateViewBoxTo(svg, WORLD_VIEWBOX);
    else svg.setAttribute("viewBox", WORLD_VIEWBOX.join(" "));
  }

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

  global.AACountries = {
    load,
    setDataDir,
    silhouette,
    silhouetteSVG,
    renderInto,
    viewBoxOf,
    viewBoxOfContinent,
    animateViewBoxTo,
    resetViewBox,
    WORLD_VIEWBOX,
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
