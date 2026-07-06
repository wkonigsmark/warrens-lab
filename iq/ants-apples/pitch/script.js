(function () {
  const track = document.getElementById('deck-track');
  const slides = Array.from(track.children);
  const total = slides.length;

  const prevBtn = document.getElementById('nav-prev');
  const nextBtn = document.getElementById('nav-next');
  const dotsWrap = document.getElementById('deck-dots');
  const progressFill = document.getElementById('deck-progress-fill');
  const counterCurrent = document.getElementById('deck-counter-current');
  const counterTotal = document.getElementById('deck-counter-total');

  counterTotal.textContent = total;

  let index = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'deck-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    progressFill.style.width = `${((index + 1) / total) * 100}%`;
    counterCurrent.textContent = index + 1;
  }

  function goTo(i) {
    index = Math.max(0, Math.min(total - 1, i));
    render();
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === 'Home') {
      goTo(0);
    } else if (e.key === 'End') {
      goTo(total - 1);
    }
  });

  // Swipe support.
  // The track/slides declare `touch-action: pan-y` in CSS, which tells the
  // browser upfront that only vertical panning is native here — a horizontal
  // drag is never claimed as a native scroll/bounce in the first place. That
  // means we don't need to race the gesture with our own early direction-lock
  // + preventDefault (an earlier version of this did that, and it backfired:
  // locking direction after only ~8px is unreliable, since a real human swipe
  // often has a bit more vertical drift than horizontal in its very first few
  // pixels, which permanently misclassified genuine horizontal swipes as
  // vertical and silently dropped them). We can just read the net movement at
  // touchend and let touch-action handle the arbitration.
  let touchStartX = null;
  let touchStartY = null;
  let swipeCount = 0;
  const SWIPE_TRIGGER_PX = 40;

  // --- Temporary on-device diagnostics ---
  // Every fix so far has been validated against Chromium (via Playwright),
  // which can't reproduce real iOS Safari/WebKit touch-gesture behavior at
  // all — so passing that test has never actually proven anything about the
  // real bug. This panel shows exactly what the real device reports for each
  // swipe attempt, directly on screen, so it can be read/screenshotted after
  // a failed attempt instead of guessing again. Safe to delete once this is
  // sorted out.
  const debugEl = document.createElement('div');
  debugEl.id = 'swipe-debug';
  debugEl.style.cssText = 'position:fixed;left:6px;top:64px;z-index:999;' +
    'background:rgba(0,0,0,0.8);color:#7CFC7C;font:11px/1.4 monospace;' +
    'padding:6px 8px;border-radius:6px;max-width:92vw;white-space:pre-wrap;' +
    'pointer-events:none;';
  debugEl.textContent = 'swipe debug: waiting for a swipe...';
  document.body.appendChild(debugEl);

  track.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    swipeCount += 1;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartX;
    const dy = endY - touchStartY;
    const indexBefore = index;
    let decision = 'ignored (too short / too vertical)';
    if (Math.abs(dx) > SWIPE_TRIGGER_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) { goTo(index + 1); decision = 'advance ->'; }
      else { goTo(index - 1); decision = '<- back'; }
    }
    debugEl.textContent =
      `swipe #${swipeCount} | slide ${indexBefore + 1} -> ${index + 1}\n` +
      `dx=${dx.toFixed(0)} dy=${dy.toFixed(0)} decision: ${decision}`;
    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  track.addEventListener('touchcancel', () => {
    swipeCount += 1;
    debugEl.textContent = `swipe #${swipeCount} | touchcancel fired (gesture aborted by browser, no touchend)`;
    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  render();
})();
