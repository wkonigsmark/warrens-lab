// zone-nav.js — a compact "switch tool" strip injected at the top of each tool in
// the Composer Studio. Add it to any tool with a single line:
//   <script type="module" src="../_shared/zone-nav.js"></script>
// It infers the current tool from the URL and highlights it. Styles are injected
// here too, so a tool needs no extra <link>.

import { STUDIO, ZONE_TOOLS, currentToolId } from './zone.js';

const CSS = `
.zone-nav {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 8px 18px; background: #fff; border-bottom: 1px solid #e3e7f1;
  font-family: 'Outfit', system-ui, sans-serif; position: sticky; top: 0; z-index: 900;
  flex-wrap: wrap;
}
.zone-nav .zone-home { font-weight: 800; color: #1f2430; text-decoration: none; font-size: 14px; display: inline-flex; gap: 6px; align-items: center; }
.zone-nav .zone-home:hover { color: #ff8a3d; }
.zone-nav .zone-links { display: flex; gap: 8px; flex-wrap: wrap; }
.zone-nav .zone-pill {
  text-decoration: none; font-size: 13px; font-weight: 700; color: #6b7280;
  padding: 6px 12px; border-radius: 999px; border: 1px solid #e3e7f1; background: #fff;
  transition: all 0.12s ease;
}
.zone-nav .zone-pill:hover { border-color: #5b8cff; color: #5b8cff; }
.zone-nav .zone-pill.active { background: #5b8cff; color: #fff; border-color: #5b8cff; }
@media print { .zone-nav { display: none !important; } }
`;

function build() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const cur = currentToolId();
    const nav = document.createElement('nav');
    nav.className = 'zone-nav';
    nav.setAttribute('aria-label', 'Composer Studio tools');
    nav.innerHTML =
        `<a class="zone-home" href="${STUDIO.hub}">⌂ ${STUDIO.name}</a>`
        + `<div class="zone-links">`
        + ZONE_TOOLS.map((t) =>
            `<a class="zone-pill${t.id === cur ? ' active' : ''}" href="${t.path}">${t.icon} ${t.short}</a>`
        ).join('')
        + `</div>`;
    document.body.insertBefore(nav, document.body.firstChild);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
else build();
