// ===== STATE =====
let currentCategory = null;
let selection = [];          // array of selected .canvas-element nodes
let isResizing = false;
let MANIFEST = null;

const NUDGE_SMALL = 2;       // px per arrow press
const NUDGE_LARGE = 20;      // px per shift+arrow press

// Primary element = last one added to the selection (drives the panel sliders)
function primary() { return selection[selection.length - 1] || null; }

const canvas = document.getElementById('canvas');
const gallery = document.getElementById('gallery');
const galleryGrid = document.getElementById('gallery-grid');
const galleryTitle = document.getElementById('gallery-title');
const sidebar = document.querySelector('.sidebar');
const propertiesPanel = document.getElementById('properties-panel');
const categoriesEl = document.getElementById('categories');

// Emoji per category (fallback to palette for any new folder)
const CATEGORY_ICONS = {
    animals: '🦁', constructs: '🏰', nature: '🌳', landscapes: '🏔️',
    food: '🍰', objects: '⭐', misc: '✨',
};

// ===== LOAD MANIFEST & BUILD CATEGORIES =====
init();

async function init() {
    try {
        const res = await fetch('assets/images/manifest.json?t=' + Date.now());
        MANIFEST = await res.json();
    } catch (e) {
        categoriesEl.innerHTML =
            '<p style="padding:12px;color:#999;font-size:0.85rem">Could not load images. ' +
            'Run <code>python3 catalog.py</code> to build the manifest.</p>';
        return;
    }
    buildCategories();
}

function buildCategories() {
    categoriesEl.innerHTML = '';
    const nonEmpty = MANIFEST.categoryOrder.filter(
        cat => MANIFEST.categories[cat].length > 0
    );
    // Switch to compact 2-col grid when there are 7 or more categories
    categoriesEl.classList.toggle('compact', nonEmpty.length >= 7);

    nonEmpty.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.dataset.category = cat;
        btn.innerHTML =
            `<span class="category-icon">${CATEGORY_ICONS[cat] || '🎨'}</span>` +
            `<span>${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>`;
        btn.addEventListener('click', () => {
            currentCategory = cat;
            showGallery(cat, btn);
        });
        categoriesEl.appendChild(btn);
    });
}

// ===== GALLERY =====
function renderGalleryItems(entries, titleText) {
    gallery.classList.remove('hidden');
    galleryTitle.textContent = titleText;
    galleryGrid.innerHTML = '';

    if (!entries.length) {
        galleryGrid.innerHTML = '<p class="gallery-empty">No matches found.</p>';
        return;
    }

    entries.forEach(entry => {
        const image = { type: 'png', src: entry.src, label: entry.label };
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.title = entry.label;
        item.draggable = true;

        const img = document.createElement('img');
        img.src = image.src;
        img.alt = entry.label;
        item.appendChild(img);

        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('image', JSON.stringify(image));
        });

        galleryGrid.appendChild(item);
    });
}

function showGallery(category, btn) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderGalleryItems(
        MANIFEST.categories[category] || [],
        category.charAt(0).toUpperCase() + category.slice(1)
    );
}

document.querySelector('.back-btn').addEventListener('click', () => {
    gallery.classList.add('hidden');
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
});

// ===== SEARCH (across all categories) =====
function flatIndex() {
    const all = [];
    MANIFEST.categoryOrder.forEach(cat => {
        MANIFEST.categories[cat].forEach(e => all.push({ ...e, category: cat }));
    });
    return all;
}

const searchInput = document.getElementById('element-search');
const searchClear = document.getElementById('search-clear');

searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    searchClear.classList.toggle('hidden', q === '');

    if (q === '') {
        gallery.classList.add('hidden');
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        return;
    }
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    const results = flatIndex().filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.label.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
    renderGalleryItems(results, `Search: “${searchInput.value.trim()}” (${results.length})`);
});

searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
    searchInput.focus();
});

