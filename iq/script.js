/**
 * IQ Hub — script.js
 * Minimal. Just a subtle cursor glow that follows the mouse
 * to give the white canvas a sense of life without being showy.
 * Also handles collapsible category menus.
 */

// Setup collapsible categories (accordion behavior — only one open at a time)
function setupCategoryCollapsibles() {
    document.querySelectorAll('.category-header[data-target]').forEach(header => {
        header.addEventListener('click', function() {
            const body = document.getElementById(header.dataset.target);
            if (!body) return;

            // If this category is already open, just close it
            if (!body.hidden) {
                body.hidden = true;
                header.classList.remove('open');
                return;
            }

            // Close all other categories
            document.querySelectorAll('.category-header[data-target]').forEach(otherHeader => {
                const otherBody = document.getElementById(otherHeader.dataset.target);
                if (otherBody && !otherBody.hidden) {
                    otherBody.hidden = true;
                    otherHeader.classList.remove('open');
                }
            });

            // Open this category
            body.hidden = false;
            header.classList.add('open');
        });
    });
}

document.addEventListener('mousemove', (e) => {
    // Subtle warm glow that follows cursor — barely perceptible, like light through mist
    const glow = document.getElementById('cursor-glow');
    if (glow) {
        glow.style.left = `${e.clientX}px`;
        glow.style.top  = `${e.clientY}px`;
    }
});

// Inject the glow element once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    glow.style.cssText = `
        position: fixed;
        pointer-events: none;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(200,210,230,0.18) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: left 0.6s ease, top 0.6s ease;
        z-index: 0;
    `;
    document.body.appendChild(glow);

    // Setup collapsible categories
    setupCategoryCollapsibles();
});
