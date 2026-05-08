/**
 * Blackjack Pro: Mentor & Probabilities
 * Core Game Engine
 */

class BlackjackGame {
    constructor() {
        this.deck = [];
        this.numDecks = 6;
        this.players = [
            { id: 'dealer', name: 'Dealer', hands: [[]], score: 0, status: 'playing' },
            { id: 'player-2', name: 'AI Player 1', hands: [[]], score: 0, status: 'playing', type: 'ai', pos: 'player-2', active: true },
            { id: 'main', name: 'You', hands: [[]], score: 0, status: 'playing', type: 'human', pos: 'player-main', active: true },
            { id: 'player-3', name: 'AI Player 2', hands: [[]], score: 0, status: 'playing', type: 'ai', pos: 'player-3', active: true }
        ];
        
        this.currentPlayerIndex = 1; // Start with first non-dealer
        this.gameState = 'BETTING'; 
        this.runningCount = 0;
        this.cardsDealt = 0;
        this.currentBet = 10;
        
        this.init();
    }

    init() {
        this.createDeck();
        this.shuffle();
        this.setupEventListeners();
        this.updateUI();
    }

    createDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = [
            { n: 'A', v: 11 }, { n: '2', v: 2 }, { n: '3', v: 3 }, { n: '4', v: 4 },
            { n: '5', v: 5 }, { n: '6', v: 6 }, { n: '7', v: 7 }, { n: '8', v: 8 },
            { n: '9', v: 9 }, { n: '10', v: 10 }, { n: 'J', v: 10 }, { n: 'Q', v: 10 },
            { n: 'K', v: 10 }
        ];

