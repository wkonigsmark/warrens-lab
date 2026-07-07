// Viva CFP site header: one embedded nav shared by every page.
// Include with <script src="PATH/nav.js" data-root="PATH-TO-CFB-ROOT"></script>
// Primary row = dashboard sections (hash-routed tabs); hamburger = other pages.
// Add sections/pages here — never build another ad-hoc button.
(function () {
  const root = (document.currentScript.dataset.root || '.').replace(/\/$/, '');
  const SECTIONS = [
    ['index', 'The Index'],
    ['top25', 'ESPN Top 25'],
    ['teams', 'Teams'],
    ['schedule', 'Schedule'],
    ['bracket', 'Playoff Bracket'],
    ['learn', 'Learn'],
  ];
  const PAGES = [
    ['🧪', 'Data Lab', `${root}/data-lab.html`],
    ['🎞️', 'Blueprint Deck', `${root}/blueprint/index.html`],
    ['🏟️', 'Sports Hub', `${root}/../index.html`],
  ];

  const style = document.createElement('style');
  style.textContent = `
    .cfb-header {
      position: sticky; top: 0; z-index: 4000;
      display: flex; align-items: center; gap: 10px;
      height: 58px; padding: 0 14px;
      background: rgba(18, 7, 9, 0.92); backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(169, 126, 47, 0.45);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
    }
    .cfb-brand {
      font-family: 'Alfa Slab One', 'Rockwell', serif;
      font-size: 1.02rem; color: #f2c464; text-decoration: none;
      text-shadow: 0 0 10px rgba(242, 196, 100, 0.5);
      white-space: nowrap; letter-spacing: 1px;
    }
    .cfb-brand .viva {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic; color: #ff4d5e; margin-right: 5px;
      text-shadow: 0 0 8px rgba(255, 77, 94, 0.7);
    }
    .cfb-header-nav {
      display: flex; gap: 2px; flex: 1;
      overflow-x: auto; scrollbar-width: none;
    }
    .cfb-header-nav::-webkit-scrollbar { display: none; }
    .cfb-header-nav.can-scroll {
      -webkit-mask-image: linear-gradient(90deg, black calc(100% - 34px), transparent);
      mask-image: linear-gradient(90deg, black calc(100% - 34px), transparent);
    }
    .cfb-header-nav a {
      font-family: 'Oswald', 'Outfit', sans-serif;
      font-size: 0.74rem; letter-spacing: 1px; text-transform: uppercase;
      color: rgba(245, 233, 208, 0.6); text-decoration: none;
      padding: 8px 10px; border-radius: 20px; white-space: nowrap;
      transition: color 0.15s ease, background 0.15s ease;
    }
    .cfb-header-nav a:hover { color: #f5e9d0; }
    .cfb-header-nav a.active { background: #c8102e; color: white; }
    .cfb-nav-btn {
      width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
      background: rgba(242, 196, 100, 0.08);
      border: 1px solid #a97e2f; color: #f2c464;
      font-size: 1rem; cursor: pointer;
      transition: box-shadow 0.2s ease;
    }
    .cfb-nav-btn:hover { box-shadow: 0 0 12px rgba(242, 196, 100, 0.4); }
    .cfb-nav-panel {
      position: fixed; top: 64px; right: 12px; z-index: 4000;
      background: rgba(20, 9, 11, 0.96); backdrop-filter: blur(12px);
      border: 1px solid #a97e2f; border-radius: 14px;
      padding: 8px; min-width: 190px; display: none;
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6);
    }
    .cfb-nav-panel.open { display: block; }
    .cfb-nav-panel a {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 9px;
      color: rgba(245, 233, 208, 0.85); text-decoration: none;
      font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 600;
    }
    .cfb-nav-panel a:hover { background: rgba(242, 196, 100, 0.1); color: #f2c464; }
    .cfb-nav-panel a.current { color: #f2c464; background: rgba(242, 196, 100, 0.07); pointer-events: none; }
    @media (max-width: 640px) {
      .cfb-header { padding: 0 8px; gap: 5px; }
      .cfb-brand { font-size: 0.85rem; }
      .cfb-brand .viva { margin-right: 3px; }
      .cfb-header-nav a { padding: 8px 6px; font-size: 0.64rem; letter-spacing: 0.5px; }
      .cfb-nav-btn { width: 34px; height: 34px; }
    }
  `;
  document.head.appendChild(style);

  const dashboardPath = new URL(`${root}/index.html`, location.href).pathname;
  const onDashboard = location.pathname === dashboardPath ||
    location.pathname + 'index.html' === dashboardPath;

  const header = document.createElement('header');
  header.className = 'cfb-header';
  header.innerHTML = `
    <a class="cfb-brand" href="${root}/index.html#index"><span class="viva">Viva</span>CFP</a>
    <nav class="cfb-header-nav">
      ${SECTIONS.map(([key, label]) =>
        `<a href="${root}/index.html#${key}" data-key="${key}">${label}</a>`).join('')}
    </nav>
    <button class="cfb-nav-btn" aria-label="More pages" aria-expanded="false">☰</button>
  `;

  const panel = document.createElement('div');
  panel.className = 'cfb-nav-panel';
  const here = location.pathname.replace(/\/$/, '');
  panel.innerHTML = PAGES.map(([icon, label, href]) => {
    const target = new URL(href, location.href).pathname.replace(/\/$/, '');
    const current = here === target || here + '/index.html' === target;
    return `<a href="${href}" class="${current ? 'current' : ''}">${icon} ${label}</a>`;
  }).join('');

  function refreshActive() {
    const key = onDashboard ? (location.hash.replace('#', '') || 'index') : null;
    header.querySelectorAll('.cfb-header-nav a').forEach(a =>
      a.classList.toggle('active', a.dataset.key === key));
  }
  window.addEventListener('hashchange', refreshActive);

  // fade the right edge while more sections are hidden off-screen
  const navRow = header.querySelector('.cfb-header-nav');
  function refreshScrollHint() {
    navRow.classList.toggle('can-scroll',
      navRow.scrollLeft + navRow.clientWidth < navRow.scrollWidth - 2);
  }
  navRow.addEventListener('scroll', refreshScrollHint, { passive: true });
  window.addEventListener('resize', refreshScrollHint);
  window.addEventListener('load', refreshScrollHint);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshScrollHint);

  const btn = header.querySelector('.cfb-nav-btn');
  function toggle(open) {
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  }
  btn.addEventListener('click', e => { e.stopPropagation(); toggle(!panel.classList.contains('open')); });
  document.addEventListener('click', e => { if (!panel.contains(e.target)) toggle(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });

  document.body.prepend(header);
  document.body.appendChild(panel);
  refreshActive();
  refreshScrollHint();
})();