// ===== SHORTCUTS OVERLAY =====
const shortcutsOverlay = document.getElementById('shortcuts-overlay');
function openShortcuts() { shortcutsOverlay.classList.remove('hidden'); }
function closeShortcuts() { shortcutsOverlay.classList.add('hidden'); }

document.getElementById('help-btn').addEventListener('click', openShortcuts);
document.getElementById('shortcuts-close').addEventListener('click', closeShortcuts);
shortcutsOverlay.addEventListener('click', (e) => {
    if (e.target === shortcutsOverlay) closeShortcuts(); // click backdrop
});

// ===== CANVAS DRAG & DROP =====
canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    canvas.style.background = '#f0f5ff';
});

canvas.addEventListener('dragleave', () => {
    canvas.style.background = 'white';
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    canvas.style.background = 'white';

    const imageData = JSON.parse(e.dataTransfer.getData('image'));
    const rect = canvas.getBoundingClientRect();
    const canvasRect = canvas.parentElement.getBoundingClientRect();

    const x = e.clientX - canvasRect.left - (canvas.offsetLeft || 0);
    const y = e.clientY - canvasRect.top - (canvas.offsetTop || 0);

    addElementToCanvas(imageData, x, y);
});

// ===== LAYER MANAGEMENT =====
function getElementsByZ() {
    return [...canvas.querySelectorAll('.canvas-element')]
        .sort((a, b) => (parseInt(a.style.zIndex) || 0) - (parseInt(b.style.zIndex) || 0));
}

function normalizeZ() {
    getElementsByZ().forEach((el, i) => el.style.zIndex = i + 1);
}

function bringForward(el) {
    const els = getElementsByZ();
    const idx = els.indexOf(el);
    if (idx < els.length - 1) {
        const z = parseInt(el.style.zIndex) || 1;
        const next = els[idx + 1];
        el.style.zIndex = parseInt(next.style.zIndex) || z + 1;
        next.style.zIndex = z;
    }
}

function sendBack(el) {
    const els = getElementsByZ();
    const idx = els.indexOf(el);
    if (idx > 0) {
        const z = parseInt(el.style.zIndex) || 1;
        const prev = els[idx - 1];
        el.style.zIndex = parseInt(prev.style.zIndex) || z - 1;
        prev.style.zIndex = z;
    }
}

function bringToFront(el) {
    normalizeZ();
    const els = getElementsByZ();
    el.style.zIndex = els.length;
    // Re-normalize to keep gaps clean
    const others = els.filter(e => e !== el);
    others.forEach((e, i) => e.style.zIndex = i + 1);
    el.style.zIndex = others.length + 1;
}

function sendToBack(el) {
    normalizeZ();
    const els = getElementsByZ();
    const others = els.filter(e => e !== el);
    el.style.zIndex = 1;
    others.forEach((e, i) => e.style.zIndex = i + 2);
}

// ===== ADD ELEMENT TO CANVAS =====
function addElementToCanvas(imageData, x, y) {
    const element = document.createElement('div');
    element.className = 'canvas-element';
    element.style.left = x + 'px';
    element.style.top = y + 'px';
    element.style.width = '100px';
    element.style.height = '100px';
    // Always place new elements on top
    const existing = canvas.querySelectorAll('.canvas-element');
    element.style.zIndex = existing.length + 1;

    if (imageData.type === 'svg') {
        element.innerHTML = imageData.svg;
    } else {
        const img = document.createElement('img');
        img.src = imageData.src;
        element.appendChild(img);
    }

    // Add resize handle
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    element.appendChild(handle);

    // Mouse events
    element.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // don't trigger canvas marquee
        if (e.target.classList.contains('resize-handle')) {
            // Resize only operates on a single element
            selectOnly(element);
            startResize(e, element);
            return;
        }

        if (e.shiftKey || e.metaKey || e.ctrlKey) {
            // Toggle this element in/out of the selection
            toggleInSelection(element);
            if (selection.includes(element)) startDrag(e); // drag the group
        } else {
            // If clicking an element already in a multi-selection, keep the group
            if (!selection.includes(element)) selectOnly(element);
            startDrag(e);
        }
    });

    canvas.appendChild(element);
    selectOnly(element);
}

