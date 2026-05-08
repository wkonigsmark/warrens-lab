const CHROMATIC_SCALE = [
    'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'
];

const CHORD_FORMS = {
    'maj': [0, 4, 7],
    'min': [0, 3, 7],
    'dim': [0, 3, 6],
    'aug': [0, 4, 8],
    'dom7': [0, 4, 7, 10],
    'maj7': [0, 4, 7, 11],
    'min7': [0, 3, 7, 10],
    'm7b5': [0, 3, 6, 10],
    'dim7': [0, 3, 6, 9],
    'maj6': [0, 4, 7, 9],
    'min6': [0, 3, 7, 9],
    'dom9': [0, 4, 7, 10, 2],
    'dom7b9': [0, 4, 7, 10, 1],
    'dom11': [0, 4, 7, 10, 2, 5],
    'dom13': [0, 4, 7, 10, 9],
    'dom13_9': [0, 4, 7, 10, 2, 9],
    'dom13b9': [0, 4, 7, 10, 1, 9],
    'dom13s11': [0, 4, 7, 10, 6, 9],
    'maj9': [0, 4, 7, 11, 2],
    'maj13': [0, 4, 7, 11, 9],
    'min9': [0, 3, 7, 10, 2],
    'min11': [0, 3, 7, 10, 5],
    'min13': [0, 3, 7, 10, 9],
    'sus4': [0, 5, 7],
    '7sus4': [0, 5, 7, 10],
    'sus2': [0, 2, 7]
};

let SCALES_DATA = [];
let currentScaleNotes = [];
let currentMode = 'CHORD'; // 'CHORD' or 'SCALE'

const STRINGS = [
    { startNote: 'E', octave: 5 }, // High e (Written)
    { startNote: 'B', octave: 4 },
    { startNote: 'G', octave: 4 },
    { startNote: 'D', octave: 4 },
    { startNote: 'A', octave: 3 },
    { startNote: 'E', octave: 3 }  // Low E (Written)
];

const NOTE_NAME_TO_STEP = { 'C': 0, 'C#': 0, 'Db': 1, 'D': 1, 'D#': 1, 'Eb': 2, 'E': 2, 'F': 3, 'F#': 3, 'Gb': 4, 'G': 4, 'G#': 4, 'Ab': 5, 'A': 5, 'A#': 5, 'Bb': 6, 'B': 6 };
// More precise: map to white-key index
const NAME_TO_BASE_STEP = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };

