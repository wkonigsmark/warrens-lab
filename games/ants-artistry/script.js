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
    food: '🍰', objects: '⭐', misc: '✨', sports: '⚽', flags: '🚩',
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
    // Default square until the image loads (then resized to its natural ratio)
    element.style.width = '100px';
    element.style.height = '100px';
    element.dataset.baseW = 100;
    element.dataset.baseH = 100;
    // Always place new elements on top
    const existing = canvas.querySelectorAll('.canvas-element');
    element.style.zIndex = existing.length + 1;

    if (imageData.type === 'svg') {
        element.innerHTML = imageData.svg;
    } else {
        const img = document.createElement('img');
        img.src = imageData.src;
        // Size the box to the image's aspect ratio (longest side = 100)
        img.addEventListener('load', () => {
            const nW = img.naturalWidth, nH = img.naturalHeight;
            if (!nW || !nH) return;
            const MAX = 100;
            const bw = nW >= nH ? MAX : MAX * nW / nH;
            const bh = nH >= nW ? MAX : MAX * nH / nW;
            element.dataset.baseW = bw;
            element.dataset.baseH = bh;
            element.style.width = bw + 'px';
            element.style.height = bh + 'px';
            if (selection.includes(element)) updatePropertiesPanel();
        });
        element.appendChild(img);
    }

    // Add resize handle
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    element.appendChild(handle);

    attachElementHandlers(element);
    canvas.appendChild(element);
    selectOnly(element);
    pushHistory();
}

// Wire up mouse interaction for an element (used on create AND on undo/redo restore)
function attachElementHandlers(element) {
    element.addEventListener('mousedown', (e) => {
        if (cropEl) return;  // ignore element interaction while cropping
        // While editing a text box, let clicks inside it position the caret
        if (element.classList.contains('editing')) { e.stopPropagation(); return; }
        e.stopPropagation(); // don't trigger canvas marquee
        if (e.target.classList.contains('resize-handle')) {
            selectOnly(element);
            startResize(e, element);
            return;
        }
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
            toggleInSelection(element);
            if (selection.includes(element)) startDrag(e);
        } else {
            if (!selection.includes(element)) selectOnly(element);
            startDrag(e);
        }
    });

    // Text boxes: double-click to edit
    if (element.classList.contains('text-element')) {
        element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            beginTextEdit(element);
        });
    }
}

// ===== TEXT BOXES =====
function addTextBox() {
    const el = document.createElement('div');
    el.className = 'canvas-element text-element';
    el.style.left = '120px';
    el.style.top = '120px';
    el.style.zIndex = (canvas.querySelectorAll('.canvas-element').length + 1);
    // Default text styling (stored on the element so it survives snapshots)
    el.style.fontFamily = "'Outfit', sans-serif";
    el.style.fontSize = '28px';

    const txt = document.createElement('div');
    txt.className = 'text-content';
    txt.textContent = 'Your text';
    el.appendChild(txt);

    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    el.appendChild(handle);

    attachElementHandlers(el);
    canvas.appendChild(el);
    selectOnly(el);
    pushHistory();
    // Jump straight into editing the placeholder
    beginTextEdit(el, true);
}

let editingTextEl = null;
function beginTextEdit(el, selectAll = false) {
    if (editingTextEl && editingTextEl !== el) endTextEdit();
    editingTextEl = el;
    el.classList.add('editing');
    const txt = el.querySelector('.text-content');
    txt.setAttribute('contenteditable', 'plaintext-only');
    txt.focus();

    const range = document.createRange();
    range.selectNodeContents(txt);
    if (!selectAll) range.collapse(false); // caret at end
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    txt.addEventListener('blur', onTextBlur);
}

function onTextBlur() { endTextEdit(); }

function endTextEdit() {
    if (!editingTextEl) return;
    const el = editingTextEl;
    const txt = el.querySelector('.text-content');
    txt.removeEventListener('blur', onTextBlur);
    txt.removeAttribute('contenteditable');
    el.classList.remove('editing');
    // Drop empty boxes
    if (txt.textContent.trim() === '') {
        el.remove();
        if (selection.includes(el)) clearSelection();
    }
    editingTextEl = null;
    pushHistory();
}

// ===== COPY / PASTE =====
// Clipboard holds detached clones of the copied elements (preserves size,
// crop dataURL, rotation, text styling — everything in the element markup).
let clipboard = [];
let pasteOffset = 0;