// ===== SELECTION MODEL =====
function refreshSelectionUI() {
    document.querySelectorAll('.canvas-element').forEach(el => {
        el.classList.toggle('selected', selection.includes(el));
        el.classList.remove('primary');
    });
    // Only a single selection shows the resize handle (via .primary)
    canvas.classList.toggle('multi', selection.length > 1);
    if (selection.length === 1) selection[0].classList.add('primary');

    if (selection.length === 0) {
        propertiesPanel.classList.add('hidden');
    } else {
        propertiesPanel.classList.remove('hidden');
        updatePropertiesPanel();
        keepPanelInView();
    }
}

function selectOnly(element) {
    selection = [element];
    refreshSelectionUI();
}

function toggleInSelection(element) {
    const i = selection.indexOf(element);
    if (i === -1) selection.push(element);
    else selection.splice(i, 1);
    refreshSelectionUI();
}

function addToSelection(element) {
    if (!selection.includes(element)) selection.push(element);
    refreshSelectionUI();
}

function clearSelection() {
    selection = [];
    refreshSelectionUI();
}

function movable() {
    return selection.filter(el => !el.classList.contains('locked'));
}

// ===== GROUP MOVE (clamped so the whole group stays on canvas) =====
function clampGroupDelta(starts, dx, dy) {
    const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
    let minDx = -Infinity, maxDx = Infinity, minDy = -Infinity, maxDy = Infinity;
    starts.forEach(s => {
        minDx = Math.max(minDx, -s.left);
        maxDx = Math.min(maxDx, cw - (s.left + s.w));
        minDy = Math.max(minDy, -s.top);
        maxDy = Math.min(maxDy, ch - (s.top + s.h));
    });
    return [
        Math.max(minDx, Math.min(maxDx, dx)),
        Math.max(minDy, Math.min(maxDy, dy)),
    ];
}

function nudgeSelection(dx, dy) {
    const els = movable();
    if (!els.length) return;
    const starts = els.map(el => ({
        el, left: el.offsetLeft, top: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight,
    }));
    const [cdx, cdy] = clampGroupDelta(starts, dx, dy);
    starts.forEach(s => {
        s.el.style.left = (s.left + cdx) + 'px';
        s.el.style.top = (s.top + cdy) + 'px';
    });
}

