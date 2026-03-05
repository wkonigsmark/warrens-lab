/**
 * Chronos Timeline Engine
 * Vertical Descent Version
 */

const timelineData = [
    {
        id: "big-bang",
        startYear: -13800000000,
        date: "13.8 Billion Years Ago",
        title: "The Big Bang",
        snippet: "The emergence of space, time, and matter from a cosmic singularity.",
        description: "Nearly 14 billion years ago, the universe began as a hot, dense point and has been expanding ever since. This cataclysmic inflation gave rise to the first atoms, stars, and eventually galaxies. It is the absolute zero of our history.",
        gap: 0,
        approx: false,
        sources: [
            {
                title: "The First Three Minutes",
                author: "Steven Weinberg",
                description: "A comprehensive look at the modern view of the early universe and the physical evidence for the Big Bang.",
                url: "https://www.google.com/search?q=The+First+Three+Minutes+Steven+Weinberg"
            },
            {
                title: "A Brief History of Time",
                author: "Stephen Hawking",
                description: "The seminal work explaining the evolution of the universe and the singularity that started it all.",
                url: "https://www.google.com/search?q=A+Brief+History+of+Time+Stephen+Hawking"
            },
            {
                title: "Discovery of Cosmic Microwave Background",
                author: "Penzias & Wilson (1964)",
                description: "The primary observational anchor for the Big Bang theory, documenting the residual heat of the explosion.",
                url: "https://journals.aps.org/pr/abstract/10.1103/PhysRev.142.417"
            }
        ]
    },
    {
        id: "earth-forms",
        startYear: -4500000000,
        date: "4.5 Billion Years Ago",
        title: "Formation of Earth",
        snippet: "A rocky planet coalesces in the goldilocks zone of a young star.",
        description: "Gravity pulls swirling gas and dust into the third planet from the sun. Earth begins as a molten inferno, eventually cooling to form the solid crust, atmosphere, and vast oceans that would eventually cradle life.",
        gap: 800,
        approx: false
    },
    {
        id: "life-begins",
        startYear: -3500000000,
        date: "3.5 Billion Years Ago",
        title: "The Spark of Life",
        snippet: "The first single-celled organisms emerge in Earth's primeval oceans.",
        description: "Deep in fossilized hydrothermal vents, simple prokaryotes begin a multibillion-year journey. This transition from chemistry to biology marks the most profound shift in the history of the planet.",
        gap: 600,
        approx: false
    },
    {
        id: "dinosaurs",
        startYear: -230000000,
        date: "230 – 66 Million BCE",
        title: "The Age of Dinosaurs",
        snippet: "Giant reptiles dominate the terrestrial landscape for over 160 million years.",
        description: "From the Triassic to the Cretaceous, dinosaurs were the undisputed masters of Earth. Their vast reign ended in fire and dust with the Chicxulub asteroid impact, clearing the path for the rise of mammals.",
        gap: 700,
        approx: true
    },
    {
        id: "homo-sapiens",
        startYear: -300000,
        date: "300,000 BCE",
        title: "Rise of Homo Sapiens",
        snippet: "Anatomically modern humans emerge in Africa.",
        description: "Equipped with cognitive capacity for language, art, and complex tools, Homo sapiens begin migrating across the planet, eventually outlasting all other hominid species through innovation and social structure.",
        gap: 600,
        approx: true
    },
    {
        id: "agriculture",
        startYear: -10000,
        date: "10,000 BCE",
        title: "Agricultural Revolution",
        snippet: "The shift from foraging to farming fundamentally transforms human society.",
        description: "In the Fertile Crescent, humans begin domesticating plants and animals. This Neolithic shift leads to permanent settlements, surplus food, and the eventual rise of specialized labor and social hierarchies.",
        gap: 500,
        approx: true
    },
    {
        id: "sumerians",
        startYear: -4500,
        date: "4500 – 1900 BCE",
        title: "Sumerian Civilization",
        snippet: "The world's first true civilization rises in southern Mesopotamia.",
        description: "In the land between the Tigris and Euphrates, the Sumerians invent writing (cuneiform), the wheel, and the plow. They build the first great city-states, like Uruk and Ur, establishing the blueprint for urban life.",
        gap: 400,
        approx: true
    },
    {
        id: "egyptians",
        startYear: -3100,
        date: "3100 BCE – 30 BCE",
        title: "The Egyptian Kingdoms",
        snippet: "A monumental civilization flourishes along the Nile for three millennia.",
        description: "Unified by Narmer, Egypt develops a complex society centered on the Pharaoh and the concept of Ma'at. Their achievements in architecture, medicine, and administrative organization remain unparalleled in antiquity.",
        gap: 300,
        approx: true
    },
    {
        id: "pyramids",
        startYear: -2630,
        date: "2630 – 1800 BCE",
        title: "Giza and the Pyramids",
        snippet: "The Old Kingdom constructs the last remaining Ancient Wonder of the World.",
        description: "Starting with Djoser's Step Pyramid and culminating in the Great Pyramid of Khufu (c. 2560 BCE), these structures required roughly 20-30 years each to complete. They serves as tombs and cosmic conduits for the Pharaohs.",
        gap: 200,
        approx: false
    },
    {
        id: "chinese-civ",
        startYear: -2100,
        date: "2100 BCE – Present",
        title: "Ancient Chinese Dynasties",
        snippet: "The Yellow River valley gives rise to one of Earth's oldest continuous civilizations.",
        description: "From the legendary Xia to the historical Shang and Zhou dynasties, China develops a unique cultural identity, mastering bronze, silk, and the foundational philosophies of Confucianism and Taoism.",
        gap: 300,
        approx: true
    },
    {
        id: "trojan-war",
        startYear: -1200,
        date: "1200 BCE",
        title: "The Trojan War",
        snippet: "The legendary conflict between the Greeks and the city of Troy.",
        description: "Immortalized in Homer's Iliad, the war is a cornerstone of Western literature. Modern archaeology at Hisarlik suggests a real historical catastrophic Bronze Age collapse event behind the myth.",
        gap: 300,
        approx: true
    },
    {
        id: "ethiopians",
        startYear: -800,
        date: "800 BCE – Present",
        title: "Kingdoms of Ethiopia",
        snippet: "From D'mt to Aksum, a unique power emerges in the Horn of Africa.",
        description: "The Kingdom of Aksum (rises c. 100 CE) became a major maritime trade power between Rome and India. It was one of the first empires to adopt Christianity and is the legendary home of the Ark of the Covenant.",
        gap: 300,
        approx: true
    },
    {
        id: "great-wall",
        startYear: -700,
        date: "7th Century BCE – 1644 CE",
        title: "The Great Wall of China",
        snippet: "A massive series of fortifications built to protect the Middle Kingdom.",
        description: "Started by independent states in the 700s BCE and later unified by Qin Shi Huang (c. 220 BCE), the wall was continuously expanded and rebuilt, most notably by the Ming Dynasty, spanning over 13,000 miles.",
        gap: 250,
        approx: false
    },
    {
        id: "christianity",
        startYear: 1,
        date: "1 AD – 33 AD",
        title: "The Birth of Christianity",
        snippet: "The life and execution of Jesus of Nazareth in Roman Judea.",
        description: "Documenting the historical life and death of Jesus, whose teachings led to the rise of Christianity. This period marks the pivot point for the Western calendar and a fundamental reshaping of global history through the spread of the early church.",
        gap: 400,
        approx: false
    },
    {
        id: "islam",
        startYear: 570,
        date: "570 – 632 AD",
        title: "The Rise of Islam",
        snippet: "The life of Muhammad and the founding of the Islamic faith.",
        description: "Muhammad, born in Mecca, becomes the prophet of Islam. His teachings and the subsequent expansion of the Rashidun Caliphate unified the Arabian Peninsula and established a global civilization that deeply influenced science, law, and philosophy.",
        gap: 500,
        approx: true
    }
];

