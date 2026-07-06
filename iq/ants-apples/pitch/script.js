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
  const SWIPE_TRIGGER_PX = 40;

  track.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > SWIPE_TRIGGER_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goTo(index + 1);
      else goTo(index - 1);
    }
    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  track.addEventListener('touchcancel', () => {
    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  render();
})();
