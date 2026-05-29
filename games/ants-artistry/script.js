// ===== STATE =====
let currentCategory = null;
let selectedElement = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let isResizing = false;

const canvas = document.getElementById('canvas');
const gallery = document.getElementById('gallery');
const galleryGrid = document.getElementById('gallery-grid');
const galleryTitle = document.getElementById('gallery-title');
const sidebar = document.querySelector('.sidebar');
const propertiesPanel = document.getElementById('properties-panel');

// ===== CATEGORY SELECTION =====
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentCategory = btn.dataset.category;
        showGallery(currentCategory);
    });
});

// ===== GALLERY =====
function showGallery(category) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    event.target.closest('.category-btn').classList.add('active');

    gallery.classList.remove('hidden');
    galleryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);

    const images = imageDatabase[category] || [];
    galleryGrid.innerHTML = '';

    images.forEach(image => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.draggable = true;

        if (image.type === 'svg') {
            item.innerHTML = image.svg;
        } else {
            const img = document.createElement('img');
            img.src = image.src;
            item.appendChild(img);
        }

        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('image', JSON.stringify(image));
        });

        galleryGrid.appendChild(item);
    });
}

document.querySelector('.back-btn').addEventListener('click', () => {
    gallery.classList.add('hidden');
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
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

// ===== ADD ELEMENT TO CANVAS =====
function addElementToCanvas(imageData, x, y) {
    const element = document.createElement('div');
    element.className = 'canvas-element';
    element.style.left = x + 'px';
    element.style.top = y + 'px';
    element.style.width = '100px';
    element.style.height = '100px';

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
        if (e.target.classList.contains('resize-handle')) {
            startResize(e, element);
        } else {
            selectElement(element);
            startDrag(e, element);
        }
    });

    canvas.appendChild(element);
    selectElement(element);
}

// ===== ELEMENT SELECTION =====
function selectElement(element) {
    document.querySelectorAll('.canvas-element').forEach(el => {
        el.classList.remove('selected');
    });

    selectedElement = element;
    element.classList.add('selected');
    updatePropertiesPanel();
    propertiesPanel.classList.remove('hidden');
}

// ===== DRAGGING =====
function startDrag(e, element) {
    if (element.classList.contains('locked')) return;

    isDragging = true;
    const rect = element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    element.classList.add('dragging');

    function handleMouseMove(e) {
        if (!isDragging) return;

        const canvasRect = canvas.getBoundingClientRect();
        let newX = e.clientX - canvasRect.left - dragOffsetX;
        let newY = e.clientY - canvasRect.top - dragOffsetY;

        // Constrain to canvas
        newX = Math.max(0, Math.min(newX, canvas.offsetWidth - element.offsetWidth));
        newY = Math.max(0, Math.min(newY, canvas.offsetHeight - element.offsetHeight));

        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
    }

    function handleMouseUp() {
        isDragging = false;
        element.classList.remove('dragging');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// ===== RESIZING =====
function startResize(e, element) {
    if (element.classList.contains('locked')) return;

    isResizing = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.offsetWidth;
    const startHeight = element.offsetHeight;

    function handleMouseMove(e) {
        if (!isResizing) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const delta = Math.max(deltaX, deltaY);

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

// ===== PROPERTIES PANEL =====
function updatePropertiesPanel() {
    if (!selectedElement) return;

    const scale = (selectedElement.offsetWidth / 100) * 100;
    const rotation = parseInt(selectedElement.style.transform?.match(/rotate\((\d+)deg\)/) ? parseInt(selectedElement.style.transform.match(/rotate\((\d+)deg\)/)[1]) : 0);
    const isLocked = selectedElement.classList.contains('locked');

    document.getElementById('size-slider').value = scale;
    document.getElementById('size-display').textContent = Math.round(scale) + '%';

    document.getElementById('rotation-slider').value = rotation;
    document.getElementById('rotation-display').textContent = rotation + '°';

    document.getElementById('lock-checkbox').checked = isLocked;
}

// Size control
document.getElementById('size-slider').addEventListener('input', (e) => {
    if (!selectedElement) return;
    const scale = e.target.value / 100;
    const newSize = 100 * scale;
    selectedElement.style.width = newSize + 'px';
    selectedElement.style.height = newSize + 'px';
    document.getElementById('size-display').textContent = e.target.value + '%';
});

// Rotation control
document.getElementById('rotation-slider').addEventListener('input', (e) => {
    if (!selectedElement) return;
    const rotation = e.target.value;
    selectedElement.style.transform = `rotate(${rotation}deg)`;
    document.getElementById('rotation-display').textContent = rotation + '°';
});

// Lock control
document.getElementById('lock-checkbox').addEventListener('change', (e) => {
    if (!selectedElement) return;
    if (e.target.checked) {
        selectedElement.classList.add('locked');
    } else {
        selectedElement.classList.remove('locked');
    }
});

// Delete button
document.getElementById('delete-btn').addEventListener('click', () => {
    if (selectedElement) {
        selectedElement.remove();
        selectedElement = null;
        propertiesPanel.classList.add('hidden');
    }
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
        selectedElement = null;
        propertiesPanel.classList.add('hidden');
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
    const canvasHTML = canvas.innerHTML;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 0; }
                .canvas { width: 8.5in; height: 11in; background: white; }
                .canvas.landscape { width: 11in; height: 8.5in; }
            </style>
        </head>
        <body>
            <div class="canvas ${canvas.classList.contains('landscape') ? 'landscape' : ''}">
                ${canvasHTML}
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 250);
});

// Click outside to deselect
canvas.addEventListener('click', (e) => {
    if (e.target === canvas) {
        selectedElement?.classList.remove('selected');
        selectedElement = null;
        propertiesPanel.classList.add('hidden');
    }
});