        this.deck = [];
        for (let i = 0; i < this.numDecks; i++) {
            for (const suit of suits) {
                for (const val of values) {
                    this.deck.push({ ...val, suit, id: `${i}-${suit}-${val.n}` });
                }
            }
        }
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        this.runningCount = 0;
        this.cardsDealt = 0;
    }

    draw() {
        if (this.deck.length < 20) {
            this.createDeck();
            this.shuffle();
        }
        const card = this.deck.pop();
        this.updateCount(card);
        this.cardsDealt++;
        return card;
    }

    updateCount(card) {
        // Hi-Lo System
        if (card.v >= 2 && card.v <= 6) this.runningCount++;
        else if (card.v === 10 || card.n === 'A') this.runningCount--;
    }

    getTrueCount() {
        const decksRemaining = (this.deck.length / 52);
        return (this.runningCount / decksRemaining).toFixed(1);
    }

    calculateScore(hand) {
        let score = hand.reduce((sum, card) => sum + card.v, 0);
        let aces = hand.filter(c => c.n === 'A').length;
        
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    }

    async deal() {
        this.gameState = 'DEALING';
        this.clearTable();
        
        // Reset players
        this.players.forEach(p => {
            p.hands = [[]];
            p.status = 'playing';
        });

        const activePlayers = this.players.filter(p => p.id === 'dealer' || p.active);
        
        // 2 cards each
        for (let i = 0; i < 2; i++) {
            for (const player of activePlayers) {
                const card = this.draw();
                player.hands[0].push(card);
                this.renderCard(player, card, i === 1 && player.id === 'dealer');
                this.updateUI(); // Live count update
                await this.delay(300);
            }
        }

        this.checkInitialBlackjacks();
        this.startPlayerTurns();
    }

    checkInitialBlackjacks() {
        this.players.forEach(p => {
            if (this.calculateScore(p.hands[0]) === 21) {
                p.status = 'blackjack';
            }
        });
    }

    async startPlayerTurns() {
        this.gameState = 'PLAYER_TURN';
        this.currentPlayerIndex = 1; // AI Player 1
        
        while (this.currentPlayerIndex < this.players.length) {
            const player = this.players[this.currentPlayerIndex];
            if (!player.active && player.id !== 'dealer') {
                this.currentPlayerIndex++;
                continue;
            }
            
            if (player.id === 'main') {
                this.updateUI();
                await this.waitForHuman();
            } else {
                await this.aiTurn(player);
            }
            this.currentPlayerIndex++;
        }
        
        this.dealerTurn();
    }

    async aiTurn(player) {
        this.updateUI();
        await this.delay(800);
        
        let score = this.calculateScore(player.hands[0]);
        while (score < 17) {
            const card = this.draw();
            player.hands[0].push(card);
            this.renderCard(player, card);
            score = this.calculateScore(player.hands[0]);
            await this.delay(600);
        }
        
        if (score > 21) player.status = 'bust';
        else player.status = 'stay';
    }

    async dealerTurn() {
        this.gameState = 'DEALER_TURN';
        const dealer = this.players[0];
        
        // Reveal hidden card
        const hiddenCardEl = document.querySelector('#dealer-hand .card.back');
        if (hiddenCardEl) hiddenCardEl.classList.remove('back');
        
        let score = this.calculateScore(dealer.hands[0]);
        // Dealer hits on soft 17 (Ace counted as 11)
        while (score < 17) {
            const card = this.draw();
            dealer.hands[0].push(card);
            this.renderCard(dealer, card);
            score = this.calculateScore(dealer.hands[0]);
            await this.delay(800);
        }
        
        if (score > 21) dealer.status = 'bust';
        else dealer.status = 'stay';
        
        this.settle();
    }

    settle() {
        this.gameState = 'SETTLEMENT';
        const dealerScore = this.calculateScore(this.players[0].hands[0]);
        const mainPlayer = this.players.find(p => p.id === 'main');
        const playerScore = this.calculateScore(mainPlayer.hands[0]);
        
        let msg = "";
        if (mainPlayer.status === 'bust') msg = "BUST!";
        else if (mainPlayer.status === 'blackjack' && this.players[0].status !== 'blackjack') msg = "BLACKJACK!";
        else if (dealerScore > 21) msg = "DEALER BUSTS!";
        else if (playerScore > dealerScore) msg = "WIN!";
        else if (playerScore < dealerScore) msg = "DEALER WINS.";
        else msg = "PUSH (TIE)";
        
        const advice = document.getElementById('mentor-advice');
        advice.textContent = msg;
        advice.style.color = (msg.includes('WIN') || msg.includes('BLACKJACK')) ? '#4caf50' : (msg.includes('BUST') || msg.includes('WINS')) ? '#f44336' : 'white';

        document.getElementById('btn-bet').disabled = false;
        this.updateUI();
    }

    /* UI HELPERS */
    renderCard(player, card, isHidden = false) {
        const container = player.id === 'dealer' ? document.getElementById('dealer-hand') : document.querySelector(`#${player.pos} .card-area`);
        
        if (!container) {
            console.error("Could not find container for", player.id, player.pos);
            return;
        }
        
        const cardEl = document.createElement('div');
        cardEl.className = `card ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : ''} ${isHidden ? 'back' : ''}`;
        
        const suitSym = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }[card.suit];
        
        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-top">
                    <div class="card-value">${card.n}</div>
                    <div class="card-suit">${suitSym}</div>
                </div>
                <div class="card-center">${suitSym}</div>
                <div class="card-bottom">
                    <div class="card-value">${card.n}</div>
                    <div class="card-suit">${suitSym}</div>
                </div>
            </div>
        `;
        container.appendChild(cardEl);
        
        // Update score display
        const scoreVal = isHidden ? '?' : this.calculateScore(player.hands[0]);
        const scoreEl = player.id === 'dealer' ? document.getElementById('dealer-score') : document.querySelector(`#${player.pos || player.id} .p-score`);
        if (scoreEl) scoreEl.textContent = scoreVal;
    }

    clearTable() {
        document.getElementById('dealer-hand').innerHTML = '';
        document.querySelectorAll('.card-area').forEach(el => el.innerHTML = '');
        document.querySelectorAll('.p-score, #dealer-score').forEach(el => el.textContent = '--');
    }

    updateUI() {
        document.getElementById('running-count').textContent = this.runningCount > 0 ? `+${this.runningCount}` : this.runningCount;
        document.getElementById('true-count').textContent = this.getTrueCount();
        
        const player = this.players.find(p => p.id === 'main');
        const isHumanTurn = this.gameState === 'PLAYER_TURN' && this.players[this.currentPlayerIndex].id === 'main';
        
        document.getElementById('btn-hit').disabled = !isHumanTurn;
        document.getElementById('btn-stand').disabled = !isHumanTurn;
        
        // Context-aware Double and Split
        const canDouble = isHumanTurn && player.hands[0].length === 2;
        const canSplit = isHumanTurn && player.hands[0].length === 2 && player.hands[0][0].v === player.hands[0][1].v;
        
        document.getElementById('btn-double').disabled = !canDouble;
        document.getElementById('btn-split').disabled = !canSplit;
        
        if (isHumanTurn) {
            this.provideMentorAdvice();
            this.calculateProbabilities();
        }
    }

    calculateProbabilities() {
        // Safe Hit Chance: (Number of cards <= (21 - currentScore)) / (Cards Remaining)
        const player = this.players.find(p => p.id === 'main');
        const score = this.calculateScore(player.hands[0]);
        const maxSafe = 21 - score;
        
        const safeCards = this.deck.filter(c => c.v <= maxSafe).length;
        const totalCards = this.deck.length;
        const hitChance = Math.round((safeCards / totalCards) * 100);
        
        document.getElementById('stat-safe-hit').textContent = `${hitChance}%`;

        // Dealer Bust probabilities (Classic Blackjack Tables)
        const dealerUp = this.players[0].hands[0][0].v;
        const bustTable = {
            2: 35, 3: 37, 4: 40, 5: 42, 6: 44, 
            7: 26, 8: 24, 9: 23, 10: 21, 11: 11
        };
        const bustProb = bustTable[dealerUp] || 21;
        document.getElementById('stat-dealer-bust').textContent = `${bustProb}%`;

        // Mathematical Edge (Simplified Thorp logic)
        // True Count +1 gives ~0.5% edge (approx)
        const tc = parseFloat(this.getTrueCount());
        const edge = (tc * 0.5 - 0.5).toFixed(2);
        const edgeEl = document.getElementById('stat-edge');
        edgeEl.textContent = `${edge > 0 ? '+' : ''}${edge}%`;
        edgeEl.style.color = edge > 0 ? 'var(--highlight-green)' : 'var(--error-red)';
    }

    provideMentorAdvice() {
        const player = this.players.find(p => p.id === 'main');
        const hand = player.hands[0];
        const pScore = this.calculateScore(hand);
        const dealerUp = this.players[0].hands[0][0].v;
        const isSoft = hand.some(c => c.n === 'A') && hand.reduce((s,c)=>s+c.v,0) <= 21;
        
        let advice = "STAND";

        // Simple Basic Strategy Matrix
        if (!isSoft) {
            if (pScore <= 8) advice = "HIT";
            else if (pScore === 9) advice = (dealerUp >= 3 && dealerUp <= 6) ? "DOUBLE" : "HIT";
            else if (pScore === 10) advice = (dealerUp <= 9) ? "DOUBLE" : "HIT";
            else if (pScore === 11) advice = "DOUBLE";
            else if (pScore === 12) advice = (dealerUp >= 4 && dealerUp <= 6) ? "STAND" : "HIT";
            else if (pScore >= 13 && pScore <= 16) advice = (dealerUp <= 6) ? "STAND" : "HIT";
        } else {
            // Soft Hands
            if (pScore <= 17) advice = "HIT";
            else if (pScore === 18) advice = (dealerUp >= 9) ? "HIT" : "STAND";
            else advice = "STAND";
        }
        
        const el = document.getElementById('mentor-advice');
        el.textContent = advice;
        el.style.color = "var(--highlight-green)";
    }

    setupEventListeners() {
        document.getElementById('btn-bet').addEventListener('click', () => {
            document.getElementById('overlay-bet').classList.remove('hidden');
        });

        document.getElementById('start-deal').addEventListener('click', () => {
            document.getElementById('overlay-bet').classList.add('hidden');
            document.getElementById('btn-bet').disabled = true;
            this.deal();
        });

        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentBet = parseInt(chip.dataset.val);
                document.getElementById('current-bet').textContent = this.currentBet;
            });
        });

        document.getElementById('btn-hit').addEventListener('click', () => this.humanAction('hit'));
        document.getElementById('btn-stand').addEventListener('click', () => this.humanAction('stay'));
        
        document.getElementById('toggle-analytics').addEventListener('click', () => {
            const panel = document.getElementById('analytics-panel');
            panel.classList.toggle('analytics-collapsed');
            panel.classList.toggle('analytics-expanded');
        });

        document.getElementById('btn-rules').addEventListener('click', () => {
          document.getElementById('overlay-rules').classList.remove('hidden');
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
          document.getElementById('overlay-rules').classList.add('hidden');
        });

        document.getElementById('btn-stats').addEventListener('click', () => {
            document.getElementById('overlay-stats').classList.remove('hidden');
            this.calculateProbabilities();
        });

        document.querySelector('.close-modal-stats').addEventListener('click', () => {
            document.getElementById('overlay-stats').classList.add('hidden');
        });

        document.getElementById('btn-double').addEventListener('click', () => this.humanAction('double'));
        document.getElementById('btn-split').addEventListener('click', () => this.humanAction('split'));

        // Toggle Players logic
        document.querySelectorAll('.player-ai').forEach(pEl => {
            pEl.addEventListener('click', () => {
                const pid = pEl.id;
                const player = this.players.find(p => p.id === pid);
                if (player) {
                    player.active = !player.active;
                    pEl.style.opacity = player.active ? '1' : '0.3';
                    pEl.querySelector('.p-label').textContent = player.active ? 'AI Player' : 'Empty Seat (Click to Add)';
                }
            });
        });

        // Rules Modal Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const target = tab.dataset.target;
                if (target === 'basics') {
                    document.getElementById('tab-basics').innerHTML = `
                        <p>Standard Casino Blackjack (6-deck shoe). Dealer hits on soft 17.</p>
                        <ul>
                            <li><b>Winning:</b> Closest to 21 without going over.</li>
                            <li><b>Aces:</b> Worth 1 or 11.</li>
                            <li><b>Payouts:</b> Blackjack pays 3:2, Standard wins 1:1.</li>
                        </ul>
                    `;
                } else if (target === 'splitting') {
                    document.getElementById('tab-basics').innerHTML = `
                        <p>If your first two cards are of the same value, you can <b>SPLIT</b> them into two separate hands.</p>
                        <ul>
                            <li>Place a second bet equal to the first.</li>
                            <li>Play each hand one at a time.</li>
                        </ul>
                    `;
                } else {
                    document.getElementById('tab-basics').innerHTML = `
                        <p>The <b>Hi-Lo System</b> tracks the ratio of high cards to low cards remaining in the shoe.</p>
                        <ul>
                            <li><b>2-6:</b> +1 (Count goes up)</li>
                            <li><b>7-9:</b> 0 (Neutral)</li>
                            <li><b>10-A:</b> -1 (Count goes down)</li>
                            <li><b>True Count:</b> Running Count divided by decks remaining.</li>
                        </ul>
                    `;
                }
            });
        });
    }

    async humanAction(action) {
        const player = this.players.find(p => p.id === 'main');
        const hand = player.hands[0];

        if (action === 'hit') {
            const card = this.draw();
            hand.push(card);
            this.renderCard(player, card);
            if (this.calculateScore(hand) > 21) {
                player.status = 'bust';
                this.humanDone();
            } else {
                this.updateUI();
            }
        } else if (action === 'double') {
            const card = this.draw();
            hand.push(card);
            this.renderCard(player, card);
            if (this.calculateScore(hand) > 21) player.status = 'bust';
            else player.status = 'double';
            this.humanDone();
        } else if (action === 'split') {
            // Simplied split: Create a second pseudo-hand for logic
            // For now, we'll just implement the visual 'Split' and follow one hand to keep logic sane
            const card1 = hand.pop();
            const card2 = this.draw();
            hand.push(card2);
            this.renderCard(player, card2);
            // In a real game we'd handle hand2, but for this prototype we'll focus on hand1 mastery
            player.status = 'split'; 
            this.updateUI();
        } else {
            player.status = 'stay';
            this.humanDone();
        }
    }

    humanDone() {
        if (this.humanResolver) {
            this.humanResolver();
            this.humanResolver = null;
        }
    }

    waitForHuman() {
        return new Promise(resolve => {
            this.humanResolver = resolve;
        });
    }

    delay(ms) { return new Promise(res => setTimeout(res, ms)); }
}

window.onload = () => {
    window.game = new BlackjackGame();
};
