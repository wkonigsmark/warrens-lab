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
  // Slides taller than the viewport scroll internally (overflow-y: auto), so a
  // swipe that starts with any vertical component competes with native scroll —
  // if we wait until touchend to look at the total delta, the browser has often
  // already claimed the gesture as a scroll and our delta never reads as a clean
  // horizontal swipe. Instead we lock the gesture's direction as soon as it's
  // clear (a few px of movement) and preventDefault on touchmove once we know
  // it's horizontal, so native scrolling never gets a chance to steal it.
  let touchStartX = null;
  let touchStartY = null;
  let touchDirection = null; // 'horizontal' | 'vertical' | null (undecided)
  const DIRECTION_LOCK_PX = 8;
  const SWIPE_TRIGGER_PX = 40;

  track.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDirection = null;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (touchStartX === null || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;

    if (touchDirection === null && (Math.abs(dx) > DIRECTION_LOCK_PX || Math.abs(dy) > DIRECTION_LOCK_PX)) {
      touchDirection = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    }
    if (touchDirection === 'horizontal') {
      e.preventDefault(); // claim the gesture so vertical scroll can't intercept it
    }
  }, { passive: false });

  track.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    if (touchDirection === 'horizontal') {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > SWIPE_TRIGGER_PX) {
        if (dx < 0) goTo(index + 1);
        else goTo(index - 1);
      }
    }
    touchStartX = null;
    touchStartY = null;
    touchDirection = null;
  }, { passive: true });

  track.addEventListener('touchcancel', () => {
    touchStartX = null;
    touchStartY = null;
    touchDirection = null;
  }, { passive: true });

  render();
})();
