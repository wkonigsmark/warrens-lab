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

  render();
})();
