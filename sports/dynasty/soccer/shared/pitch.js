// Dynasty Soccer — pitch geometry, shared by the lineup builder and the printable sheet.
// Coordinate space is 0–100 in both axes: y = 0 is the opponent's goal line (attacking end),
// y = 100 is your own. Colour lives entirely in CSS so the same markup prints on white.

export const PITCH_VIEWBOX = '-6 -8 112 124';

/** Field markings only — no players. `stripes` paints mown bands (screen only). */
export function pitchMarkings({ stripes = true } = {}) {
  const bands = stripes
    ? [...Array(6)].map((_, i) => `<rect x="0" y="${i * 16.67}" width="100" height="8.33" class="stripe"/>`).join('')
    : '';
  return `
    <rect x="0" y="0" width="100" height="100" rx="1" class="turf"/>
    ${bands}
    <rect x="0" y="0" width="100" height="100" class="line-box"/>

    <line x1="0" y1="50" x2="100" y2="50" class="line"/>
    <circle cx="50" cy="50" r="12" class="line"/>
    <circle cx="50" cy="50" r="0.9" class="dot"/>

    <rect x="21" y="82"   width="58" height="18"  class="line"/>
    <rect x="36" y="93.5" width="28" height="6.5" class="line"/>
    <circle cx="50" cy="88" r="0.9" class="dot"/>
    <path d="M 44 82 A 8 8 0 0 0 56 82" class="line"/>

    <rect x="21" y="0" width="58" height="18"  class="line"/>
    <rect x="36" y="0" width="28" height="6.5" class="line"/>
    <circle cx="50" cy="12" r="0.9" class="dot"/>
    <path d="M 44 18 A 8 8 0 0 1 56 18" class="line"/>

    <path d="M 0 2.5 A 2.5 2.5 0 0 0 2.5 0"     class="line"/>
    <path d="M 97.5 0 A 2.5 2.5 0 0 0 100 2.5"  class="line"/>
    <path d="M 100 97.5 A 2.5 2.5 0 0 0 97.5 100" class="line"/>
    <path d="M 2.5 100 A 2.5 2.5 0 0 0 0 97.5"  class="line"/>`;
}