function copySelection() {
    if (!selection.length) return;
    // Store clones in z-order so paste re-stacks them correctly
    const ordered = [...selection].sort(
        (a, b) => (parseInt(a.style.zIndex) || 0) - (parseInt(b.style.zIndex) || 0)
    );
    clipboard = ordered.map(el => {
        const clone = el.cloneNode(true);
        clone.classList.remove('selected', 'primary', 'dragging', 'cropping', 'editing');
        clone.querySelectorAll('.crop-ui').forEach(n => n.remove());
        clone.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
        return clone;
    });
    pasteOffset = 0;
}

function pasteClipboard() {
    if (!clipboard.length) return;
    if (editingTextEl) endTextEdit();
    pasteOffset += 16;  // cascade each successive paste
    let zBase = canvas.querySelectorAll('.canvas-element').length;

    const pasted = [];
    clipboard.forEach(srcClone => {
        const el = srcClone.cloneNode(true);  // copy again so the clipboard stays reusable
        // Offset position, clamped to the canvas
        const left = (parseFloat(el.style.left) || 0) + pasteOffset;
        const top = (parseFloat(el.style.top) || 0) + pasteOffset;
        el.style.left = Math.max(0, Math.min(left, canvas.offsetWidth - 20)) + 'px';
        el.style.top = Math.max(0, Math.min(top, canvas.offsetHeight - 20)) + 'px';
        el.style.zIndex = ++zBase;  // paste on top
        attachElementHandlers(el);
        canvas.appendChild(el);
        pasted.push(el);
    });

    selection = pasted;
    refreshSelectionUI();
    pushHistory();
}

// ===== UNDO / REDO HISTORY =====
let history = [];
let histIndex = -1;
let isRestoring = false;

// A snapshot is the canvas markup with transient UI/classes stripped out
function snapshotCanvas() {
    const clone = canvas.cloneNode(true);
    clone.querySelectorAll('.crop-ui').forEach(n => n.remove());
    clone.querySelectorAll('.canvas-element').forEach(el =>
        el.classList.remove('selected', 'primary', 'dragging', 'cropping', 'editing'));
    // Don't persist contenteditable state in history
    clone.querySelectorAll('.text-content[contenteditable]').forEach(t =>
        t.removeAttribute('contenteditable'));
    return clone.innerHTML;
}

function pushHistory() {
    if (isRestoring) return;
    history = history.slice(0, histIndex + 1);   // drop any redo branch
    history.push(snapshotCanvas());
    if (history.length > 60) history.shift();
    histIndex = history.length - 1;
    updateUndoRedoButtons();
}

function restoreHistory(html) {
    isRestoring = true;
    if (cropEl) exitCrop();
    canvas.innerHTML = html;
    canvas.querySelectorAll('.canvas-element').forEach(attachElementHandlers);
    selection = [];
    refreshSelectionUI();
    isRestoring = false;
}

function undo() {
    if (cropEl) { exitCrop(); return; }
    if (histIndex > 0) {
        histIndex--;
        restoreHistory(history[histIndex]);
        updateUndoRedoButtons();
    }
}

function redo() {
    if (histIndex < history.length - 1) {
        histIndex++;
        restoreHistory(history[histIndex]);
        updateUndoRedoButtons();
    }
}

function updateUndoRedoButtons() {
    const u = document.getElementById('undo-btn');
    const r = document.getElementById('redo-btn');
    if (u) u.disabled = histIndex <= 0;
    if (r) r.disabled = histIndex >= history.length - 1;
}

