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
        antarctica:    [4500, -3300],  // on the manually-drawn strip
        asia:          [7300, -7800],
        europe:        [4400, -9000],
        north_america: [2000, -8600],
        oceania:       [8700, -5700],
        south_america: [2700, -6100]
    };

    // Natural Earth's medium-res dataset omits Antarctica entirely.
    // We draw a stylized icy strip across the bottom of the world map.
    // Wavy top edge (ice shelf vibe), flat bottom, full map width.
    const ANTARCTICA_STRIP_PATH = `
        M -800 -3700
        C 200 -3900, 1400 -3500, 2400 -3700
        C 3400 -3900, 4500 -3500, 5500 -3700
        C 6500 -3900, 7700 -3500, 8700 -3700
        C 9700 -3900, 10500 -3600, 10800 -3700
        L 10800 -2900
        L -800 -2900
        Z`;

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

    // ---- Paint the manually-drawn Antarctica strip first ---------------
    // (so the real continents render on top of it if anything overlaps)
    const aPath = document.createElementNS(SVG_NS, "path");
    aPath.setAttribute("d", ANTARCTICA_STRIP_PATH.trim());
    aPath.setAttribute("class", "continent-shape antarctica-strip");
    aPath.setAttribute("data-continent", "antarctica");
    cg.appendChild(aPath);

    // ---- Paint each country, classed by continent ---------------------
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

    // ---- Place numbered circles (all uniform size now) -----------------
    ORDER.forEach((id, i) => {
        const pos = POSITIONS[id];
        if (!pos) return;
        const [x, y] = pos;

        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 380);
        circle.setAttribute("class", "number-bg");
        ng.appendChild(circle);

        const text = document.createElementNS(SVG_NS, "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("class", "number-text");
        text.textContent = String(i + 1);
        ng.appendChild(text);
    });
})();