// ===== DRAGGING (moves the whole selection together) =====
function startDrag(e) {
    const els = movable();
    if (!els.length) return;

    const startX = e.clientX, startY = e.clientY;
    const starts = els.map(el => ({
        el, left: el.offsetLeft, top: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight,
    }));
    els.forEach(el => el.classList.add('dragging'));

    function handleMouseMove(ev) {
        const [dx, dy] = clampGroupDelta(starts, ev.clientX - startX, ev.clientY - startY);
        starts.forEach(s => {
            s.el.style.left = (s.left + dx) + 'px';
            s.el.style.top = (s.top + dy) + 'px';
        });
    }
    function handleMouseUp() {
        els.forEach(el => el.classList.remove('dragging'));
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// ===== RESIZING (single element) =====
function startResize(e, element) {
    if (element.classList.contains('locked')) return;

    isResizing = true;
    const startX = e.clientX;
    const startWidth = element.offsetWidth;

    function handleMouseMove(ev) {
        if (!isResizing) return;
        const delta = Math.max(ev.clientX - startX, ev.clientY - e.clientY);
        const newSize = Math.max(50, startWidth + delta);
        element.style.width = newSize + 'px';
        element.style.height = newSize + 'px';
    }
    function handleMouseUp() {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        updatePropertiesPanel();
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// ===== HELPERS =====
function getRotation(el) {
    const m = el.style.transform && el.style.transform.match(/rotate\((-?\d+)deg\)/);
    return m ? parseInt(m[1]) : 0;
}

// ===== PROPERTIES PANEL =====
function updatePropertiesPanel() {
    const p = primary();
    if (!p) return;

    const title = document.getElementById('properties-title');
    title.textContent = selection.length > 1
        ? `${selection.length} elements selected`
        : 'Selected Element';

    const scale = Math.round((p.offsetWidth / 100) * 100);
    document.getElementById('size-slider').value = scale;
    document.getElementById('size-display').textContent = scale + '%';

    const rotation = getRotation(p);
    document.getElementById('rotation-slider').value = rotation;
    document.getElementById('rotation-display').textContent = rotation + '°';

    const lockBox = document.getElementById('lock-checkbox');
    const lockedCount = selection.filter(el => el.classList.contains('locked')).length;
    lockBox.checked = lockedCount === selection.length;
    lockBox.indeterminate = lockedCount > 0 && lockedCount < selection.length;
}

// Size control — applies to every selected element
document.getElementById('size-slider').addEventListener('input', (e) => {
    if (!selection.length) return;
    const newSize = 100 * (e.target.value / 100);
    selection.forEach(el => {
        el.style.width = newSize + 'px';
        el.style.height = newSize + 'px';
    });
    document.getElementById('size-display').textContent = e.target.value + '%';
});

// Rotation control — applies to every selected element
document.getElementById('rotation-slider').addEventListener('input', (e) => {
    if (!selection.length) return;
    const rotation = e.target.value;
    selection.forEach(el => el.style.transform = `rotate(${rotation}deg)`);
    document.getElementById('rotation-display').textContent = rotation + '°';
});

// Lock control — applies to every selected element
document.getElementById('lock-checkbox').addEventListener('change', (e) => {
    if (!selection.length) return;
    selection.forEach(el => el.classList.toggle('locked', e.target.checked));
});

// Delete button — deletes all selected
function deleteSelection() {
    selection.forEach(el => el.remove());
    clearSelection();
}
document.getElementById('delete-btn').addEventListener('click', deleteSelection);

// Layer order buttons — apply to all selected (ordered to avoid self-collisions)
function layerOp(op) {
    if (!selection.length) return;
    const ordered = [...selection].sort(
        (a, b) => (parseInt(a.style.zIndex) || 0) - (parseInt(b.style.zIndex) || 0)
    );
    if (op === bringForward || op === bringToFront) ordered.reverse();
    ordered.forEach(el => op(el));
}
document.getElementById('bring-forward-btn').addEventListener('click', () => layerOp(bringForward));
document.getElementById('send-back-btn').addEventListener('click', () => layerOp(sendBack));
document.getElementById('bring-front-btn').addEventListener('click', () => layerOp(bringToFront));
document.getElementById('send-back-all-btn').addEventListener('click', () => layerOp(sendToBack));

// ===== DRAGGABLE / COLLAPSIBLE PROPERTIES PANEL =====
const panelHeader = document.getElementById('panel-header');
const panelCollapse = document.getElementById('panel-collapse');
const PANEL_KEY = 'ants-artistry-panel';

function setPanelPos(left, top) {
    propertiesPanel.style.left = left + 'px';
    propertiesPanel.style.top = top + 'px';
    propertiesPanel.style.right = 'auto';
    propertiesPanel.style.bottom = 'auto';
}

function savePanel() {
    const r = propertiesPanel.getBoundingClientRect();
    localStorage.setItem(PANEL_KEY, JSON.stringify({
        left: r.left, top: r.top,
        collapsed: propertiesPanel.classList.contains('collapsed'),
    }));
}

// Keep the panel fully inside the viewport (called when shown / dragged / resized)
function keepPanelInView() {
    if (propertiesPanel.classList.contains('hidden')) return;
    const r = propertiesPanel.getBoundingClientRect();
    const maxLeft = window.innerWidth - r.width - 6;
    const maxTop = window.innerHeight - r.height - 6;
    const left = Math.max(6, Math.min(maxLeft, r.left));
    const top = Math.max(6, Math.min(maxTop, r.top));
    setPanelPos(left, top);
}

// Drag via the header
panelHeader.addEventListener('mousedown', (e) => {
    if (e.target === panelCollapse) return;     // collapse button handles itself
    const r = propertiesPanel.getBoundingClientRect();
    const offX = e.clientX - r.left;
    const offY = e.clientY - r.top;
    e.preventDefault();

    function move(ev) {
        setPanelPos(ev.clientX - offX, ev.clientY - offY);
    }
    function up() {
        keepPanelInView();
        savePanel();
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
    }
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
});

// Collapse / expand
panelCollapse.addEventListener('click', (e) => {
    e.stopPropagation();
    const collapsed = propertiesPanel.classList.toggle('collapsed');
    panelCollapse.textContent = collapsed ? '+' : '–';
    keepPanelInView();
    savePanel();
});

// Restore saved position / collapsed state on load
(function restorePanel() {
    try {
        const s = JSON.parse(localStorage.getItem(PANEL_KEY));
        if (!s) return;
        if (s.collapsed) {
            propertiesPanel.classList.add('collapsed');
            panelCollapse.textContent = '+';
        }
        if (typeof s.left === 'number') setPanelPos(s.left, s.top);
    } catch (_) { /* ignore */ }
})();

window.addEventListener('resize', keepPanelInView);

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Shortcuts overlay takes priority: close on X / Esc, swallow other keys
    if (!shortcutsOverlay.classList.contains('hidden')) {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
            e.preventDefault();
            closeShortcuts();
        }
        return;
    }

    if (document.activeElement.tagName === 'INPUT') return;
    const cmd = e.metaKey || e.ctrlKey;

    // Esc deselects even when nothing is "actionable"
    if (e.key === 'Escape') { clearSelection(); return; }

    // ⌘A — select all (works regardless of current selection)
    if (cmd && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selection = [...canvas.querySelectorAll('.canvas-element')];
        refreshSelectionUI();
        return;
    }

    if (!selection.length) return;

    // ⌘↑ / ⌘↓ (+shift) — layer ordering
    if (cmd && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        if (e.key === 'ArrowUp') layerOp(e.shiftKey ? bringToFront : bringForward);
        else layerOp(e.shiftKey ? sendToBack : sendBack);
        return;
    }

    // Plain arrows — nudge (shift = larger step)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? NUDGE_LARGE : NUDGE_SMALL;
        if (e.key === 'ArrowUp') nudgeSelection(0, -step);
        else if (e.key === 'ArrowDown') nudgeSelection(0, step);
        else if (e.key === 'ArrowLeft') nudgeSelection(-step, 0);
        else if (e.key === 'ArrowRight') nudgeSelection(step, 0);
        return;
    }

    // Delete / Backspace — remove selection
    if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelection();
        return;
    }
});