// Debounced push for rapid actions (arrow-key nudging)
let histTimer = null;
function pushHistoryDebounced() {
    clearTimeout(histTimer);
    histTimer = setTimeout(pushHistory, 350);
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
    pushHistoryDebounced();
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
    let moved = false;

    function handleMouseMove(ev) {
        const [dx, dy] = clampGroupDelta(starts, ev.clientX - startX, ev.clientY - startY);
        if (dx || dy) moved = true;
        starts.forEach(s => {
            s.el.style.left = (s.left + dx) + 'px';
            s.el.style.top = (s.top + dy) + 'px';
        });
    }
    function handleMouseUp() {
        els.forEach(el => el.classList.remove('dragging'));
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        if (moved) pushHistory();   // only record an actual move, not a click
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// ===== RESIZING (single element) =====
function startResize(e, element) {
    if (element.classList.contains('locked')) return;

    isResizing = true;
    const startX = e.clientX, startY = e.clientY;
    const startWidth = element.offsetWidth;
    const startHeight = element.offsetHeight;
    const aspect = startWidth / startHeight;

    function handleMouseMove(ev) {
        if (!isResizing) return;
        const delta = Math.max(ev.clientX - startX, ev.clientY - startY);
        const newWidth = Math.max(40, startWidth + delta);
        element.style.width = newWidth + 'px';
        element.style.height = (newWidth / aspect) + 'px';  // keep aspect ratio
    }
    function handleMouseUp() {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        updatePropertiesPanel();
        pushHistory();
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

    const isText = p.classList.contains('text-element');
    const sizeGroup = document.getElementById('size-slider').closest('.property-group');

    if (isText) {
        // Text uses font-size, not box-scale — hide the % size slider
        sizeGroup.classList.add('hidden');
    } else {
        sizeGroup.classList.remove('hidden');
        const baseW = parseFloat(p.dataset.baseW) || 100;
        const scale = Math.round((p.offsetWidth / baseW) * 100);
        document.getElementById('size-slider').value = scale;
        document.getElementById('size-display').textContent = scale + '%';
    }

    const rotation = getRotation(p);
    document.getElementById('rotation-slider').value = rotation;
    document.getElementById('rotation-display').textContent = rotation + '°';

    const lockBox = document.getElementById('lock-checkbox');
    const lockedCount = selection.filter(el => el.classList.contains('locked')).length;
    lockBox.checked = lockedCount === selection.length;
    lockBox.indeterminate = lockedCount > 0 && lockedCount < selection.length;

    updateCropControls();
    updateTextControls();
}

// Show/sync text-formatting controls for a single selected text box
function updateTextControls() {
    const group = document.getElementById('text-group');
    const p = primary();
    const isText = selection.length === 1 && p && p.classList.contains('text-element');
    group.classList.toggle('hidden', !isText);
    if (!isText) return;

    document.getElementById('font-family').value =
        p.style.fontFamily || "'Outfit', sans-serif";
    const fs = parseInt(p.style.fontSize) || 28;
    document.getElementById('font-size').value = fs;
    document.getElementById('font-size-display').textContent = fs + 'px';
    document.getElementById('text-bold').classList.toggle('active', p.style.fontWeight === 'bold');
    document.getElementById('text-italic').classList.toggle('active', p.style.fontStyle === 'italic');
    document.getElementById('text-underline').classList.toggle('active', p.style.textDecoration.includes('underline'));
}

// Show/hide crop controls based on the current single selection
function updateCropControls() {
    const group = document.getElementById('crop-group');
    const cropBtn = document.getElementById('crop-btn');
    const resetBtn = document.getElementById('reset-crop-btn');
    const note = document.getElementById('crop-rotate-note');
    const p = primary();

    // Crop only makes sense for a single, unrotated image element
    const single = selection.length === 1 && p && !p.classList.contains('text-element');
    group.classList.toggle('hidden', !single);
    if (!single) return;

    const rotated = getRotation(p) !== 0;
    cropBtn.classList.toggle('hidden', rotated);
    note.classList.toggle('hidden', !rotated);
    resetBtn.classList.toggle('hidden', !p.dataset.origSrc);
}

// Size control — scales each selected element by its own base (preserves aspect)
document.getElementById('size-slider').addEventListener('input', (e) => {
    if (!selection.length) return;
    const factor = e.target.value / 100;
    selection.forEach(el => {
        const bw = parseFloat(el.dataset.baseW) || 100;
        const bh = parseFloat(el.dataset.baseH) || 100;
        el.style.width = (bw * factor) + 'px';
        el.style.height = (bh * factor) + 'px';
    });
    document.getElementById('size-display').textContent = e.target.value + '%';
});
document.getElementById('size-slider').addEventListener('change', () => {
    if (selection.length) pushHistory();
});

// Rotation control — applies to every selected element
document.getElementById('rotation-slider').addEventListener('input', (e) => {
    if (!selection.length) return;
    const rotation = e.target.value;
    selection.forEach(el => el.style.transform = `rotate(${rotation}deg)`);
    document.getElementById('rotation-display').textContent = rotation + '°';
    updateCropControls();   // crop hides while rotated
});
document.getElementById('rotation-slider').addEventListener('change', () => {
    if (selection.length) pushHistory();
});

// Lock control — applies to every selected element
document.getElementById('lock-checkbox').addEventListener('change', (e) => {
    if (!selection.length) return;
    selection.forEach(el => el.classList.toggle('locked', e.target.checked));
    pushHistory();
});

// Delete button — deletes all selected
function deleteSelection() {
    if (!selection.length) return;
    selection.forEach(el => el.remove());
    clearSelection();
    pushHistory();
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
    pushHistory();
}
document.getElementById('bring-forward-btn').addEventListener('click', () => layerOp(bringForward));
document.getElementById('send-back-btn').addEventListener('click', () => layerOp(sendBack));
document.getElementById('bring-front-btn').addEventListener('click', () => layerOp(bringToFront));
document.getElementById('send-back-all-btn').addEventListener('click', () => layerOp(sendToBack));

// ===== CROP =====
// cropEl: the element currently being cropped (null when not in crop mode)
// cropRect: the keep-region in element-box pixels {x,y,w,h}
// imgRect:  where the image actually renders inside the box (object-fit: contain)
let cropEl = null;
let cropRect = null;
let imgRect = null;
const MIN_CROP = 24;

function enterCrop() {
    const p = primary();
    if (!p || selection.length !== 1 || getRotation(p) !== 0) return;
    const img = p.querySelector('img');
    if (!img || !img.naturalWidth) return;

    cropEl = p;
    const W = p.offsetWidth, H = p.offsetHeight;
    const natW = img.naturalWidth, natH = img.naturalHeight;
    const scale = Math.min(W / natW, H / natH);  // object-fit: contain
    const dW = natW * scale, dH = natH * scale;
    const ox = (W - dW) / 2, oy = (H - dH) / 2;
    imgRect = { ox, oy, dW, dH, scale, natW, natH };
    cropRect = { x: ox, y: oy, w: dW, h: dH };   // start = whole image

    p.classList.add('cropping');
    buildCropUI();

    document.getElementById('crop-actions').classList.remove('hidden');
    document.getElementById('crop-group').classList.add('hidden');
}

function buildCropUI() {
    const ui = document.createElement('div');
    ui.className = 'crop-ui';

    // Four dimming panels around the keep-region (no overflow clipping needed)
    ['top', 'bottom', 'left', 'right'].forEach(side => {
        const m = document.createElement('div');
        m.className = 'crop-mask crop-mask-' + side;
        ui.appendChild(m);
    });

    const rect = document.createElement('div');
    rect.className = 'crop-rect';
    rect.addEventListener('mousedown', startRectDrag);   // drag to move the region
    ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach(dir => {
        const h = document.createElement('div');
        h.className = 'crop-handle h-' + dir;
        h.dataset.dir = dir;
        h.addEventListener('mousedown', startHandleDrag);
        rect.appendChild(h);
    });
    ui.appendChild(rect);
    cropEl.appendChild(ui);
    paintCropRect();
}

function paintCropRect() {
    const { x, y, w, h } = cropRect;
    const W = cropEl.offsetWidth, H = cropEl.offsetHeight;

    const rect = cropEl.querySelector('.crop-rect');
    rect.style.left = x + 'px';
    rect.style.top = y + 'px';
    rect.style.width = w + 'px';
    rect.style.height = h + 'px';

    const place = (sel, l, t, wd, ht) => {
        const m = cropEl.querySelector(sel);
        m.style.left = l + 'px';
        m.style.top = t + 'px';
        m.style.width = Math.max(0, wd) + 'px';
        m.style.height = Math.max(0, ht) + 'px';
    };
    place('.crop-mask-top', 0, 0, W, y);
    place('.crop-mask-bottom', 0, y + h, W, H - (y + h));
    place('.crop-mask-left', 0, y, x, h);
    place('.crop-mask-right', x + w, y, W - (x + w), h);
}

// Drag the whole keep-region around (constrained to the image area)
function startRectDrag(e) {
    if (e.target.classList.contains('crop-handle')) return;
    e.stopPropagation();
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const x0 = cropRect.x, y0 = cropRect.y;
    const { ox, oy, dW, dH } = imgRect;

    function move(ev) {
        let nx = x0 + (ev.clientX - sx);
        let ny = y0 + (ev.clientY - sy);
        nx = Math.max(ox, Math.min(ox + dW - cropRect.w, nx));
        ny = Math.max(oy, Math.min(oy + dH - cropRect.h, ny));
        cropRect.x = nx; cropRect.y = ny;
        paintCropRect();
    }
    function up() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
    }
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
}

function startHandleDrag(e) {
    e.stopPropagation();
    e.preventDefault();
    const dir = e.currentTarget.dataset.dir;
    const elRect = cropEl.getBoundingClientRect();
    const minX = imgRect.ox, maxX = imgRect.ox + imgRect.dW;
    const minY = imgRect.oy, maxY = imgRect.oy + imgRect.dH;

    function move(ev) {
        const lx = Math.max(minX, Math.min(maxX, ev.clientX - elRect.left));
        const ly = Math.max(minY, Math.min(maxY, ev.clientY - elRect.top));
        let L = cropRect.x, T = cropRect.y, R = cropRect.x + cropRect.w, B = cropRect.y + cropRect.h;
        if (dir.includes('w')) L = Math.min(lx, R - MIN_CROP);
        if (dir.includes('e')) R = Math.max(lx, L + MIN_CROP);
        if (dir.includes('n')) T = Math.min(ly, B - MIN_CROP);
        if (dir.includes('s')) B = Math.max(ly, T + MIN_CROP);
        cropRect = { x: L, y: T, w: R - L, h: B - T };
        paintCropRect();
    }
    function up() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
    }
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
}

function applyCrop() {
    if (!cropEl) return;
    const p = cropEl, img = p.querySelector('img');
    const { ox, oy, scale } = imgRect;

    // Map crop rect (box px) -> natural image px
    const nx = Math.round((cropRect.x - ox) / scale);
    const ny = Math.round((cropRect.y - oy) / scale);
    const nw = Math.round(cropRect.w / scale);
    const nh = Math.round(cropRect.h / scale);

    const cv = document.createElement('canvas');
    cv.width = nw; cv.height = nh;
    cv.getContext('2d').drawImage(img, nx, ny, nw, nh, 0, 0, nw, nh);
    const dataURL = cv.toDataURL('image/png');

    // Preserve the very-first original for Reset
    if (!p.dataset.origSrc) {
        p.dataset.origSrc = img.src;
        p.dataset.origLeft = p.offsetLeft;
        p.dataset.origTop = p.offsetTop;
        p.dataset.origW = p.offsetWidth;
        p.dataset.origH = p.offsetHeight;
        p.dataset.origBaseW = p.dataset.baseW;
        p.dataset.origBaseH = p.dataset.baseH;
    }

    // The kept region stays exactly where it was on screen
    const newLeft = p.offsetLeft + cropRect.x;
    const newTop = p.offsetTop + cropRect.y;
    img.src = dataURL;
    p.style.left = newLeft + 'px';
    p.style.top = newTop + 'px';
    p.style.width = cropRect.w + 'px';
    p.style.height = cropRect.h + 'px';
    // Cropped result becomes the new 100% baseline (keeps slider sensible)
    p.dataset.baseW = cropRect.w;
    p.dataset.baseH = cropRect.h;

    exitCrop();
    pushHistory();
}

function resetCrop() {
    const p = primary();
    if (!p || !p.dataset.origSrc) return;
    p.querySelector('img').src = p.dataset.origSrc;
    p.style.left = p.dataset.origLeft + 'px';
    p.style.top = p.dataset.origTop + 'px';
    p.style.width = p.dataset.origW + 'px';
    p.style.height = p.dataset.origH + 'px';
    p.dataset.baseW = p.dataset.origBaseW;
    p.dataset.baseH = p.dataset.origBaseH;
    delete p.dataset.origSrc;
    delete p.dataset.origLeft;
    delete p.dataset.origTop;
    delete p.dataset.origW;
    delete p.dataset.origH;
    delete p.dataset.origBaseW;
    delete p.dataset.origBaseH;
    updatePropertiesPanel();
    pushHistory();
}

function exitCrop() {
    if (cropEl) {
        cropEl.classList.remove('cropping');
        cropEl.querySelector('.crop-ui')?.remove();
    }
    cropEl = null; cropRect = null; imgRect = null;
    document.getElementById('crop-actions').classList.add('hidden');
    updatePropertiesPanel();
}

document.getElementById('crop-btn').addEventListener('click', enterCrop);
document.getElementById('crop-apply').addEventListener('click', applyCrop);
document.getElementById('crop-cancel').addEventListener('click', exitCrop);
document.getElementById('reset-crop-btn').addEventListener('click', resetCrop);

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

    // Crop mode takes priority: Enter applies, Esc cancels
    if (cropEl) {
        if (e.key === 'Enter') { e.preventDefault(); applyCrop(); }
        else if (e.key === 'Escape') { e.preventDefault(); exitCrop(); }
        return;
    }

    // While editing a text box, let the text field handle all keys (except Esc to finish)
    if (editingTextEl) {
        if (e.key === 'Escape') { e.preventDefault(); endTextEdit(); }
        return;
    }

    if (document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'SELECT' ||
        document.activeElement.isContentEditable) return;
    const cmd = e.metaKey || e.ctrlKey;

    // Esc deselects even when nothing is "actionable"
    if (e.key === 'Escape') { clearSelection(); return; }

    // ⌘Z undo / ⌘⇧Z redo (works regardless of current selection)
    if (cmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
    }

    // ⌘A — select all (works regardless of current selection)
    if (cmd && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selection = [...canvas.querySelectorAll('.canvas-element')];
        refreshSelectionUI();
        return;
    }

    // ⌘C copy / ⌘V paste / ⌘D duplicate
    if (cmd && e.key.toLowerCase() === 'c') {
        if (selection.length) { e.preventDefault(); copySelection(); }
        return;
    }
    if (cmd && e.key.toLowerCase() === 'v') {
        if (clipboard.length) { e.preventDefault(); pasteClipboard(); }
        return;
    }
    if (cmd && e.key.toLowerCase() === 'd') {
        if (selection.length) { e.preventDefault(); copySelection(); pasteClipboard(); }
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
    if (cropEl) return;              // don't start marquee while cropping
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
    if (!canvas.querySelector('.canvas-element')) return;
    if (confirm('Clear all elements from canvas? (You can undo this.)')) {
        canvas.innerHTML = '';
        clearSelection();
        pushHistory();
    }
});

