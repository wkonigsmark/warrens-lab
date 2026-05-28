/**
 * Orbis · Print Quiz · The 7 Continents
 *
 * Paints the world map by continent (each country grouped by its Natural Earth
 * `continent` property) and places a numbered circle on each one. The circles
 * sit at hand-tuned positions chosen for readability on a US-Letter worksheet.
 *
 * Number order (alphabetical, matches the answer-lines under the map):
 *   1 Africa · 2 Antarctica · 3 Asia · 4 Europe · 5 N. America · 6 Oceania · 7 S. America
 */
(async () => {
    const NE_TO_ID = {
        "Africa": "africa",
        "Antarctica": "antarctica",
        "Asia": "asia",
        "Europe": "europe",
        "North America": "north_america",
        "Oceania": "oceania",
        "South America": "south_america"
    };

    const ORDER = [
        "africa", "antarctica", "asia", "europe",
        "north_america", "oceania", "south_america"
    ];

    // SVG-space positions for each numbered circle.
    // viewBox is "-1000 -10000 11000 6200" (y inverted: north = more negative).
    // Tweak these to move a numbered badge into a more centered/readable spot.
    const POSITIONS = {
        africa:        [4400, -6300],
        antarctica:    [4500, -3950],  // on the thin strip at the bottom
        asia:          [7300, -7800],
        europe:        [4400, -9000],
        north_america: [2000, -8600],
        oceania:       [8700, -5700],
        south_america: [2700, -6100]
    };

    const SVG_NS = "http://www.w3.org/2000/svg";
    const cg = document.getElementById("continents-group");
    const ng = document.getElementById("numbers-group");

    // ---- Geometry helpers ----------------------------------------------
    function ringToPath(ring) {
        let d = "";
        for (let i = 0; i < ring.length; i++) {
            const [x, y] = ring[i];
            d += (i === 0 ? "M" : "L") + x + "," + (-y);
        }
        return d + "Z";
    }
    function featureToPathD(f) {
        const g = f.geometry;
        if (!g) return "";
        if (g.type === "Polygon") return g.coordinates.map(ringToPath).join(" ");
        if (g.type === "MultiPolygon") return g.coordinates.flatMap(p => p.map(ringToPath)).join(" ");
        return "";
    }

    // ---- Load data ------------------------------------------------------
    let geo;
    try {
        const res = await fetch("../data/world.geo.json", { cache: "no-store" });
        geo = await res.json();
    } catch (err) {
        console.error("Failed to load world.geo.json", err);
        return;
    }

    // ---- Paint each country, classed by continent ---------------------
    // Antarctica shows up as a thin strip at the bottom (Miller projection
    // squashes it). The inset below the map shows its real shape; the strip
    // here teaches kids "this is where Antarctica sits on the world map."
    for (const feature of geo.features) {
        const ne = feature.properties.continent;
        const id = NE_TO_ID[ne];
        if (!id) continue;
        const d = featureToPathD(feature);
        if (!d) continue;
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", d);
        path.setAttribute("class", "continent-shape");
        path.setAttribute("data-continent", id);
        cg.appendChild(path);
    }

    // ---- Place numbered circles ----------------------------------------
    // Antarctica's strip is too thin for a full-size badge, so it gets a smaller one.
    const NORMAL_RADIUS = 620;
    const NORMAL_FONT = 520;
    const ANTARCTICA_RADIUS = 220;
    const ANTARCTICA_FONT = 220;

    ORDER.forEach((id, i) => {
        const pos = POSITIONS[id];
        if (!pos) return;
        const [x, y] = pos;
        const isAntarctica = id === "antarctica";

        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", isAntarctica ? ANTARCTICA_RADIUS : NORMAL_RADIUS);
        circle.setAttribute("class", "number-bg");
        ng.appendChild(circle);

        const text = document.createElementNS(SVG_NS, "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("class", "number-text");
        if (isAntarctica) {
            text.setAttribute("font-size", String(ANTARCTICA_FONT));
        }
        text.textContent = String(i + 1);
        ng.appendChild(text);
    });
})();
