/**
 * Ants & Atlases · Print Quiz · The 5 Oceans
 *
 * Same world-map base as the continents worksheet (so kids see the familiar
 * map), but the numbered circles label the five oceans, not the continents.
 *
 * Number order (alphabetical, matches the answer lines under the map):
 *   1 Arctic · 2 Atlantic · 3 Indian · 4 Pacific · 5 Southern
 */
(async () => {
    const NE_TO_ID = {
        "Africa": "africa",
        "Asia": "asia",
        "Europe": "europe",
        "North America": "north_america",
        "Oceania": "oceania",
        "South America": "south_america"
    };

    const ORDER = ["arctic", "atlantic", "indian", "pacific", "southern"];

    // SVG-space positions chosen for each ocean's clearest water area.
    // viewBox is "-1000 -10000 11000 7400" (y inverted: north = more negative).
    const POSITIONS = {
        arctic:   [4800, -9600],   // top of map, north of Russia/Canada
        atlantic: [3300, -7000],   // between Brazil and West Africa
        indian:   [6700, -6300],   // central Indian Ocean, south of India
        pacific:  [200,  -7300],   // east Pacific, west of Mexico
        southern: [4500, -4000]    // ring around Antarctica (just above strip)
    };

    // Antarctica strip — same hand-drawn shape used on the continents worksheet
    // so the lower border of the map looks intentional and kids can locate the
    // Southern Ocean relative to a recognizable feature.
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

    // ---- Antarctica strip first (so continents render on top if any overlap)
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

    // ---- Place numbered circles on each ocean --------------------------
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
