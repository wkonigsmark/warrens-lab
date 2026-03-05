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
        approx: false,
        sources: [
            {
                title: "The Age of the Earth",
                author: "Allegre, Manhes, & Gopel (1995)",
                description: "This definitive work in Geochimica et Cosmochimica Acta utilized isotope analysis to anchor the 4.5 billion year age of our planet.",
                url: "https://www.google.com/search?q=Allegre+Manhes+Gopel+Age+of+the+Earth+1995"
            },
            {
                title: "Origin of the Moon in a Giant Impact",
                author: "Canup & Asphaug (2001)",
                description: "The primary paper detailing the 'Giant Impact Hypothesis,' where a Mars-sized body strike on the proto-Earth led to the formation of the Moon.",
                url: "https://www.nature.com/articles/35089010"
            },
            {
                title: "Zircons and the Early Earth",
                author: "Wilde et al. (2001)",
                description: "Discovery of 4.4 billion-year-old zircon crystals, providing the first solid evidence that Earth had a crust and liquid water much earlier than previously thought.",
                url: "https://www.nature.com/articles/35051550"
            },
            {
                title: "The Hadean Crust",
                author: "T. Mark Harrison (2009)",
                description: "A comprehensive review of the geochemical evidence for the first 500 million years of Earth's history.",
                url: "https://www.annualreviews.org/doi/abs/10.1146/annurev.earth.031208.094218"
            }
        ]
    },
    {
        id: "life-begins",
        startYear: -3500000000,
        date: "3.5 Billion Years Ago",
        title: "The Spark of Life",
        snippet: "The first single-celled organisms emerge in Earth's primeval oceans.",
        description: "Deep in fossilized hydrothermal vents, simple prokaryotes begin a multibillion-year journey. This transition from chemistry to biology marks the most profound shift in the history of the planet.",
        gap: 600,
        approx: false,
        sources: [
            {
                title: "Evidence for early life in Earth’s oldest hydrothermal vent precipitates",
                author: "Dodd et al. (2017)",
                description: "Published in Nature, this paper presents evidence of 3.77-billion-year-old microfossils, pushing back the confirmed timeline of life's emergence.",
                url: "https://www.nature.com/articles/nature21377"
            },
            {
                title: "On the origins of cells",
                author: "Martin & Russell (2003)",
                description: "A foundational hypothesis proposing that life originated in submarine hydrothermal vents, where rocky mounds acted as the first cell-like structures.",
                url: "https://royalsocietypublishing.org/doi/10.1098/rstb.2002.1183"
            },
            {
                title: "The Vital Question",
                author: "Nick Lane (2015)",
                description: "A comprehensive synthesis of bioenergetics, arguing that life's origin is inextricably linked to energy gradients at the seafloor.",
                url: "https://www.google.com/search?q=Nick+Lane+The+Vital+Question"
            },
            {
                title: "Microfossils of the Apex Chert",
                author: "J. William Schopf (1993)",
                description: "The classic (though debated) Science paper documenting some of the oldest known cellular structures in the fossil record.",
                url: "https://www.science.org/doi/10.1126/science.8475383"
            }
        ]
    },
    {
        id: "dinosaurs",
        startYear: -230000000,
        date: "230 – 66 Million BCE",
        title: "The Age of Dinosaurs",
        snippet: "Giant reptiles dominate the terrestrial landscape for over 160 million years.",
        description: "From the Triassic to the Cretaceous, dinosaurs were the undisputed masters of Earth. Their vast reign ended in fire and dust with the Chicxulub asteroid impact, clearing the path for the rise of mammals.",
        gap: 700,
        approx: true,
        sources: [
            {
                title: "Extraterrestrial Cause for the Cretaceous-Tertiary Extinction",
                author: "Alvarez, Alvarez, Asaro, & Michel (1980)",
                description: "The groundbreaking Science paper that proposed the asteroid impact theory based on iridium anomalies in the geological record.",
                url: "https://www.science.org/doi/10.1126/science.208.4448.1095"
            },
            {
                title: "The origin and diversification of dinosaurs",
                author: "Brusatte et al. (2015)",
                description: "A comprehensive review of the evolutionary journey of dinosaurs from the Triassic through their dominance in the Jurassic and Cretaceous.",
                url: "https://onlinelibrary.wiley.com/doi/full/10.1111/brv.12112"
            },
            {
                title: "Osteology of Deinonychus antirrhopus",
                author: "John H. Ostrom (1969)",
                description: "The pivotal work that sparked the 'Dinosaur Renaissance' by proposing dinosaurs were active, warm-blooded animals and the ancestors of birds.",
                url: "https://www.google.com/search?q=John+Ostrom+Deinonychus+1969+Peabody+Museum"
            },
            {
                title: "Four-winged dinosaurs from China",
                author: "Xu et al. (2003)",
                description: "Discovery of Microraptor, providing critical evidence for the evolution of flight and the bird-dinosaur link.",
                url: "https://www.nature.com/articles/nature01342"
            }
        ]
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
        id: "stonehenge",
        startYear: -3000,
        date: "c. 3000 – 2000 BCE",
        title: "Construction of Stonehenge",
        snippet: "A prehistoric monument in England aligned with the sun.",
        description: "Built in various phases over a thousand years, Stonehenge remains one of the world's most famous megalithic sites. Its architectural precision and solar alignments suggest advanced knowledge of astronomy and a complex social structure among Neolithic peoples.",
        gap: 300,
        approx: true
    },
    {
        id: "athens",
        startYear: -1400,
        date: "c. 1400 BCE",
        title: "The Rise of Athens",
        snippet: "Settlements begin on the Acropolis, foundations for the future of democracy.",
        description: "Starting as a Mycenaean stronghold, Athens would grow into a dominant Greek city-state. It became the epicenter of art, philosophy, and the democratic experiment, fundamentally influencing the trajectory of Western civilization.",
        gap: 300,
        approx: true
    },
    {
        id: "sparta",
        startYear: -900,
        date: "c. 900 BCE",
        title: "The Spartan City-State",
        snippet: "A militaristic society rises in the Eurotas valley.",
        description: "Sparta's unique social system focused on military training and physical excellence. Known for its hoplite army and the dual kingship, it became the primary rival to Athens and a major power in the Peloponnese.",
        gap: 250,
        approx: true
    },
    {
        id: "rome-founding",
        startYear: -753,
        date: "c. 753 BCE",
        title: "Founding of Rome",
        snippet: "The legendary establishment of the eternal city by Romulus.",
        description: "According to myth, Rome was founded on the Palatine Hill. From a collection of shepherd huts, it evolved into a Republic and eventually an Empire that governed the entire Mediterranean world for centuries.",
        gap: 200,
        approx: true
    },
    {
        id: "cyrus-the-great",
        startYear: -600,
        date: "c. 600 – 530 BCE",
        title: "Cyrus the Great of Persia",
        snippet: "The founding of the Achaemenid Empire.",
        description: "Cyrus II created the largest empire the world had yet seen. Known for his policy of religious tolerance and the liberation of the Jews from Babylon, he established the first model for a multicultural superpower.",
        gap: 300,
        approx: true
    },
    {
        id: "confucius",
        startYear: -551,
        date: "551 – 479 BCE",
        title: "Life of Confucius",
        snippet: "The philosopher whose teachings shaped East Asian ethics and governance.",
        description: "Kong Fuzi (Confucius) emphasized personal and governmental morality, correctness of social relationships, justice, and sincerity. His philosophy eventually became the official state ideology of imperial China.",
        gap: 200,
        approx: false
    },
    {
        id: "xerxes",
        startYear: -518,
        date: "c. 518 – 465 BCE",
        title: "Xerxes of Persia",
        snippet: "The Fourth King of Kings of the Achaemenid Empire.",
        description: "Known for his massive invasion of Greece, Xerxes is a central figure in the Greco-Persian Wars. Despite the setback at Salamis, his reign saw the height of Persian architectural ambition, including the Palace of Persepolis.",
        gap: 200,
        approx: true
    },
    {
        id: "thermopylae",
        startYear: -480,
        date: "480 BCE",
        title: "Battle of Thermopylae",
        snippet: "The legendary stand of the 300 Spartans against Persia.",
        description: "A coalition of Greek city-states led by King Leonidas held the narrow pass of Thermopylae for three days. While a tactical defeat, it became a moral victory and a symbol of resistance against overwhelming odds.",
        gap: 150,
        approx: false
    },
    {
        id: "greek-philosophers",
        startYear: -470,
        date: "c. 470 – 322 BCE",
        title: "Socrates, Plato, & Aristotle",
        snippet: "The Golden Age of Western Philosophy.",
        description: "This span encompasses the lives of the three thinkers who laid the foundation for Western logic, science, and ethics. From the Socratic Method to Plato's Academy and Aristotle's Lyceum, their influence is unparalleled.",
        gap: 300,
        approx: true
    },
    {
        id: "alexander-great",
        startYear: -356,
        date: "356 – 323 BCE",
        title: "Alexander the Great",
        snippet: "The Macedonian king who conquered the known world.",
        description: "Alexander III created one of the largest empires in history by the age of 30, from Greece to India. His conquests launched the Hellenistic period, blending Greek culture with the East.",
        gap: 200,
        approx: false
    },
    {
        id: "archimedes",
        startYear: -287,
        date: "c. 287 – 212 BCE",
        title: "Inventions of Archimedes",
        snippet: "The greatest mathematician and engineer of antiquity.",
        description: "Archimedes of Syracuse anticipated modern calculus, discovered the principles of buoyancy and the lever, and designed advanced machines for the defense of his city against the Romans.",
        gap: 200,
        approx: true
    },
    {
        id: "julius-caesar",
        startYear: -100,
        date: "100 – 44 BCE",
        title: "The Era of Julius Caesar",
        snippet: "The transition from the Roman Republic to the Roman Empire.",
        description: "A brilliant general and politician, Caesar's crossing of the Rubicon led to civil war and his appointment as Dictator for Life. His assassination on the Ides of March fundamentally altered the course of Rome.",
        gap: 300,
        approx: false
    },
    {
        id: "rome-collapse",
        startYear: 476,
        date: "476 AD",
        title: "The Collapse of Western Rome",
        snippet: "The deposition of Romulus Augustulus and the end of the ancient world.",
        description: "Decades of internal instability and external pressure culminate in the Germanic leader Odoacer deposing the last Western emperor. This event traditionally marks the beginning of the Middle Ages in Europe.",
        gap: 500,
        approx: false
    },
    {
        id: "celtic-culture",
        startYear: 800,
        date: "c. 800 BCE – 1st Century AD",
        title: "Rise of the Celtic Culture",
        snippet: "The spread of the Iron Age Hallstatt and La Tene cultures.",
        description: "While roots go back further, the Celts became a dominant cultural force across Europe. Known for their intricate metalwork, druidic traditions, and fierce warriors, they dominated the landscape before the expansion of Rome.",
        gap: 400,
        approx: true
    },
    {
        id: "leif-erikson",
        startYear: 970,
        date: "c. 970 – 1020 AD",
        title: "Leif Erikson reaches Vinland",
        snippet: "The first known European to reach North America.",
        description: "Long before Columbus, the Norse explorer Leif Erikson established a settlement in 'Vinland' (likely Newfoundland). His voyages demonstrate the incredible maritime reach of the Viking age.",
        gap: 600,
        approx: true
    },
    {
        id: "roses-war",
        startYear: 1455,
        date: "1455 – 1487 AD",
        title: "Wars of the Roses",
        snippet: "The dynastic struggle for the throne of England.",
        description: "A series of civil wars between supporters of the House of Lancaster (Red Rose) and the House of York (White Rose). The conflict ended with the rise of the Tudor dynasty under Henry VII.",
        gap: 400,
        approx: false
    },
    {
        id: "copernicus",
        startYear: 1473,
        date: "1473 – 1543 AD",
        title: "Copernican Revolution",
        snippet: "The shift from Earth-centered to Sun-centered astronomy.",
        description: "Nicolaus Copernicus proposed that the Earth and planets revolve around the Sun. His work, 'On the Revolutions of the Celestial Spheres', sparked the Scientific Revolution and changed our place in the cosmos.",
        gap: 200,
        approx: false
    },
    {
        id: "columbus",
        startYear: 1492,
        date: "1492 AD",
        title: "Voyage of Columbus",
        snippet: "Spanish-backed exploration reaches the Caribbean.",
        description: "Seeking a westward route to Asia, Christopher Columbus landed in the Americas. This event initiated centuries of European exploration, colonization, and global exchange across the Atlantic.",
        gap: 200,
        approx: false
    },
    {
        id: "spanish-armada",
        startYear: 1588,
        date: "1588 AD",
        title: "Defeat of the Spanish Armada",
        snippet: "Elizabethan England fends off the massive Spanish fleet.",
        description: "Sent by Philip II to invade England, the Armada was decimated by fire ships and the 'Protestant Wind'. The victory established England as a major maritime power and saved the Protestant Reformation in Britain.",
        gap: 250,
        approx: false
    },
    {
        id: "colonies-founding",
        startYear: 1607,
        date: "1607 – 1620 AD",
        title: "Jamestown & Plymouth",
        snippet: "The first permanent English settlements in North America.",
        description: "From the survival struggle of Jamestown (1607) to the arrival of the Mayflower at Plymouth Rock (1620), these colonies established the cultural and political foundations of what would become the United States.",
        gap: 300,
        approx: false
    },
    {
        id: "independence",
        startYear: 1776,
        date: "July 4, 1776",
        title: "Declaration of Independence",
        snippet: "The thirteen colonies formally break from the British Empire.",
        description: "Drafted primarily by Thomas Jefferson, the declaration stated the philosophical and practical reasons for the American Revolution, asserting that 'all men are created equal' with unalienable rights.",
        gap: 300,
        approx: false
    },
    {
        id: "constitution",
        startYear: 1787,
        date: "1787 – 1788 AD",
        title: "U.S. Constitution Ratified",
        snippet: "The establishment of the supreme law of the United States.",
        description: "In Philadelphia, the framers created the framework for the three branches of government and the checks and balances system that remains the foundation of American democracy.",
        gap: 200,
        approx: false
    }
];