function formatNoteName(name) {
    if (!name) return "";
    return name.replace(/b/g, '♭').replace(/#/g, '♯');
}

const FRET_COUNT = 17;
const INLAY_FRETS = [3, 5, 7, 9, 12, 15, 17];
let currentChordNotes = [];

function initFretboard() {
    const board = document.getElementById('fretboard');
    if (!board) return;
    board.innerHTML = '';

    STRINGS.forEach((stringData, stringIdx) => {
        const row = document.createElement('div');
        row.className = 'string-row';
        row.dataset.gauge = 6 - stringIdx;

        const line = document.createElement('div');
        line.className = 'string-line';
        row.appendChild(line);

        let currentNoteIdx = CHROMATIC_SCALE.indexOf(stringData.startNote);

        for (let fret = 0; fret <= FRET_COUNT; fret++) {
            const noteNode = document.createElement('div');
            const noteName = CHROMATIC_SCALE[(currentNoteIdx + fret) % 12];
            
            noteNode.setAttribute('class', `note-node fret-${fret}`);
            noteNode.setAttribute('data-note', noteName);
            noteNode.id = `note-${stringIdx}-${fret}`;
            
            const formatted = formatNoteName(noteName);
            const isLong = formatted.includes('/');
            noteNode.innerHTML = `<div class="note-circle ${isLong ? 'long-label' : ''}">${formatted}</div>`;
            
            if (INLAY_FRETS.includes(fret)) {
                if (stringIdx === 2 && fret !== 12) {
                    const dot = document.createElement('div');
                    dot.className = 'inlay-dot';
                    dot.style.left = '50%';
                    noteNode.appendChild(dot);
                }
                if (fret === 12 && (stringIdx === 1 || stringIdx === 4)) {
                    const dot = document.createElement('div');
                    dot.className = 'inlay-dot';
                    dot.style.left = '50%';
                    noteNode.appendChild(dot);
                }
            }

            noteNode.onclick = () => {
                const isTurningOn = !noteNode.classList.contains('active');
                
                // Only enforce "one note per string" if in CHORD mode
                if (isTurningOn && currentMode === 'CHORD') {
                    row.querySelectorAll('.note-node.active').forEach(activeNode => {
                        activeNode.classList.remove('active');
                    });
                }
                
                noteNode.classList.toggle('active');
                
                checkVoicing();
                
                if (currentMode === 'SCALE') {
                    // Update staff with sequential active notes if we want to get fancy,
                    // but for now let's just make sure we don't break the base scale staff
                    drawScaleManuscript(currentScaleNotes); 
                }
            };

            row.appendChild(noteNode);
        }
        board.appendChild(row);
    });
    
    updateTheory();
    loadScales();
}

async function loadScales() {
    try {
        const response = await fetch('./music-scales.json');
        SCALES_DATA = await response.json();
        
        const select = document.getElementById('scale-select');
        if (select) {
            SCALES_DATA.forEach((scale, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                opt.textContent = scale.name;
                if (scale.name === "Major") opt.selected = true;
                select.appendChild(opt);
            });
        }
        
        // Initial population for the main theory select
        filterScales(true);
    } catch (err) {
        console.error("Failed to load scales:", err);
    }
}

function filterScales(isInitialLoad = false) {
    const searchEl = document.getElementById('scale-search');
    const query = searchEl ? searchEl.value.toLowerCase() : '';
    const mainSelect = document.getElementById('scale-select-main');
    
    if (!mainSelect) return;
    
    const currentVal = mainSelect.value;
    mainSelect.innerHTML = ''; 
    
    let firstMatch = null;

    SCALES_DATA.forEach((scale, idx) => {
        const searchableText = [
            scale.name,
            ...(scale.aliases || []),
            scale.category?.family,
            scale.category?.type,
            ...(scale.cultural_tags || []),
            ...(scale.mood_tags || [])
        ].join(' ').toLowerCase();

        if (searchableText.includes(query)) {
            if (firstMatch === null) firstMatch = idx;
            
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = scale.name;
            
            if (isInitialLoad && scale.name === "Major") {
                opt.selected = true;
            } else if (!isInitialLoad && idx.toString() === currentVal) {
                opt.selected = true;
            }
            mainSelect.appendChild(opt);
        }
    });

    if (!Array.from(mainSelect.options).some(opt => opt.selected) && firstMatch !== null) {
        mainSelect.value = firstMatch;
    }
    
    if (mainSelect.options.length === 0) {
        const opt = document.createElement('option');
        opt.value = 'none';
        opt.textContent = 'No matches found...';
        mainSelect.appendChild(opt);
    }
    
    if (!isInitialLoad) updateTheory();
}

function clearBoard() {
    document.querySelectorAll('.note-node.active').forEach(note => {
        note.classList.remove('active');
    });
    checkVoicing();
}

function switchMode(newMode) {
    currentMode = newMode;
    
    // Update Tab UI
    document.getElementById('tab-chord').classList.toggle('active', newMode === 'CHORD');
    document.getElementById('tab-scale').classList.toggle('active', newMode === 'SCALE');
    
    // Update Panel UI
    document.getElementById('chord-controls').classList.toggle('active', newMode === 'CHORD');
    document.getElementById('scale-controls').classList.toggle('active', newMode === 'SCALE');
    
    // Clean slate when switching modes
    clearBoard();
    updateTheory();
}

function updateTheory() {
    if (currentMode === 'SCALE') {
        updateScaleMode();
        return;
    }

    const root = document.getElementById('root-select').value;
    const form = document.getElementById('form-select').value;
    const checklist = document.getElementById('theory-checklist');
    const infoPanel = document.getElementById('scale-info-panel');
    
    // Clear scale-specific info in chord mode
    if (infoPanel) infoPanel.innerHTML = '';
    const mentor = document.querySelector('.mentor-area');
    if (mentor) mentor.innerHTML = '';
    
    document.querySelectorAll('.note-node').forEach(el => {
        el.classList.remove('suggested', 'root-tonic', 'dimmed-note');
    });
    
    const rootIdx = CHROMATIC_SCALE.indexOf(root);
    if (rootIdx === -1 || !CHORD_FORMS[form]) return;

    const intervals = CHORD_FORMS[form];
    currentChordNotes = intervals.map(inter => CHROMATIC_SCALE[(rootIdx + inter) % 12]);
    
    if (checklist) {
        checklist.innerHTML = '';
        currentChordNotes.forEach(noteName => {
            const item = document.createElement('div');
            item.className = 'check-item';
            item.dataset.note = noteName;
            item.innerHTML = `<span></span> ${formatNoteName(noteName)}`;
            checklist.appendChild(item);
        });
    }

    // Suggest notes on board
    document.querySelectorAll('.note-node').forEach(node => {
        if (currentChordNotes.includes(node.getAttribute('data-note'))) {
            node.classList.add('suggested');
        }
    });

    checkVoicing();
}

function checkVoicing() {
    const activePitches = new Set();
    const activeNodes = document.querySelectorAll('.note-node.active');
    
    activeNodes.forEach(node => {
        activePitches.add(node.getAttribute('data-note'));
    });

    document.querySelectorAll('.check-item').forEach(item => {
        if (activePitches.has(item.dataset.note)) {
            item.classList.add('fulfilled');
        } else {
            item.classList.remove('fulfilled');
        }
    });

    if (currentMode === 'CHORD') {
        drawManuscript(activeNodes);
    }
}

function updateScaleMode() {
    const scaleIdx = document.getElementById('scale-select-main').value;
    const root = document.getElementById('root-select').value;
    const info = document.getElementById('scale-info-panel');
    const positionValue = document.getElementById('position-select').value;
    
    if (scaleIdx === 'none' || !SCALES_DATA[scaleIdx]) return;

    const scale = SCALES_DATA[scaleIdx];
    const rootIdx = CHROMATIC_SCALE.indexOf(root);
    
    // Strict 5-fret window calculation
    const fretStart = parseInt(positionValue);
    const fretEnd = fretStart + 4;
    
    document.querySelectorAll('.note-node').forEach(el => {
        el.classList.remove('suggested', 'root-tonic', 'dimmed-note');
    });
    
    currentScaleNotes = scale.intervals.map(inter => CHROMATIC_SCALE[(rootIdx + inter) % 12]);
    const tonic = currentScaleNotes[0]; // First note is tonic
    
    // Update Checklist/Legend
    const checklist = document.getElementById('theory-checklist');
    if (checklist) {
        checklist.innerHTML = '';
        currentScaleNotes.forEach((noteName, i) => {
            const item = document.createElement('div');
            item.className = 'check-item';
            item.dataset.note = noteName;
            const degree = scale.degrees[i] || (i + 1);
            item.innerHTML = `<small style="display:block; font-size: 0.6rem; color: var(--gold)">${degree}</small> ${formatNoteName(noteName)}`;
            checklist.appendChild(item);
        });
    }

    // Highlight on board
    document.querySelectorAll('.note-node').forEach(node => {
        const noteName = node.getAttribute('data-note');
        const fret = parseInt(node.id.split('-')[2]);
        
        if (currentScaleNotes.includes(noteName)) {
            node.classList.add('suggested');
            
            // Highlight root in Gold
            if (noteName === tonic) {
                node.classList.add('root-tonic');
            }
            
            // Dim if strictly outside position range
            if (fret < fretStart || fret > fretEnd) {
                node.classList.add('dimmed-note');
            }
        }
    });

    // Update Meta Info
    info.innerHTML = `
        <span class="scale-tag">${scale.category.type}</span>
        <span class="scale-tag cult">${scale.cultural_tags[0] || ''}</span>
        <span class="scale-tag mood">${scale.mood_tags[0] || ''}</span>
    `;

    showMentorRecommendations(scale);
    drawScaleManuscript(currentScaleNotes);
}

const CHORD_FORMULAS = {
    'maj': [0, 4, 7],
    'maj7': [0, 4, 7, 11],
    'maj9': [0, 4, 7, 11, 14],
    'maj6': [0, 4, 7, 9],
    'min': [0, 3, 7],
    'min7': [0, 3, 7, 10],
    'min9': [0, 3, 7, 10, 14],
    'min11': [0, 3, 7, 10, 17],
    'min6': [0, 3, 7, 9],
    'm7b5': [0, 3, 6, 10],
    'dom7': [0, 4, 7, 10],
    'dom7b9': [0, 4, 7, 10, 13],
    'dom9': [0, 4, 7, 10, 14],
    'dim': [0, 3, 6],
    'dim7': [0, 3, 6, 9],
    'sus4': [0, 5, 7],
    'sus2': [0, 2, 7]
};

const CHORD_DISPLAY = {
    'maj': 'Maj Triad',
    'maj7': 'Maj 7',
    'maj9': 'Maj 9',
    'maj6': 'Maj 6',
    'min': 'Min Triad',
    'min7': 'Min 7',
    'min9': 'Min 9',
    'min11': 'Min 11',
    'min6': 'Min 6',
    'm7b5': 'm7b5',
    'dom7': 'Dom 7',
    'dom7b9': 'Dom 7♭9',
    'dom9': 'Dom 9',
    'dim': 'Dim Triad',
    'dim7': 'Dim 7',
    'sus4': 'Sus 4',
    'sus2': 'Sus 2'
};

function getDiatonicStacks(notes) {
    if (notes.length < 5) return []; 
    
    let result = [];
    const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    
    notes.forEach((rootStr, i) => {
        let validChords = [];
        let baseQuality = 'maj';
        const rootIdx = CHROMATIC_SCALE.indexOf(rootStr);
        
        for (const [form, intervals] of Object.entries(CHORD_FORMULAS)) {
            // Check if all intervals exist in currentScaleNotes
            const isScaleDiatonic = intervals.every(inter => {
                const testNote = CHROMATIC_SCALE[(rootIdx + inter) % 12];
                return notes.includes(testNote);
            });
            
            if (isScaleDiatonic) {
                validChords.push({ form: form, label: CHORD_DISPLAY[form] });
                if (form === 'min' || form === 'dim') baseQuality = form;
            }
        }
        
        if (validChords.length > 0) {
            let num = numerals[i] || '?';
            if (baseQuality === 'min' || baseQuality === 'dim') num = num.toLowerCase();
            
            result.push({
                numeral: num,
                root: rootStr,
                chords: validChords
            });
        }
    });
    
    return result;
}

let isMentorCollapsed = false;

function toggleMentorCollapse() {
    isMentorCollapsed = !isMentorCollapsed;
    const content = document.getElementById('mentor-content');
    const indicator = document.getElementById('mentor-collapse-indicator');
    if (content) content.classList.toggle('collapsed', isMentorCollapsed);
    if (indicator) indicator.textContent = isMentorCollapsed ? '▼ SHOW' : '▲ HIDE';
}

function showMentorRecommendations(scale) {
    let dashboard = document.querySelector('.theory-dashboard');
    let mentor = document.querySelector('.mentor-area');
    
    if (!mentor) {
        mentor = document.createElement('div');
        mentor.className = 'mentor-area';
        dashboard.appendChild(mentor);
    }
    
    const stacks = getDiatonicStacks(currentScaleNotes);

    if (stacks.length > 0) {
        mentor.innerHTML = `
            <div class="mentor-title" style="cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 0;" onclick="toggleMentorCollapse()">
                MENTOR: DIATONIC CHORDS <span id="mentor-collapse-indicator" style="font-size:0.6rem; opacity: 0.7;">${isMentorCollapsed ? '▼ SHOW' : '▲ HIDE'}</span>
            </div>
            <div id="mentor-content" class="mentor-content ${isMentorCollapsed ? 'collapsed' : ''}">
                <div class="recommendations" style="display: flex; gap: 8px; overflow-x: auto; padding-top: 15px; padding-bottom: 5px; flex-wrap: nowrap; align-items: flex-start; max-width: 100%; justify-content: center;">
                ${stacks.map(s => `
                    <div class="diatonic-col">
                        <div class="diatonic-header">
                            <span style="font-size: 0.7rem; color: var(--gold); line-height: 1;">${s.numeral}</span>
                            <span style="font-weight: 800; font-size: 1.1rem;">${formatNoteName(s.root)}</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
                            ${s.chords.map(c => `
                                <div class="rec-chip" style="margin:0; width: 100%; padding: 4px 0; text-align: center; box-sizing: border-box; font-size: 0.75rem;" onclick="buildExactChord('${s.root}', '${c.form}')">${c.label}</div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                </div>
            </div>
        `;
    } else {
        const chords = scale.common_chords || [];
        mentor.innerHTML = `
            <div class="mentor-title" style="cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 0;" onclick="toggleMentorCollapse()">
                MENTOR: COMMON CHORD QUALITIES <span id="mentor-collapse-indicator" style="font-size:0.6rem; opacity: 0.7;">${isMentorCollapsed ? '▼ SHOW' : '▲ HIDE'}</span>
            </div>
            <div id="mentor-content" class="mentor-content ${isMentorCollapsed ? 'collapsed' : ''}">
                <div class="recommendations" style="padding-top: 15px;">
                    ${chords.map(c => `<div class="rec-chip" onclick="applySuggestedChord('${c}')">${c.toUpperCase()}</div>`).join('')}
                </div>
            </div>
        `;
    }
}

function applySuggestedChord(form) {
    const select = document.getElementById('form-select');
    let found = false;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === form || select.options[i].value.includes(form)) {
            select.selectedIndex = i;
            found = true;
            break;
        }
    }
    if (found) {
        document.getElementById('tab-chord').click();
    }
}

function buildExactChord(rootNote, targetForm) {
    document.getElementById('tab-chord').click();
    
    const rootSelect = document.getElementById('root-select');
    Array.from(rootSelect.options).forEach((opt, idx) => {
        if (opt.value === rootNote || opt.value.includes(rootNote)) rootSelect.selectedIndex = idx;
    });

    const formSelect = document.getElementById('form-select');
    Array.from(formSelect.options).forEach((opt, idx) => {
        if (opt.value === targetForm) formSelect.selectedIndex = idx;
    });

    updateTheory();
}

function drawScaleManuscript(notes) {
    const container = document.getElementById('manuscript-container');
    if (!container) return;

    const scaleIdx = document.getElementById('scale-select-main').value;
    const root = document.getElementById('root-select').value;
    const scale = SCALES_DATA[scaleIdx] || null;

    const width = 600;
    const height = 300;
    const staffTop = 100;
    const lineSpacing = 16;
    const startX = 100;
    const noteGap = (width - 200) / (notes.length - 1 || 1);
    
    const svgNs = "http://www.w3.org/2000/svg";
    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="${svgNs}" class="staff-svg">`;
    
    for (let i = 0; i < 5; i++) {
        const y = staffTop + i * lineSpacing;
        svg += `<line x1="10" y1="${y}" x2="${width - 10}" y2="${y}" class="staff-line" />`;
    }

    svg += `<text x="10" y="${staffTop + 3.8 * lineSpacing}" font-family="'Noto Music', serif" font-size="70" fill="rgba(255,255,255,0.85)">\uD834\uDD1E</text>`;

    const bottomLineY = staffTop + 4 * lineSpacing; // E4
    const E4_STEP = 4 * 7 + 2;

    let currentOctaveOffset = 0;
    let lastBaseStep = -1;

    notes.forEach((noteName, i) => {
        const baseNote = noteName.split('/')[0].charAt(0);
        const baseStep = NAME_TO_BASE_STEP[baseNote];
        
        if (lastBaseStep !== -1 && baseStep < lastBaseStep) {
            currentOctaveOffset += 7;
        }
        lastBaseStep = baseStep;

        const step = 4 * 7 + baseStep + currentOctaveOffset;
        const diff = step - E4_STEP;
        const y = bottomLineY - (diff * (lineSpacing / 2));
        const x = startX + i * noteGap;

        if (y > bottomLineY + 4) {
            for (let ly = bottomLineY + lineSpacing; ly <= y + 2; ly += lineSpacing) {
                svg += `<line x1="${x - 20}" y1="${ly}" x2="${x + 20}" y2="${ly}" class="ledger-line" />`;
            }
        }
        
        let accidental = "";
        if (noteName.includes('/') || noteName.includes('#') || noteName.includes('b')) {
            const degree = scale && scale.degrees[i] ? scale.degrees[i] : "";
            if (degree.includes('♭') || degree.includes('b')) {
                accidental = '♭';
            } else if (degree.includes('♯') || degree.includes('#')) {
                accidental = '♯';
            } else {
                accidental = (root.includes('b') || root === 'F') ? '♭' : '♯';
            }
        }
        
        if (accidental) {
            // Draw accidental
            svg += `<text x="${x - 22}" y="${y + 5}" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,0.85)">${accidental}</text>`;
        }
        
        svg += `<ellipse cx="${x}" cy="${y}" rx="8" ry="6" class="staff-note" />`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
}