// ===== SAVE AS PNG =====
document.getElementById('save-btn').addEventListener('click', async () => {
    // Using html2canvas library (you'd need to include this)
    alert('Save feature coming soon! For now, use Print and save as PDF.');
});

// ===== PRINT =====
document.getElementById('print-btn').addEventListener('click', () => {
    if (cropEl) exitCrop();  // never print mid-crop (would capture the crop UI)
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

// ===== TEXT CONTROL WIRING =====
document.getElementById('add-text-btn').addEventListener('click', addTextBox);

document.getElementById('font-family').addEventListener('change', (e) => {
    const p = primary();
    if (!p || !p.classList.contains('text-element')) return;
    p.style.fontFamily = e.target.value;
    pushHistory();
});

document.getElementById('font-size').addEventListener('input', (e) => {
    const p = primary();
    if (!p || !p.classList.contains('text-element')) return;
    p.style.fontSize = e.target.value + 'px';
    document.getElementById('font-size-display').textContent = e.target.value + 'px';
});
document.getElementById('font-size').addEventListener('change', () => {
    if (primary()?.classList.contains('text-element')) pushHistory();
});

function toggleTextStyle(prop, onVal, offVal) {
    const p = primary();
    if (!p || !p.classList.contains('text-element')) return;
    const cur = (prop === 'textDecoration')
        ? p.style.textDecoration.includes('underline')
        : p.style[prop] === onVal;
    p.style[prop] = cur ? offVal : onVal;
    updateTextControls();
    pushHistory();
}
document.getElementById('text-bold').addEventListener('click', () => toggleTextStyle('fontWeight', 'bold', 'normal'));
document.getElementById('text-italic').addEventListener('click', () => toggleTextStyle('fontStyle', 'italic', 'normal'));
document.getElementById('text-underline').addEventListener('click', () => toggleTextStyle('textDecoration', 'underline', 'none'));

// ===== UNDO / REDO WIRING =====
document.getElementById('undo-btn').addEventListener('click', undo);
document.getElementById('redo-btn').addEventListener('click', redo);

// Seed history with the initial (empty) canvas so the first action is undoable
pushHistory();
updateUndoRedoButtons();
