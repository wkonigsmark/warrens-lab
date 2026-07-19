// music-nav.js — one sticky navigation bar for the entire /music domain. Drop it
// into any tool with a single, depth-independent line:
//   <script type="module" src="/music/_shared/music-nav.js"></script>
// It reads the shared registry, highlights the current tool, shows the current
// zone's sibling tools as quick pills, and offers an "All tools" menu to jump
// anywhere. Styles are injected here, so a tool needs no extra <link>.

import { MUSIC_HOME, ZONES, TOOLS, toolsInZone, currentTool, currentZone } from './registry.js';

const CSS = `
.mnav { position: sticky; top: 0; z-index: 900;
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  padding: 8px 16px; background: rgba(255,255,255,0.96); backdrop-filter: blur(6px);
  border-bottom: 1px solid #e3e7f1; font-family: 'Outfit', system-ui, sans-serif; }
.mnav a { text-decoration: none; }
.mnav-home { font-weight: 800; color: #1f2430; font-size: 14px;
  display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.mnav-home:hover { color: #ff8a3d; }
.mnav-zone { font-size: 12px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase;
  color: #9aa1b2; white-space: nowrap; }
.mnav-pills { display: flex; gap: 7px; flex-wrap: wrap; flex: 1 1 auto; }
.mnav-pill { font-size: 13px; font-weight: 700; color: #6b7280;
  padding: 5px 12px; border-radius: 999px; border: 1px solid #e3e7f1; background: #fff;
  display: inline-flex; align-items: center; gap: 5px; transition: all 0.12s ease; }
.mnav-pill:hover { border-color: #5b8cff; color: #5b8cff; }
.mnav-pill.active { background: #5b8cff; color: #fff; border-color: #5b8cff; }
.mnav-badge { font-size: 9px; font-weight: 800; letter-spacing: 0.5px; color: #fff;
  background: #ff8a3d; border-radius: 999px; padding: 1px 5px; }
.mnav-menu { position: relative; margin-left: auto; }
.mnav-menu-btn { font: inherit; font-size: 13px; font-weight: 700; color: #1f2430; cursor: pointer;
  padding: 6px 12px; border-radius: 999px; border: 1px solid #e3e7f1; background: #fff;
  display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.mnav-menu-btn:hover { border-color: #5b8cff; color: #5b8cff; }
.mnav-panel { position: absolute; right: 0; top: calc(100% + 8px); width: 280px; max-height: 70vh;
  overflow-y: auto; background: #fff; border: 1px solid #e3e7f1; border-radius: 14px;
  box-shadow: 0 16px 40px rgba(31,36,48,0.18); padding: 10px; display: none; }
.mnav-panel.open { display: block; }
.mnav-group { padding: 6px 8px 2px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;
  text-transform: uppercase; color: #9aa1b2; }
.mnav-item { display: flex; align-items: center; gap: 9px; padding: 8px; border-radius: 10px; color: #1f2430; }
.mnav-item:hover { background: #f2f5fd; }
.mnav-item.active { background: #eef3ff; }
.mnav-item .mi-icon { font-size: 16px; width: 20px; text-align: center; }
.mnav-item .mi-name { font-size: 13.5px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
.mnav-item .mi-tag { font-size: 11px; color: #8a90a0; }
@media print { .mnav { display: none !important; } }
@media (max-width: 640px) { .mnav-zone { display: none; } .mnav-pills { order: 3; width: 100%; } }
`;

const badge = (t) => (t.status === 'beta' ? `<span class="mnav-badge">BETA</span>` : '');

function build() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const cur = currentTool();
    const zone = currentZone();
    const siblings = zone ? toolsInZone(zone.id) : [];

    const nav = document.createElement('nav');
    nav.className = 'mnav';
    nav.setAttribute('aria-label', 'Music navigation');

    const pills = siblings.map((t) =>
        `<a class="mnav-pill${cur && t.id === cur.id ? ' active' : ''}" href="${t.path}">${t.icon} ${t.short}${badge(t)}</a>`
    ).join('');

    const menuGroups = ZONES.map((z) => {
        const items = toolsInZone(z.id).map((t) =>
            `<a class="mnav-item${cur && t.id === cur.id ? ' active' : ''}" href="${t.path}">`
            + `<span class="mi-icon">${t.icon}</span>`
            + `<span><span class="mi-name">${t.name}${badge(t)}</span><br><span class="mi-tag">${t.tagline}</span></span>`
            + `</a>`
        ).join('');
        return `<div class="mnav-group">${z.icon} ${z.name}</div>${items}`;
    }).join('');

    nav.innerHTML =
        `<a class="mnav-home" href="${MUSIC_HOME.path}">⌂ ${MUSIC_HOME.icon} Music</a>`
        + (zone ? `<span class="mnav-zone">${zone.name}</span>` : '')
        + `<div class="mnav-pills">${pills}</div>`
        + `<div class="mnav-menu">`
        + `<button class="mnav-menu-btn" aria-haspopup="true" aria-expanded="false">▾ All tools</button>`
        + `<div class="mnav-panel" role="menu">${menuGroups}</div>`
        + `</div>`;

    document.body.insertBefore(nav, document.body.firstChild);

    // "All tools" dropdown: toggle, close on outside-click / Escape.
    const btn = nav.querySelector('.mnav-menu-btn');
    const panel = nav.querySelector('.mnav-panel');
    const setOpen = (open) => { panel.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); };
    btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!panel.classList.contains('open')); });
    document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
else build();