// MANUSCRIPT ENGINE
function drawManuscript(activeNodes, targetWidth = 500) {
    const container = document.getElementById('manuscript-container');
    if (!container) return;

    const svgNs = "http://www.w3.org/2000/svg";
    const width = targetWidth; 
    const height = 300; 
    const staffTop = 100; // Refined top
    const lineSpacing = 16; 
    const noteX = width / 2;
    
    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="${svgNs}" class="staff-svg">`;
    
    // Draw 5 Lines (E4 to F5)
    for (let i = 0; i < 5; i++) {
        const y = staffTop + i * lineSpacing;
        svg += `<line x1="10" y1="${y}" x2="${width - 10}" y2="${y}" class="staff-line" />`;
    }

    // Elegant Treble Clef (Noto Music)
    svg += `<text x="10" y="${staffTop + 3.8 * lineSpacing}" font-family="'Noto Music', serif" font-size="70" fill="rgba(255,255,255,0.85)" style="pointer-events:none;">\uD834\uDD1E</text>`;

    // Map selected notes to staff positions
    // Middle C (C4) is 1 ledger line below bottom line (E4). E4 is StaffTop + 4 * lineSpacing
    const bottomLineY = staffTop + 4 * lineSpacing; // E4
    const E4_STEP = 4 * 7 + 2; // Octave 4, Step 2 (E)

    activeNodes.forEach(node => {
        const idParts = node.id.split('-').map(Number);
        const stringIdx = idParts[1];
        const fret = idParts[2];
        const stringData = STRINGS[stringIdx];
        
        // Calculate raw pitch from string start
        const startIdx = CHROMATIC_SCALE.indexOf(stringData.startNote);
        const totalSemitones = startIdx + fret;
        const noteName = CHROMATIC_SCALE[totalSemitones % 12];
        const octaveShift = Math.floor(totalSemitones / 12);
        const finalOctave = stringData.octave + octaveShift;
        
        // Convert to staff step
        const baseNote = noteName.split('/')[0].charAt(0); // Take first letter (e.g. C# -> C)
        const step = finalOctave * 7 + NAME_TO_BASE_STEP[baseNote];
        const diff = step - E4_STEP;
        const y = bottomLineY - (diff * (lineSpacing / 2));
        
        // Ledger Lines - Wider and clearer
        if (y > bottomLineY + 4) { // C4 and below
            for (let ly = bottomLineY + lineSpacing; ly <= y + 2; ly += lineSpacing) {
                svg += `<line x1="${noteX - 35}" y1="${ly}" x2="${noteX + 35}" y2="${ly}" class="ledger-line" />`;
            }
        }
        if (y < staffTop - 4) { // G5 and above
            for (let ly = staffTop - lineSpacing; ly >= y - 2; ly -= lineSpacing) {
                svg += `<line x1="${noteX - 35}" y1="${ly}" x2="${noteX + 35}" y2="${ly}" class="ledger-line" />`;
            }
        }

        // Handle accidentals for chords
        let accidental = "";
        if (noteName.includes('/') || noteName.includes('#') || noteName.includes('b')) {
            const root = document.getElementById('root-select').value;
            accidental = (root.includes('b') || root === 'F') ? '♭' : '♯';
        }
        
        if (accidental) {
            svg += `<text x="${noteX - 22}" y="${y + 5}" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,0.85)">${accidental}</text>`;
        }

        // Draw note head
        svg += `<ellipse cx="${noteX}" cy="${y}" rx="8" ry="6" class="staff-note" />`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
    return svg; // Return for saving
}

