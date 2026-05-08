(function() {
    const canvas = document.getElementById('playground-canvas');
    const ctx = canvas.getContext('2d');
    const codeInput = document.getElementById('code-input');
    const runBtn = document.getElementById('run-btn');
    const clearBtn = document.getElementById('clear-btn');
    const consoleOutput = document.getElementById('console-output');

    // Mobile & UI Elements
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const mobileRunBtn = document.getElementById('mobile-run-btn');
    const viewTabs = document.querySelectorAll('.view-tab');
    const viewSections = document.querySelectorAll('.view-section');
    const objContainer = document.getElementById('objectives-container');
    const objList = document.getElementById('objectives-list');
    const victoryModal = document.getElementById('victory-modal');
    const grandVictoryOverlay = document.getElementById('grand-victory-overlay');
    const closeGrandVictoryBtn = document.getElementById('close-grand-victory');

    let currentColor = '#38bdf8';
    let currentMissionId = null;
    let completedMissions = new Set(JSON.parse(localStorage.getItem('kidCode_mastery') || '[]'));
    
    // Tracking state for objectives - much more specific now
    let missionState = {
        background: null,
        circleSize: null,
        circleColor: null,
        squareSize: null,
        squareColor: null,
        rectSize: null,
        rectColor: null,
        textMsg: null,
        calls: []
    };

    const missions = {
        'neon-sun': {
            title: 'Neon Sun',
            level: '1-1',
            baseCode: `color("gold");
circle(width() / 2, height() / 2, 80);

text("The Neon Sun", 20, 40, 24);`,
            objectives: [
                { id: 'size', text: 'Change sun size', check: () => missionState.circleSize !== 80 && missionState.circleSize !== null },
                { id: 'color', text: 'Change sun color', check: () => missionState.circleColor !== 'gold' && missionState.circleColor !== null },
                { id: 'text', text: 'Update the Title text', check: () => missionState.textMsg !== 'The Neon Sun' && missionState.textMsg !== null }
            ]
        },
        'robot-eye': {
            title: 'Robot Eye',
            level: '1-2',
            baseCode: `color("#4ade80");
// Change the green size here:
square(100, 100, 100);

color("#000");
circle(150, 150, 30);`,
            objectives: [
                { id: 'size', text: 'Change green square size', check: () => missionState.squareSize !== 100 && missionState.squareSize !== null },
                { id: 'color', text: 'Turn the pupil RED', check: () => missionState.circleColor === 'red' || missionState.circleColor === '#ff0000' }
            ]
        },
        'skyline': {
            title: 'Cyber Skyline',
            level: '1-3',
            baseCode: `background("black");
color("#1e293b");
rect(50, 100, 60, 200);
rect(130, 150, 80, 150);

color("yellow");
square(65, 120, 10);`,
            objectives: [
                { id: 'bg', text: 'Make the background BLUE', check: () => missionState.background === 'blue' || missionState.background === 'skyblue' },
                { id: 'count', text: 'Add a 3rd building line', check: () => missionState.calls.filter(c => c.name === 'rect').length >= 3 }
            ]
        },
        'solar-moon': {
            title: 'Solar Moon',
            level: '2-1',
            baseCode: `background("#020617");
color("gold");
circle(100, 100, 50); // The Sun

color("silver");
circle(250, 150, 20); // The Moon`,
            objectives: [
                { id: 'moon-pos', text: 'Move the Moon to x:300', check: () => missionState.calls.some(c => c.name === 'circle' && c.color === 'silver' && c.x >= 300) },
                { id: 'moon-size', text: 'Make the Moon bigger', check: () => missionState.calls.some(c => c.name === 'circle' && c.color === 'silver' && c.r > 20) }
            ]
        },
        'robot-smile': {
            title: 'Robot Smile',
            level: '2-2',
            baseCode: `color("gray");
rect(100, 100, 100, 100); // Face

color("black");
rect(120, 150, 60, 10); // Mouth`,
            objectives: [
                { id: 'happy', text: 'Change Mouth color to PINK', check: () => missionState.calls.some(c => c.name === 'rect' && c.color === 'pink') },
                { id: 'antenna', text: 'Add an antenna (square)', check: () => missionState.calls.some(c => c.name === 'square' && c.y < 100) }
            ]
        },
        'starry-night': {
            title: 'Starry Night',
            level: '2-3',
            baseCode: `background("navy");
color("white");
square(50, 50, 5);
square(200, 80, 5);

color("yellow");
circle(300, 60, 30); // Crescent`,
            objectives: [
                { id: 'sky', text: 'Make the sky PURPLE', check: () => missionState.background === 'purple' },
                { id: 'stars', text: 'Add 2 more stars!', check: () => missionState.calls.filter(c => c.name === 'square').length >= 4 }
            ]
        }
    };

    // Resizing
    function resizeCanvas() {
        const container = canvas.parentElement;
        if (container.clientWidth > 0) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
    }
    window.addEventListener('resize', resizeCanvas);

    // The Superpower API (with tracking hooks)
    const superpowers = {
        background: (c) => {
            missionState.background = c.toLowerCase();
            ctx.fillStyle = c;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            log(`Canvas background set to ${c}`);
        },
        color: (c) => {
            currentColor = c;
            missionState.calls.push({ name: 'color', val: c });
            log(`Changed color to ${c}`);
        },
        circle: (x, y, r) => {
            missionState.circleSize = r;
            missionState.circleColor = currentColor.toLowerCase();
            missionState.calls.push({ name: 'circle', x, y, r, color: currentColor });
            ctx.fillStyle = currentColor;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        },
        square: (x, y, size) => {
            missionState.squareSize = size;
            missionState.squareColor = currentColor.toLowerCase();
            missionState.calls.push({ name: 'square', x, y, size, color: currentColor });
            ctx.fillStyle = currentColor;
            ctx.fillRect(x, y, size, size);
        },
        rect: (x, y, w, h) => {
            missionState.rectSize = w; // just use width for tracking primary size
            missionState.rectColor = currentColor.toLowerCase();
            missionState.calls.push({ name: 'rect', x, y, w, h, color: currentColor });
            ctx.fillStyle = currentColor;
            ctx.fillRect(x, y, w, h);
        },
        text: (str, x, y, size = 20) => {
            missionState.textMsg = str;
            missionState.calls.push({ name: 'text', str, x, y, size });
            ctx.fillStyle = currentColor;
            ctx.font = `${size}px Outfit`;
            ctx.fillText(str, x, y);
        },
        clear: () => {
            clearCanvas();
        },
        print: (msg) => {
            log(msg, 'log');
        },
        random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        width: () => canvas.width,
        height: () => canvas.height
    };

    function clearCanvas() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function log(msg, type = '') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `> ${msg}`;
        consoleOutput.appendChild(entry);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function resetMissionState() {
        missionState = {
            background: null,
            circleSize: null,
            circleColor: null,
            squareSize: null,
            squareColor: null,
            rectSize: null,
            rectColor: null,
            textMsg: null,
            calls: []
        };
    }

    function runCode() {
        const code = codeInput.value;
        consoleOutput.innerHTML = '';
        
        resizeCanvas();
        clearCanvas(); 
        resetMissionState(); 
        currentColor = '#38bdf8'; 
        log('Launching code...');
        
        try {
            const func = new Function(...Object.keys(superpowers), code);
            func(...Object.values(superpowers));
            log('Mission successful! 🚀');
            checkObjectives();
        } catch (err) {
            log(`ERROR: ${err.message}`, 'error');
        }
    }

    function checkObjectives() {
        if (!currentMissionId || !missions[currentMissionId]) return;
        
        const currentMission = missions[currentMissionId];
        let allDone = true;

        currentMission.objectives.forEach((obj, index) => {
            const el = document.getElementById(`obj-${index}`);
            if (obj.check()) {
                el.classList.add('done');
            } else {
                el.classList.remove('done');
                allDone = false;
            }
        });

        if (allDone) {
            victoryModal.classList.remove('hidden');
            sidebar.classList.add('victory');
            markMissionCompleted(currentMissionId);
        } else {
            victoryModal.classList.add('hidden');
            sidebar.classList.remove('victory');
        }
    }

    function markMissionCompleted(id) {
        if (!completedMissions.has(id)) {
            completedMissions.add(id);
            localStorage.setItem('kidCode_mastery', JSON.stringify([...completedMissions]));
            updateMasteryUI();
            checkGrandVictory();
        }
    }

    function updateMasteryUI() {
        completedMissions.forEach(id => {
            const card = document.getElementById(`mission-${id}`);
            if (card) card.classList.add('completed');
        });

        // Toggle Level 2 Locked state
        const level1Ids = ['neon-sun', 'robot-eye', 'skyline'];
        const allLevel1Done = level1Ids.every(id => completedMissions.has(id));
        const level2Cards = document.getElementById('level-2-cards');
        const level2Header = document.querySelector('#level-2-section h2');
        
        if (allLevel1Done) {
            level2Cards.classList.remove('dimmed');
            if (level2Header) level2Header.style.color = 'var(--text-dim)';
        } else {
            level2Cards.classList.add('dimmed');
            if (level2Header) level2Header.style.color = '#444';
        }
    }

    function checkGrandVictory() {
        const level1Ids = ['neon-sun', 'robot-eye', 'skyline'];
        const level2Ids = ['solar-moon', 'robot-smile', 'starry-night'];
        
        const allLevel1Done = level1Ids.every(id => completedMissions.has(id));
        const allLevel2Done = level2Ids.every(id => completedMissions.has(id));
        
        if (allLevel2Done && !sessionStorage.getItem('kidCode_victory_L2')) {
            triggerGrandVictory("LEVEL 2 MASTERED!");
            sessionStorage.setItem('kidCode_victory_L2', 'true');
        } else if (allLevel1Done && !sessionStorage.getItem('kidCode_victory_L1')) {
            triggerGrandVictory("LEVEL 1 MASTERED!");
            sessionStorage.setItem('kidCode_victory_L1', 'true');
        }
    }

    function triggerGrandVictory(title) {
        const titleEl = grandVictoryOverlay.querySelector('h1');
        if (titleEl) titleEl.textContent = title;
        
        setTimeout(() => {
            grandVictoryOverlay.classList.remove('hidden');
        }, 800);
    }

    function renderObjectives(missionId) {
        const mission = missions[missionId];
        objList.innerHTML = '';
        objContainer.classList.remove('hidden');
        victoryModal.classList.add('hidden');
        sidebar.classList.remove('victory');

        mission.objectives.forEach((obj, index) => {
            const item = document.createElement('div');
            item.className = 'objective-item';
            item.id = `obj-${index}`;
            item.innerHTML = `
                <div class="check-circle">✓</div>
                <span>${obj.text}</span>
            `;
            objList.appendChild(item);
        });
    }

    window.loadMission = (id) => {
        // Enforce Level 2 Lock
        const level2Ids = ['solar-moon', 'robot-smile', 'starry-night'];
        const level1Ids = ['neon-sun', 'robot-eye', 'skyline'];
        const allLevel1Done = level1Ids.every(mid => completedMissions.has(mid));

        if (level2Ids.includes(id) && !allLevel1Done) {
            log("Complete Level 1 missions first! 🔒", "error");
            return;
        }

        if (missions[id]) {
            currentMissionId = id;
            codeInput.value = missions[id].baseCode;
            updateLineNumbers();
            renderObjectives(id);
            
            // Mark the active card
            document.querySelectorAll('.mission-card').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`mission-${id}`).classList.add('active');

            if (window.innerWidth <= 768) {
                if (sidebar.classList.contains('active')) toggleSidebar();
                switchView('world');
                setTimeout(runCode, 100);
            } else {
                runCode();
            }
        }
    };

    // UI Logic
    function updateLineNumbers() {
        const lines = codeInput.value.split('\n').length;
        const lineNumsEl = document.getElementById('line-numbers');
        lineNumsEl.innerHTML = '';
        for (let i = 1; i <= lines; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            lineNumsEl.appendChild(span);
        }
    }

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    function switchView(viewId) {
        viewTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === viewId);
        });
        viewSections.forEach(section => {
            section.classList.toggle('active', section.id === `${viewId}-section`);
        });
        
        if (viewId === 'world') {
            setTimeout(resizeCanvas, 50);
        }
    }

    menuToggle.addEventListener('click', toggleSidebar);
    closeMenu.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    viewTabs.forEach(tab => {
        tab.addEventListener('click', () => switchView(tab.dataset.view));
    });

    codeInput.addEventListener('input', updateLineNumbers);
    codeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            runCode();
        }
    });

    runBtn.addEventListener('click', runCode);
    mobileRunBtn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            switchView('world');
            setTimeout(runCode, 60);
        } else {
            runCode();
        }
    });

    clearBtn.addEventListener('click', () => {
        clearCanvas();
        log('Canvas cleared.');
    });

    closeGrandVictoryBtn.addEventListener('click', () => {
        grandVictoryOverlay.classList.add('hidden');
    });

    // Initial load - Start with Level 1-1
    updateMasteryUI();
    loadMission('neon-sun');

})();