// ===== MARQUEE (drag-to-select on empty canvas) =====
let marqueeEl = null;
canvas.addEventListener('mousedown', (e) => {
    if (e.target !== canvas) return; // only on empty canvas
    const additive = e.shiftKey || e.metaKey || e.ctrlKey;
    if (!additive) clearSelection();

    const canvasRect = canvas.getBoundingClientRect();
    const startX = e.clientX - canvasRect.left;
    const startY = e.clientY - canvasRect.top;
    let moved = false;

    marqueeEl = document.createElement('div');
    marqueeEl.className = 'marquee';
    canvas.appendChild(marqueeEl);

    const baseSelection = [...selection];

    function handleMouseMove(ev) {
        moved = true;
        const cx = ev.clientX - canvasRect.left;
        const cy = ev.clientY - canvasRect.top;
        const x = Math.min(startX, cx), y = Math.min(startY, cy);
        const w = Math.abs(cx - startX), h = Math.abs(cy - startY);
        Object.assign(marqueeEl.style, {
            left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px',
        });

        // Compute which elements intersect the marquee
        const hits = [...canvas.querySelectorAll('.canvas-element')].filter(el => {
            const l = el.offsetLeft, t = el.offsetTop, r = l + el.offsetWidth, b = t + el.offsetHeight;
            return !(r < x || l > x + w || b < y || t > y + h);
        });
        selection = additive ? [...new Set([...baseSelection, ...hits])] : hits;
        refreshSelectionUI();
    }
    function handleMouseUp() {
        marqueeEl?.remove();
        marqueeEl = null;
        if (!moved && !additive) clearSelection(); // plain click = deselect
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
});

// ===== CANVAS ORIENTATION =====
document.getElementById('portrait-btn').addEventListener('click', () => {
    canvas.classList.remove('landscape');
    canvas.classList.add('portrait');
    document.getElementById('portrait-btn').classList.add('active');
    document.getElementById('landscape-btn').classList.remove('active');
});

document.getElementById('landscape-btn').addEventListener('click', () => {
    canvas.classList.remove('portrait');
    canvas.classList.add('landscape');
    document.getElementById('landscape-btn').classList.add('active');
    document.getElementById('portrait-btn').classList.remove('active');
});

// ===== CLEAR CANVAS =====
document.getElementById('clear-canvas-btn').addEventListener('click', () => {
    if (confirm('Clear all elements from canvas? This cannot be undone.')) {
        canvas.innerHTML = '';
        clearSelection();
    }
});

// ===== SAVE AS PNG =====
document.getElementById('save-btn').addEventListener('click', async () => {
    // Using html2canvas library (you'd need to include this)
    alert('Save feature coming soon! For now, use Print and save as PDF.');
});

// ===== PRINT =====
document.getElementById('print-btn').addEventListener('click', () => {
    const printWindow = window.open('', '_blank');
    const isLandscape = canvas.classList.contains('landscape');

    // Deselect so selection borders/handles don't appear on print
    const wasSelected = [...selection];
    selection.forEach(el => el.classList.remove('selected', 'primary'));

    const canvasHTML = canvas.innerHTML;

    // Use absolute URL for the watermark — print window is on about:blank
    const watermarkSrc = `${location.origin}/games/ants-artistry/assets/banners/text_banner_ants_artisty.png`;
    const orientation = isLandscape ? 'landscape' : 'portrait';

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<style>
  @page { size: ${orientation}; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: white; }

  /* Canvas must be position:relative so absolute children land correctly */
  .canvas {
    position: relative;
    width: 8.5in;
    height: 11in;
    background: white;
    overflow: hidden;
  }
  .canvas.landscape {
    width: 11in;
    height: 8.5in;
  }

  /* THIS was missing — without it all elements stack at top-left */
  .canvas-element {
    position: absolute;
  }
  .canvas-element img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
    display: block;
  }

  /* Strip interactive chrome */
  .canvas-element.selected { border: none !important; outline: none !important; }
  .resize-handle { display: none !important; }

  /* Watermark — tiny, bottom-right */
  .print-watermark {
    position: absolute;
    bottom: 0.22in;
    right: 0.28in;
    width: 0.68in;
    height: auto;
    opacity: 0.4;
    pointer-events: none;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
</style>
</head>
<body>
<div class="canvas ${orientation === 'landscape' ? 'landscape' : ''}">
  ${canvasHTML}
  <img class="print-watermark" src="${watermarkSrc}" alt="Ants &amp; Artistry">
</div>
</body>
</html>`);

    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        // Restore selection state in main window
        selection = wasSelected;
        refreshSelectionUI();
    }, 300);
});