function initChronos() {
    const container = document.getElementById('events-container');
    const progressBar = document.getElementById('progress-bar');
    const overlay = document.getElementById('event-detail-overlay');
    const closeBtn = document.getElementById('close-overlay');

    // Sort by start year
    const sortedData = [...timelineData].sort((a, b) => a.startYear - b.startYear);

    let blockCount = 0;
    // Build the timeline
    sortedData.forEach((event) => {
        // Add a gap spacer if needed
        if (event.gap > 0) {
            const spacer = document.createElement('div');
            spacer.style.height = `${event.gap}px`;
            container.appendChild(spacer);
        }

        const block = document.createElement('div');
        const isLeft = blockCount % 2 === 0;
        block.className = `event-block ${isLeft ? 'align-left' : 'align-right'}`;
        block.id = `block-${event.id}`;

        const approxPrefix = event.approx ? '<span class="approx-tag">Around </span>' : '';

        // Bibliography Bubble (Source Card)
        const hasSources = event.sources && event.sources.length > 0;
        const sourceHtml = hasSources ? `
            <div class="source-card ${isLeft ? 'to-right' : 'to-left'}">
                <div class="source-trigger" onclick="event.stopPropagation(); showSources('${event.id}')">
                    <span class="source-icon">📚</span>
                    <span class="source-text">Sources</span>
                </div>
            </div>
        ` : '';

        block.innerHTML = `
            <div class="event-card" onclick="showDetail('${event.id}')">
                <div class="event-meta">${approxPrefix}${event.date}</div>
                <h3>${event.title}</h3>
                <div class="event-preview">${event.snippet}</div>
                <div class="event-dot"></div>
            </div>
            ${sourceHtml}
        `;

        container.appendChild(block);
        blockCount++;
    });

    // Scroll Logic
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";

        // Reveal animations
        const blocks = document.querySelectorAll('.event-block');
        blocks.forEach(block => {
            const rect = block.getBoundingClientRect();
            const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
            if (rect.top <= viewHeight * 0.85) {
                block.classList.add('visible');
            }
        });
    });

    // Close Overlay
    closeBtn.onclick = () => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.onclick = (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
}

function showDetail(id) {
    const event = timelineData.find(e => e.id === id);
    if (!event) return;

    const overlay = document.getElementById('event-detail-overlay');
    const approxPrefix = event.approx ? 'Around ' : '';
    
    document.getElementById('detail-title').innerText = event.title;
    document.getElementById('detail-date').innerText = approxPrefix + event.date;
    document.getElementById('detail-description').innerText = event.description;

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function showSources(id) {
    const event = timelineData.find(e => e.id === id);
    if (!event || !event.sources) return;

    const overlay = document.getElementById('event-detail-overlay');
    document.getElementById('detail-title').innerText = `Sources: ${event.title}`;
    document.getElementById('detail-date').innerText = "Defensible Documentation";
    
    let sourceListHtml = '<div class="source-list">';
    event.sources.forEach(src => {
        sourceListHtml += `
            <div class="source-item">
                <div class="source-item-header">
                    <span class="source-item-title">${src.title}</span>
                    <span class="source-item-author">${src.author}</span>
                </div>
                <p class="source-item-desc">${src.description}</p>
                <a href="${src.url}" target="_blank" class="source-link">Access Work &rarr;</a>
            </div>
        `;
    });
    sourceListHtml += '</div>';
    
    document.getElementById('detail-description').innerHTML = sourceListHtml;

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Start
document.addEventListener('DOMContentLoaded', initChronos);
