/* Ants & Amounts — "Build It!"  (pure vanilla)
   A pre-K counting game: tap to stack blocks into a tower that matches the
   target number. A voice counts each block aloud; on success the finished tower
   is re-counted to teach cardinality (last number = how many). No frameworks,
   no build step — just open index.html. */

(() => {
  'use strict';

  // ── Elements ───────────────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const targetEl = $('target');
  const towerEl = $('tower');
  const countBubble = $('countBubble');
  const stage = $('stage');
  const addBtn = $('addBtn');
  const resetBtn = $('resetBtn');
  const builtRow = $('builtRow');
  const soundBtn = $('soundBtn');
  const cheer = $('cheer');
  const cheerText = $('cheerText');
  const cheerEmoji = $('cheerEmoji');
  const confetti = $('confetti');
  const nextBtn = $('nextBtn');

  // ── State ──────────────────────────────────────────────────────────────
  const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const BLOCK_COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac', '#38d9a9'];
  const CHEERS = ['🎉', '🌟', '🥳', '🎈', '🏆', '💪'];

  let target = 3;
  let count = 0;
  let built = 0;        // how many towers finished
  let maxN = 3;         // grows as the child succeeds
  let lastTarget = 0;
  let busy = false;     // locked during the win re-count
  let soundOn = true;

  // ── Sound (native, synthesized — no audio files) ───────────────────────
  let audio = null;
  const ac = () => (audio ||= new (window.AudioContext || window.webkitAudioContext)());

  function blip(freq, dur = 0.12, type = 'sine', gain = 0.18) {
    if (!soundOn) return;
    try {
      const ctx = ac();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch (e) { /* audio not available — fine */ }
  }
  const popSound = (n) => blip(440 + n * 60, 0.12, 'triangle');   // rises as tower grows
  function winSound() {
    if (!soundOn) return;
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.18, 'sine', 0.2), i * 110));
  }

  // Speech (native Web Speech API). Guarded so it never breaks the game.
  function say(text) {
    if (!soundOn || !('speechSynthesis' in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95; u.pitch = 1.25; u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) { /* no-op */ }
  }
  const cancelSpeech = () => { try { window.speechSynthesis.cancel(); } catch (e) {} };

  // ── Rendering ──────────────────────────────────────────────────────────
  function renderTower(popIndex = -1) {
    towerEl.innerHTML = '';
    for (let i = 0; i < target; i++) {
      const slot = document.createElement('div');
      if (i < count) {
        slot.className = 'slot filled';
        slot.style.background = BLOCK_COLORS[i % BLOCK_COLORS.length];
        slot.textContent = i + 1;             // each block shows its count
        if (i === popIndex) slot.classList.add('pop');
      } else {
        slot.className = 'slot ghost';
      }
      towerEl.appendChild(slot);
    }
    countBubble.textContent = count;
    countBubble.classList.toggle('hidden', count === 0);
  }

  function newRound() {
    // Grow the range as the child builds more towers (cap at 10).
    maxN = Math.min(10, 3 + Math.floor(built / 2));
    let t = 1 + Math.floor(Math.random() * maxN);
    if (maxN > 1) while (t === lastTarget) t = 1 + Math.floor(Math.random() * maxN);
    lastTarget = t;
    target = t;
    count = 0;
    busy = false;
    addBtn.disabled = false;
    targetEl.textContent = target;
    renderTower();
    say(`Can you build ${NUMBER_WORDS[target]}?`);
  }

  // ── Actions ────────────────────────────────────────────────────────────
  function addBlock() {
    if (busy || count >= target) return;
    count++;
    renderTower(count - 1);
    popSound(count);
    say(NUMBER_WORDS[count]);            // count each block as it lands
    if (count === target) win();
  }

  function reset() {
    if (busy) return;
    cancelSpeech();
    count = 0;
    renderTower();
  }

  // Success: re-count the finished tower (teaches cardinality), then celebrate.
  function win() {
    busy = true;
    addBtn.disabled = true;
    cancelSpeech();
    const slots = towerEl.querySelectorAll('.slot.filled');
    const step = 480;

    // Re-count: light up each block bottom-to-top while speaking the number.
    slots.forEach((slot, i) => {
      setTimeout(() => {
        slot.classList.add('counting');
        setTimeout(() => slot.classList.remove('counting'), 400);
        say(NUMBER_WORDS[i + 1]);
        blip(440 + (i + 1) * 60, 0.12, 'triangle');
      }, i * step);
    });

    // Then the payoff.
    setTimeout(() => {
      built++;
      addStar();
      winSound();
      say(`${NUMBER_WORDS[target]}! You built ${NUMBER_WORDS[target]}! Great job!`);
      showCheer();
    }, target * step + 250);
  }

  function addStar() {
    const s = document.createElement('span');
    s.className = 'star';
    s.textContent = '⭐';
    builtRow.appendChild(s);
    // keep the row from overflowing forever
    if (builtRow.children.length > 12) builtRow.removeChild(builtRow.firstChild);
  }

  // ── Celebration overlay + confetti ─────────────────────────────────────
  function showCheer() {
    cheerEmoji.textContent = CHEERS[Math.floor(Math.random() * CHEERS.length)];
    cheerText.innerHTML = `You built <b>${target}</b>!`;
    cheer.classList.remove('hidden');
    burstConfetti();
  }

  function burstConfetti() {
    confetti.innerHTML = '';
    for (let i = 0; i < 40; i++) {
      const bit = document.createElement('div');
      bit.className = 'confetti-bit';
      bit.style.left = Math.random() * 100 + '%';
      bit.style.background = BLOCK_COLORS[i % BLOCK_COLORS.length];
      bit.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
      bit.style.animationDelay = Math.random() * 0.4 + 's';
      confetti.appendChild(bit);
    }
  }

  function nextRound() {
    cheer.classList.add('hidden');
    confetti.innerHTML = '';
    newRound();
  }

  // ── Wiring ─────────────────────────────────────────────────────────────
  addBtn.addEventListener('click', addBlock);
  stage.addEventListener('click', addBlock);
  stage.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addBlock(); } });
  resetBtn.addEventListener('click', reset);
  nextBtn.addEventListener('click', nextRound);

  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? '🔊' : '🔇';
    if (!soundOn) cancelSpeech();
  });

  // Some browsers need speech kicked off by a user gesture the first time.
  document.body.addEventListener('pointerdown', function warmUp() {
    try { ac().resume(); } catch (e) {}
    document.body.removeEventListener('pointerdown', warmUp);
  }, { once: true });

  // ── Go ─────────────────────────────────────────────────────────────────
  newRound();
})();
