/**
 * Chronos Significance Engine
 * Automates the scoring of historical events based on the Chronos Level 1/2/3 Rubric.
 */

const CHRONOS_RUBRIC = {
    1: {
        label: "Core Chronos / Near-Universal",
        definition: "Events with broad, enduring impact on how most of modern society is organized, understood, or remembered."
    },
    2: {
        label: "Major but Supporting",
        definition: "Important bridge events, major figures, or major regional developments that matter a great deal but are not the tightest universal starter set."
    },
    3: {
        label: "Important Enrichment",
        definition: "Strong cultural or intellectual additions that enrich the timeline but are not core foundational nodes for a first-pass child-level Chronos canon."
    }
};

const CHRONOS_KEYWORDS = {
    L1: [
        "writing", "alphabet", "script", "cuneiform", "hieroglyph",
        "agriculture", "farming", "domestication",
        "industrial", "steam", "factory", "mechanization",
        "constitution", "declaration", "independence", "democracy", "republic",
        "state formation", "unification", "centralized government",
        "printing press", "movable type", "mass communication",
        "global war", "world war", "pandemic", "black death", "plague",
        "relativity", "physics", "evolution", "gravity", "principia",
        "moon landing", "space exploration", "apollo",
        "internet", "digital", "computers"
    ],
    L2: [
        "philosophy", "socrates", "plato", "aristotle", "confucius",
        "conquest", "empire expansion", "alexander", "caesar", "napoleon",
        "city founding", "rome", "athens", "jericho",
        "epic literature", "homer", "iliad", "odyssey",
        "maritime expansion", "viking", "voyage", "exploration",
        "observational astronomy", "telescope", "galileo",
        "monumental architecture", "ziggurat", "pyramid", "cathedral"
    ],
    L3: [
        "music", "composer", "bach", "mozart", "beethoven",
        "painting", "sculpture", "renaissance polymath", "da vinci",
        "birth of", "life of", // Individual markers without broad systemic change
        "religious conflict", "crusade", // Often categorized as 2, but specific episodes can be 3
        "local reform", "regional event"
    ]
};

/**
 * Automatically suggests a significance level for a given event.
 * @param {Object} event - The event object (metadata + description)
 * @returns {number} Suggested Level (1, 2, or 3)
 */
function suggestSignificance(event) {
    const text = (event.event_name + " " + event.description + " " + event.category).toLowerCase();
    
    // 1. Check for Level 1 Keywords
    for (const kw of CHRONOS_KEYWORDS.L1) {
        if (text.includes(kw)) return 1;
    }

    // 2. Check for Level 2 Keywords
    for (const kw of CHRONOS_KEYWORDS.L2) {
        if (text.includes(kw)) return 2;
    }

    // 3. Check for Level 3 Keywords
    for (const kw of CHRONOS_KEYWORDS.L3) {
        if (text.includes(kw)) return 3;
    }

    // 4. Default rules based on scale and time
    const regionScale = (event.region || "").toLowerCase();
    if (regionScale === "global" || regionScale === "universe") {
        return 2; // Broad but not necessarily 'Foundational Operating System' Level 1
    }

    // Deep time context (Theoretical/Theoretical-Human)
    if (event.year_numeric < -10000) {
        return 2; // Contextual history
    }

    // Fallback
    return 3;
}

if (typeof module !== 'undefined') {
    module.exports = { suggestSignificance, CHRONOS_RUBRIC };
}
