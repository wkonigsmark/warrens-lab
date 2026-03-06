const fs = require('fs');

async function fetchHistory() {
    console.log("Querying Wikidata for significant historical events...");

    // SPARQL Query targeting high-significance events and figures
    const sparqlQuery = `
    SELECT DISTINCT ?item ?itemLabel ?date ?description ?sitelinks ?typeLabel WHERE {
      {
        ?item wdt:P31/wdt:P279* wd:Q1190554 . # Historical event
      } UNION {
        ?item wdt:P31/wdt:P279* wd:Q198 . # War
      } UNION {
        ?item wdt:P31/wdt:P279* wd:Q12470 . # Revolution
      } UNION {
        ?item wdt:P31/wdt:P279* wd:Q13337 . # Scientific discovery
      } UNION {
        ?item wdt:P31/wdt:P279* wd:Q11835430 . # Invention
      } UNION {
        ?item wdt:P31 wd:Q5 . # Humans (for Newton, Da Vinci etc)
        ?item wikibase:sitelinks ?sitelinks .
        FILTER(?sitelinks > 100) # Only the most iconic figures
      }
      
      # Get date (point in time, start time, or birth date)
      { ?item wdt:P585 ?date . }
      UNION { ?item wdt:P580 ?date . }
      UNION { ?item wdt:P569 ?date . } # Birth date for people
      
      ?item wikibase:sitelinks ?sitelinks .
      FILTER(?sitelinks > 40) # Baseline significance
      
      ?item wdt:P31 ?type .
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      OPTIONAL { ?item schema:description ?description . FILTER(LANG(?description) = "en") }
    }
    ORDER BY ?date
    LIMIT 1000
    `;

    const url = "https://query.wikidata.org/sparql?query=" + encodeURIComponent(sparqlQuery);

    try {
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();

        const events = data.results.bindings.map(b => {
            const id = b.item.value.split('/').pop();
            const title = b.itemLabel.value;
            const rawDate = b.date.value;
            const sitelinks = parseInt(b.sitelinks.value);
            const desc = b.description ? b.description.value : "";

            // Parse date string (handles BCE)
            // Wikidata format: 2024-01-01T00:00:00Z or -1000-00-00T00:00:00Z
            let year = 0;
            let dateStr = "";

            if (rawDate.startsWith('-')) {
                const parts = rawDate.substring(1).split('-');
                year = -parseInt(parts[0]);
                dateStr = `${Math.abs(year)} BCE`;
            } else {
                year = parseInt(rawDate.split('-')[0]);
                dateStr = year < 1000 ? `${year} AD` : `${year}`;
            }

            // Significance Mapping
            // 1: > 150 sitelinks (High)
            // 2: 70-150 sitelinks (Medium)
            // 3: 40-70 sitelinks (Low)
            let sig = 3;
            if (sitelinks > 180) sig = 1;
            else if (sitelinks > 80) sig = 2;

            return {
                id,
                title,
                date: dateStr,
                startYear: year,
                description: desc,
                snippet: desc.substring(0, 100) + (desc.length > 100 ? "..." : ""),
                significance: sig,
                gap: 150
            };
        });

        // Filter out duplicates and anomalies (like years that aren't dates)
        const uniqueEvents = [];
        const seen = new Set();

        events.forEach(e => {
            if (!seen.has(e.id) && e.title.length < 60 && !/^\d+$/.test(e.title)) {
                uniqueEvents.push(e);
                seen.add(e.id);
            }
        });

        const output = `// Auto-generated Wikidata Historical Consensus
const wikidataHistory = ${JSON.stringify(uniqueEvents, null, 4)};
`;

        fs.writeFileSync('wikidata_consensus.js', output);
        console.log(`Successfully generated wikidata_consensus.js with ${uniqueEvents.length} events!`);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

fetchHistory();