// BANK SYSTEM
function saveToBank() {
    const root = document.getElementById('root-select').value;
    const form = document.getElementById('form-select').value;
    const activeNodes = document.querySelectorAll('.note-node.active');
    
    if (activeNodes.length === 0) {
        alert("Select some notes on the fretboard first!");
        return;
    }

    const bank = document.getElementById('voicing-bank');
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.style.display = 'none';

    const resultSpan = document.createElement('div');
    resultSpan.className = 'voicing-card';
    
    const notes = Array.from(activeNodes).map(n => n.dataset.note).join(' - ');
    // Draw a specialized small version for the bank
    const staffHtml = drawManuscript(activeNodes, 250); 
    // Redraw the original UI one so it doesn't stay small!
    drawManuscript(activeNodes, 500);
    
    const miniFretboardHtml = generateMiniFretboard(activeNodes);
    
    // Get display name for the form
    const formEl = document.getElementById('form-select');
    const formText = formEl.options[formEl.selectedIndex].text.split('(')[0].trim();

    resultSpan.innerHTML = `
        <div class="card-title">${formatNoteName(root)} ${formText}</div>
        <div class="card-content">
            <div class="card-staff">${staffHtml}</div>
            <div class="card-mini-fret">${miniFretboardHtml}</div>
        </div>
        <button class="remove-btn" onclick="this.parentElement.remove(); checkBankEmpty();">REMOVE</button>
    `;
    
    bank.appendChild(resultSpan);
}

