document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const gridSizeSelect = document.getElementById('grid-size');
    const resetBtn = document.getElementById('reset-btn');
    const printBtn = document.getElementById('print-btn');
    const matchesEl = document.getElementById('matches');
    const turnsEl = document.getElementById('turns');
    const winMessage = document.getElementById('win-message');
    const finalTurnsEl = document.getElementById('final-turns');
    const playAgainBtn = document.getElementById('play-again-btn');
    const printGrid = document.getElementById('print-grid');
    const printBacksGrid = document.getElementById('print-backs-grid');
    const winOverlay = document.getElementById('win-overlay');

    const gameModeSelect = document.getElementById('game-mode');

    let cards = [];
    let flippedCards = [];
    let matches = 0;
    let turns = 0;
    let isLocked = false;

    let gameMode = 'chars'; // 'chars' or 'emojis'

    const themes = {
        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''),
        emojis: [
            '🐜', '🍎', '🍏', '🍐', '🌈', '🦄', '🏰', '🪐', '🌍', '🌌', '🌙', '☀️', 
            '🐶', '🐱', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯'
        ],
        princess: [
            'alice.png', 'anna.png', 'ariel.png', 'aurora.png', 'belle.png', 'cinderella.png', 
            'elsa.png', 'fairy_godmother.png', 'jasmine.png', 'jessie.png', 'maleficent.png', 
            'mirabel.png', 'moana.png', 'mulan.png', 'nala.png', 'pocahontas.png', 'rapunzel.png', 
            'raya.png', 'snow_white.png', 'stepmother.png', 'tiana.png', 'tinkerbell.png'
        ],
        foods: [
            'apple.png', 'banana.png', 'broccoli.png', 'carrot.png', 'cherry.png', 'corn.png', 
            'cucumber.png', 'hamburger.png', 'hot_dog.png', 'kiwi.png', 'lemon.png', 'orange.png', 
            'pancakes.png', 'peach.png', 'pear.png', 'pineapple.png', 'plum.png', 'potato.png', 
            'strawberry.png', 'tomato.png', 'watermelon.png'
        ],
        magic: ['👑', '🏰', '👗', '🪄', '✨', '🦄', '💎', '🍎', '🌹', '👠', '💍', '🐦', '🐸', '🏹', '🍵', '🎻', '🐚', '🔱', '🐲', '🐺']
    };

    function initGame() {
        const size = parseInt(gridSizeSelect.value);
        const totalCards = size * size;
        const totalPairs = totalCards / 2;
        
        // Reset state
        cards = [];
        flippedCards = [];
        matches = 0;
        turns = 0;
        isLocked = false;
        matchesEl.textContent = '0';
        turnsEl.textContent = '0';
        winMessage.classList.add('hidden');
        winOverlay.classList.add('hidden');
        gameBoard.innerHTML = '';
        
        // Set grid layout
        gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        // Responsive width for 10x10
        gameBoard.style.maxWidth = `${Math.min(size * 100, 1000)}px`;

        let selectedTheme = [];
        const gameMode = gameModeSelect.value;

        if (gameMode === 'princess' || gameMode === 'foods') {
            const path = gameMode === 'princess' ? 'img-disney-princess/' : '../recipes/chef/img-tool/finished-img/';
            const pool = themes[gameMode].map(img => path + img);
            
            if (totalPairs <= pool.length) {
                selectedTheme = [...pool].sort(() => 0.5 - Math.random()).slice(0, totalPairs);
            } else {
                selectedTheme = [...pool];
                const extraNeeded = totalPairs - pool.length;
                const fallbackPool = gameMode === 'princess' ? themes.magic : themes.emojis;
                for (let i = 0; i < extraNeeded; i++) {
                    selectedTheme.push(fallbackPool[i % fallbackPool.length]);
                }
            }
        } else {
            selectedTheme = themes[gameMode];
        }
        
        // Select characters and create pairs
        const selectedChars = [];
        const charPool = [...selectedTheme];
        
        for (let i = 0; i < totalPairs; i++) {
            if (charPool.length === 0) {
                // Refill pool if exhausted
                charPool.push(...selectedTheme);
            }
            const randomIndex = Math.floor(Math.random() * charPool.length);
            const char = charPool.splice(randomIndex, 1)[0];
            selectedChars.push(char, char);
        }

        // Shuffle
        shuffle(selectedChars);

        // Create DOM elements
        selectedChars.forEach((char, index) => {
            const card = createCardElement(char, index);
            gameBoard.appendChild(card);
            cards.push({ char, element: card, matched: false });
        });

        updatePrintView(selectedChars, size);
    }

    function createCardElement(char, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        
        const isImage = char.includes('.png');
        const content = isImage ? `<img src="${char}" alt="game tile">` : char;
        
        card.innerHTML = `
            <div class="card-face card-front">${content}</div>
            <div class="card-face card-back"></div>
        `;
        
        card.addEventListener('click', () => flipCard(card, char));
        return card;
    }

    function flipCard(cardElement, char) {
        if (isLocked || cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) {
            return;
        }

        cardElement.classList.add('flipped');
        flippedCards.push({ element: cardElement, char });

        if (flippedCards.length === 2) {
            turns++;
            turnsEl.textContent = turns;
            checkMatch();
        }
    }

    function checkMatch() {
        isLocked = true;
        const [card1, card2] = flippedCards;

        if (card1.char === card2.char) {
            // Match found
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            matches++;
            matchesEl.textContent = matches;
            flippedCards = [];
            isLocked = false;
            
            const totalPairs = (parseInt(gridSizeSelect.value) ** 2) / 2;
            if (matches === totalPairs) {
                setTimeout(showWinMessage, 500);
            }
        } else {
            // No match
            setTimeout(() => {
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                flippedCards = [];
                isLocked = false;
            }, 1000);
        }
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function showWinMessage() {
        const size = parseInt(gridSizeSelect.value);
        const totalPairs = (size * size) / 2;
        const efficiency = Math.round((totalPairs / turns) * 100);
        
        let rank = "Good Focus!";
        if (efficiency >= 90) rank = "Memory Master! 🏆";
        else if (efficiency >= 70) rank = "Great Focus! 🌟";
        else if (efficiency >= 50) rank = "Keep Practicing! 💪";

        finalTurnsEl.textContent = turns;
        document.getElementById('efficiency').textContent = efficiency;
        winMessage.querySelector('h2').textContent = `You Found Them All! ${rank}`;
        
        winMessage.classList.remove('hidden');
        winOverlay.classList.remove('hidden');
    }

    function updatePrintView(shuffledChars, size) {
        printGrid.innerHTML = '';
        printBacksGrid.innerHTML = '';
        printGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        printBacksGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        
        shuffledChars.forEach(char => {
            // Fronts
            const div = document.createElement('div');
            div.className = 'print-card';
            
            const isImage = char.includes('.png');
            div.innerHTML = isImage ? `<img src="${char}" style="width:100%;height:100%;object-fit:contain;">` : char;
            
            printGrid.appendChild(div);

            // Backs
            const backDiv = document.createElement('div');
            backDiv.className = 'print-card print-card-back';
            backDiv.textContent = '?';
            printBacksGrid.appendChild(backDiv);
        });
    }

    function handlePrint() {
        window.print();
    }

    // Event Listeners
    gameModeSelect.addEventListener('change', initGame);

    gridSizeSelect.addEventListener('change', initGame);
    resetBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', initGame);
    printBtn.addEventListener('click', handlePrint);

    // Initial Start
    initGame();
});