// Feature: Today's Chronicle (Live Pulse)
const todayPulse = {
    date: "March 4, 2026",
    news: [
        {
            category: "Archaeology",
            title: "Ireland's 'Prehistoric Metropolis' Revealed",
            snippet: "The Brusselstown Ring survey discovers up to 600 house platforms, redefining ancient urbanism.",
            description: "New evidence from County Wicklow suggests that Irish urban traditions are 3,000 years older than previously thought. The survey of the Brusselstown Ring hillfort (1200 - 400 BCE) reveals a massive prehistoric settlement, challenging the narrative that large-scale urban centers only arrived with the Vikings.",
            url: "https://www.archaeology.org/"
        },
        {
            category: "Scientific Discovery",
            title: "Massive 'City of Fish Nests' found in Antarctica",
            snippet: "An expedition discovers millions of icefish nests in the Weddell Sea.",
            description: "Researchers from the Alfred Wegener Institute have mapped a colonial breeding area of icefish covering 240 square kilometers. This 'underwater city' provides a rare glimpse into the resilience of marine life in extreme polar environments.",
            url: "https://www.sciencedaily.com/"
        }
    ]
};

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
        // ... (existing loop content) ...
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

    // Add Terminal "Live Pulse" Node
    const liveSpacer = document.createElement('div');
    liveSpacer.style.height = '400px';
    container.appendChild(liveSpacer);

    const liveBlock = document.createElement('div');
    liveBlock.className = 'event-block live-pulse-block';
    liveBlock.innerHTML = `
        <div class="live-pulse-card">
            <div class="live-tag"><span class="pulse-dot"></span> LIVE PULSE: ${todayPulse.date}</div>
            <h2>Today's Chronicle</h2>
            <div class="live-news-container">
                ${todayPulse.news.map(item => `
                    <div class="live-item">
                        <span class="live-cat">${item.category}</span>
                        <h4>${item.title}</h4>
                        <p>${item.snippet}</p>
                        <a href="${item.url}" target="_blank" class="live-link">Read Full Report &rarr;</a>
                    </div>
                `).join('')}
            </div>
            <div class="event-dot live-dot"></div>
        </div>
    `;
    container.appendChild(liveBlock);

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

    function hideOverlay() {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Close Overlay
    closeBtn.onclick = hideOverlay;

    window.onclick = (e) => {
        if (e.target === overlay) hideOverlay();
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.style.display === 'flex') {
            hideOverlay();
        }
    });
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