function checkBankEmpty() {
    const bank = document.getElementById('voicing-bank');
    const emptyState = document.getElementById('empty-state');
    if (bank.children.length === 0 && emptyState) {
        emptyState.style.display = 'block';
    }
}

function updateSheetTitle() {
    const input = document.getElementById('sheet-title-input');
    const display = document.getElementById('sheet-main-title');
    display.textContent = input.value || "CURATED CHORDS";
}

function generateMiniFretboard(activeNodes) {
    const frets = Array.from(activeNodes).map(n => parseInt(n.id.split('-')[2]));
    const minFret = Math.min(...frets);
    const startFret = minFret === 0 ? 0 : Math.max(1, minFret);
    const displayFrets = 5;
    
    const w = 150, h = 120;
    const svgNs = "http://www.w3.org/2000/svg";
    let svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="${svgNs}">`;
    
    // Draw Nut or top line
    const nutWidth = startFret === 0 ? 4 : 1;
    svg += `<line x1="20" y1="20" x2="130" y2="20" stroke="black" stroke-width="${nutWidth}" />`;
    
    // Draw 6 strings
    for (let i = 0; i < 6; i++) {
        const x = 20 + i * 22;
        svg += `<line x1="${x}" y1="20" x2="${x}" y2="110" stroke="#333" stroke-width="1" />`;
    }
    
    // Draw 5 fret lines
    for (let i = 1; i <= displayFrets; i++) {
        const y = 20 + i * 18;
        svg += `<line x1="20" y1="${y}" x2="130" y2="${y}" stroke="#333" stroke-width="1" />`;
    }

    // Fret Number if not open
    if (startFret > 0) {
        svg += `<text x="5" y="35" font-size="10" font-weight="bold">${startFret}fr</text>`;
    }

    // Draw active notes - FLIPPED AXIS: Low E (sIdx 5) on the Left, High e (sIdx 0) on the Right
    activeNodes.forEach(node => {
        const idParts = node.id.split('-').map(Number);
        const sIdx = idParts[1];
        const f = idParts[2];
        
        // Reverse the mapping: 5 becomes 0 (Left), 0 becomes 5 (Right)
        const x = 20 + (5 - sIdx) * 22; 
        
        if (f === 0) {
            svg += `<circle cx="${x}" cy="10" r="4" fill="none" stroke="black" stroke-width="1.5" />`;
        } else if (f >= startFret && f < startFret + displayFrets) {
            const y = 20 + (f - startFret + 0.5) * 18;
            svg += `<circle cx="${x}" cy="${y}" r="6" fill="black" />`;
        }
    });

    svg += `</svg>`;
    return svg;
}

function toggleMetronomePopup() {
    const widget = document.getElementById('metronome-widget');
    if (widget) widget.classList.toggle('active');
}

function togglePracticeCenter(show) {
    const modal = document.getElementById('practice-modal');
    modal.classList.toggle('active', show);
    if (show) updateDrillDisplay();
}

// METRONOME ENGINE
let audioCtx = null;
let metronomeRunning = false;
let bpm = 120;
let nextNoteTime = 0.0;
let timerID = null;
let currentBeat = 0;
let beatsPerMeasure = 4;

function toggleMetronome() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    metronomeRunning = !metronomeRunning;
    const btn = document.getElementById('metronome-toggle');
    
    if (metronomeRunning) {
        currentBeat = 0; // Reset to downbeat
        nextNoteTime = audioCtx.currentTime;
        scheduler();
        btn.textContent = 'STOP';
        btn.classList.add('active');
        startIdleMonitoring();
    } else {
        clearTimeout(timerID);
        btn.textContent = 'START';
        btn.classList.remove('active');
        stopIdleMonitoring();
    }
}

// SPACEBAR ACCELERATOR
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('practice-modal');
    if (modal.classList.contains('active') && e.code === 'Space') {
        e.preventDefault(); // Stop page scroll
        toggleMetronome();
    }
});

// IDLE SAFETY SYSTEM
let idleTimeSeconds = 0;
const MAX_IDLE_SECONDS = 15 * 60; // 15 mins
let idleInterval = null;

function resetIdleTimer() {
    idleTimeSeconds = 0;
    if (metronomeRunning) updateTimeoutDisplay();
}

// Watch for activity
['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, resetIdleTimer, true);
});

function startIdleMonitoring() {
    idleTimeSeconds = 0;
    document.getElementById('metronome-timeout').classList.add('visible');
    updateTimeoutDisplay();
    if (idleInterval) clearInterval(idleInterval);
    idleInterval = setInterval(() => {
        if (!metronomeRunning) return;
        idleTimeSeconds++;
        updateTimeoutDisplay();
        
        if (idleTimeSeconds >= MAX_IDLE_SECONDS) {
            toggleMetronome(); // Silence it
        }
    }, 1000);
}

function stopIdleMonitoring() {
    clearInterval(idleInterval);
    idleInterval = null;
    document.getElementById('metronome-timeout').classList.remove('visible');
}

function updateTimeoutDisplay() {
    const remaining = Math.max(0, MAX_IDLE_SECONDS - idleTimeSeconds);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const clock = document.getElementById('timeout-clock');
    if (clock) clock.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function scheduler() {
    while (nextNoteTime < audioCtx.currentTime + 0.1) {
        playClick(nextNoteTime, currentBeat === 0);
        nextNoteTime += 60.0 / bpm;
        currentBeat = (currentBeat + 1) % beatsPerMeasure;
    }
    timerID = setTimeout(scheduler, 25);
}

function playClick(time, isAccent = false) {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    
    // Pro Audio: Square wave cuts through screaming guitar frequencies easily
    osc.type = 'square';
    osc.frequency.value = isAccent ? 1500 : 1000;
    
    // Maximize gain and fix envelope starting point
    env.gain.setValueAtTime(1.0, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.1); // Slightly longer decay for more body
    
    osc.connect(env);
    env.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.08);
    
    // Virtual Pulse Sync with Visual Accent
    setTimeout(() => {
        const pulse = document.getElementById('metronome-pulse');
        if (isAccent) pulse.style.backgroundColor = 'var(--gold)';
        else pulse.style.backgroundColor = 'var(--note-accent)';
        
        pulse.classList.add('beat');
        setTimeout(() => pulse.classList.remove('beat'), 100);
    }, (time - audioCtx.currentTime) * 1000);
}

function updateBPM(val) {
    bpm = val;
    document.getElementById('bpm-value').textContent = val;
}

// DRILL LOGIC
function updateDrillDisplay() {
    const cards = document.querySelectorAll('#voicing-bank .voicing-card');
    const display = document.getElementById('drill-display');
    if (cards.length === 0) {
        display.innerHTML = '<div class="empty-drill">Save chords to the bank to start drilling!</div>';
        return;
    }

    let sequenceHtml = '<div class="practice-grid">';
    
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent;
        const miniFret = card.querySelector('.card-mini-fret').innerHTML;
        
        sequenceHtml += `
            <div class="practice-chord-box">
                <div class="practice-chord-name">${title}</div>
                <div class="practice-chord-svg">${miniFret}</div>
            </div>
        `;
    });
    
    sequenceHtml += '</div>';
    display.innerHTML = sequenceHtml;
}

document.addEventListener('DOMContentLoaded', initFretboard);
